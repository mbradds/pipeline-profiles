import pandas as pd
from util import get_data, idify, company_rename, get_company_list
import os
import json
import datetime
import numpy as np
script_dir = os.path.dirname(__file__)

'''
TODO:
    - add get_data from util to other py scripts
    - raise error after id's are applied if a record is longer
      than the max length of id's' (done)
    - create a general purpose function for thisCompanyData creation
      with data, meta, build parameters
'''

# all data before August 15, 2018 is unreliable and should be cut out
minDate = datetime.datetime(2018, 9, 15)


def optimizeJson(df):
    del df['Company Name']
    df = df[df['Final Submission Date'] >= minDate].copy().reset_index(drop=True)
    del df['Final Submission Date']
    # filter out non valid years. This needs to be dealt with better
    df = df[df['y'] >= 0].copy().reset_index(drop=True)
    df = df.sort_values(by=['y'])
    df = df.to_dict(orient="records")
    return df


def meta(df, company):
    metaData = {}
    metaData["company"] = company

    df_old = df[df['Final Submission Date'] < minDate].copy().reset_index(drop=True)
    df = df[df['Final Submission Date'] >= minDate].copy().reset_index(drop=True)

    metaData['old'] = int(len(df_old.index))
    metaData['new'] = int(len(df.index))
    # this is better added in the front end
    # metaData["cutoff"] = [minDate.year, minDate.month, minDate.day]
    soilVolume = df["vol"].sum()
    metaData["soil"] = {'total': int(soilVolume),
                        'pools': round((soilVolume/2500), 1)}

    return metaData


# TODO: make this into general purpose util and use in conditions
def applyContaminantIds(df, cont, colName="Contaminants at the Site"):
    values = {en.strip(): str(i) for i, en in zip(cont['id'], cont['e'])}
    newCol = []
    for what in df[colName]:
        what = str(what)
        if ";" in what:
            what = what.split(";")
            what = [x.strip() for x in what]
            what = [values[x] for x in what]
            newCol.append(what)
        else:
            newCol.append(None)
    df[colName] = newCol
    return df


def process_remediation(sql=False, companies=False, test=False):
    df = get_data(sql=sql,
                  script_dir=script_dir,
                  query="remediation.sql",
                  db="dsql22cap")

    contaminants = get_data(sql=sql,
                            script_dir=script_dir,
                            query="remediationContaminants.sql",
                            db="dsql22cap")

    df = applyContaminantIds(df, contaminants)

    for delete in ['Pipeline Name',
                   'Facility Name',
                   'Facility Type',
                   'Product Carried',
                   'NearestPopulatedCentre']:

        del df[delete]

    for stringCol in ['Applicable Land Use',
                      'Site Status',
                      'Activity At Time']:
        df[stringCol] = [str(x).strip() for x in df[stringCol]]

    # add id's
    landUseId = {
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

    statusIds = {
        "monitored": "m",
        "post-remediation monitoring": "prm",
        "facility monitoring": "fm",
        "ongoing remediation": "or",
        "site assessment": "sa",
        "risk managed": "rm"
        }

    activityIds = {
        "maintenance": "m",
        "operation": "o",
        "construction": "c",
        "abandonment": "a"
        }

    df = idify(df, "Applicable Land Use", landUseId)
    df = idify(df, "Province", "region")
    df = idify(df, "Site Status", statusIds)
    df = idify(df, "Activity At Time", activityIds)

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

    for intNumeric in ['y', 'Initial Estimate of Contaminated soil m3']:
        df[intNumeric] = df[intNumeric].astype(int)

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

    if companies:
        company_files = companies
    else:
        company_files = get_company_list("all")

    for company in company_files:
        folder_name = company.replace(' ', '').replace('.', '')
        df_c = df[df['Company Name'] == company].copy().reset_index(drop=True)
        thisCompanyData = {}

        if not df_c.empty:
            thisCompanyData["meta"] = meta(df_c, company)
            thisCompanyData["build"] = True
            thisCompanyData["data"] = optimizeJson(df_c)
            if not test:
                with open('../data_output/remediation/'+folder_name+'.json', 'w') as fp:
                    json.dump(thisCompanyData, fp)
        else:
            thisCompanyData['data'] = df_c.to_dict(orient='records')
            thisCompanyData['meta'] = {"companyName": company}
            thisCompanyData["build"] = False
            if not test:
                with open('../data_output/remediation/'+folder_name+'.json', 'w') as fp:
                    json.dump(thisCompanyData, fp)

    return df


if __name__ == "__main__":
    df = process_remediation(sql=True)  # , companies=["NOVA Gas Transmission Ltd."])

