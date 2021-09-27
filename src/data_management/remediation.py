import os
import json
import datetime
import numpy as np
import pandas as pd
from util import get_data, idify, company_rename, get_company_list, normalize_text, apply_system_id
script_dir = os.path.dirname(__file__)

'''
TODO:
    - add get_data from util to other py scripts
    - raise error after id's are applied if a record is longer
      than the max length of id's' (done)
    - create a general purpose function for this_company_data creation
      with data, meta, build parameters
'''

# all data before August 15, 2018 is unreliable and should be cut out
MIN_DATE = datetime.datetime(2018, 9, 15)


def optimize_json(df):
    del df['Company Name']
    df = df[df['Final Submission Date'] >= MIN_DATE].copy().reset_index(drop=True)
    del df['Final Submission Date']
    # filter out non valid years. This needs to be dealt with better
    df = df[df['y'] >= 0].copy().reset_index(drop=True)
    df = df.sort_values(by=['y'])
    df = df.to_dict(orient="records")
    return df


def meta(df, company):
    meta_data = {}
    meta_data["companyName"] = company

    df_old = df[df['Final Submission Date'] < MIN_DATE].copy().reset_index(drop=True)
    df = df[df['Final Submission Date'] >= MIN_DATE].copy().reset_index(drop=True)

    meta_data['old'] = int(len(df_old.index))
    meta_data['new'] = int(len(df.index))
    # this is better added in the front end
    # meta_data["cutoff"] = [MIN_DATE.year, MIN_DATE.month, MIN_DATE.day]

    # remediation folks dont want this info
    # soilVolume = df["vol"].sum()
    # meta_data["soil"] = {'total': int(soilVolume),
    #                     'pools': round((soilVolume/2500), 1)}

    return meta_data


# TODO: make this into general purpose util and use in conditions
def apply_contaminant_ids(df, cont, col_name="Contaminants at the Site"):
    values = {en.strip(): str(i) for i, en in zip(cont['id'], cont['e'])}
    new_col = []
    for what in df[col_name]:
        what = str(what)
        if ";" in what:
            what = what.split(";")
            what = [x.strip() for x in what]
            what = [values[x] for x in what]
            new_col.append(what)
        else:
            new_col.append(None)
    df[col_name] = new_col
    return df


def process_remediation(sql=False, companies=False, test=False):
    df = get_data(sql=sql,
                  script_loc=script_dir,
                  query="remediation.sql",
                  db="dsql22cap")

    contaminants = get_data(sql=sql,
                            script_loc=script_dir,
                            query="remediationContaminants.sql",
                            db="dsql22cap")

    df = apply_contaminant_ids(df, contaminants)
    df["Contaminants at the Site"] = [["18"] if x == None else x for x in df["Contaminants at the Site"]]

    for delete in ['Facility Type',
                   'Product Carried',
                   'NearestPopulatedCentre']:

        del df[delete]

    df = normalize_text(df, ['Applicable Land Use',
                             'Site Status',
                             'Activity At Time',
                             'Pipeline Name',
                             'Facility Name'])

    pipe_section = []
    na = "Not Specified"
    for pipe, section in zip(df['Pipeline Name'], df['Facility Name']):
        if pipe == na and section == na:
            pipe_section.append(na)
        elif pipe == na and section != na:
            pipe_section.append("Facility")
        elif pipe != na and section == na:
            pipe_section.append("Pipeline")
        elif pipe != na and section != na:
            pipe_section.append("Pipeline and Facility")
        else:
            print("error here!")

    df["ps"] = pipe_section
    del df['Pipeline Name']
    del df['Facility Name']

    # add id's
    land_use_ids = {
        "developed land - industrial": "dli",
        "developed land - small commercial": "dls",
        "developed land - residential": "dlr",
        "barren land": "bl",
        "shrub land": "sl",
        "vegetative barren": "vb",
        "forests": "f",
        "Agricultural Cropland": "ac",
        "water / wetlands": "w",
        "Tundra / Native Prairie / Parks": "t",
        "agricultural land": "al",
        "protected area": "pa",
        "non-developed land": "ndl"
        }

    status_ids = {
        "monitored": "m",
        "post-remediation monitoring": "prm",
        "facility monitoring": "fm",
        "ongoing remediation": "or",
        "site assessment": "sa",
        "risk managed": "rm"
        }

    activity_ids = {
        "maintenance": "m",
        "operation": "o",
        "construction": "c",
        "abandonment": "a"
        }

    df = idify(df, "Applicable Land Use", land_use_ids)
    df = idify(df, "Province", "region")
    df = idify(df, "Site Status", status_ids)
    df = idify(df, "Activity At Time", activity_ids)

    df['Final Submission Date'] = pd.to_datetime(df['Final Submission Date'])
    df['y'] = df['Final Submission Date'].dt.year

    df = df.fillna(value=np.nan)
    for ns in ['Applicable Land Use',
               'Activity At Time',
               'Contaminants at the Site',
               'Initial Estimate of Contaminated soil m3',
               'Is site within 30 m of waterbody',
               'Site Status',
               'Latitude',
               'Longitude']:

        df[ns] = [None if x in ["Not Specified", np.nan, "nan"] else x for x in df[ns]]

    for numeric in ['Initial Estimate of Contaminated soil m3',
                    'Latitude',
                    'Longitude',
                    'y']:

        df[numeric] = df[numeric].replace(np.nan, int(-1))

    for int_numeric in ['y', 'Initial Estimate of Contaminated soil m3']:
        df[int_numeric] = df[int_numeric].astype(int)

    df['loc'] = [[lat, long] for lat, long in zip(df['Latitude'],
                                                  df['Longitude'])]
    del df['Latitude']
    del df['Longitude']

    df = df.rename(columns={"EventNumber": "id",
                            "Site Status": "s",
                            "Activity At Time": "a",
                            "Province": "p",
                            "Applicable Land Use": "use",
                            "Contaminants at the Site": "c",
                            "Initial Estimate of Contaminated soil m3": "vol",
                            "Is site within 30 m of waterbody": "w"})

    df['Company Name'] = df['Company Name'].replace(company_rename())
    df = apply_system_id(df, "Company Name")

    if companies:
        company_files = companies
    else:
        company_files = get_company_list("all")

    for company in company_files:
        folder_name = company.replace(' ', '').replace('.', '')
        df_c = df[df['Company Name'] == company].copy().reset_index(drop=True)
        this_company_data = {}

        if not df_c.empty:
            this_company_data["meta"] = meta(df_c, company)
            this_company_data["build"] = True
            this_company_data["data"] = optimize_json(df_c)
            if not test:
                with open('../data_output/remediation/'+folder_name+'.json', 'w') as fp:
                    json.dump(this_company_data, fp)
        else:
            this_company_data['data'] = df_c.to_dict(orient='records')
            this_company_data['meta'] = {"companyName": company}
            this_company_data["build"] = False
            if not test:
                with open('../data_output/remediation/'+folder_name+'.json', 'w') as fp:
                    json.dump(this_company_data, fp)

    return df


if __name__ == "__main__":
    df_ = process_remediation(sql=False)
