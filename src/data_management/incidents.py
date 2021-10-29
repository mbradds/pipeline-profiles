import pandas as pd
from util import company_rename, most_common, idify, get_company_list, apply_system_id
import ssl
import json
ssl._create_default_https_context = ssl._create_unverified_context


def incident_meta_data(df, company):

    def most_common_substance(df, meta):
        df_substance = df[df['Substance'] != "Not Applicable"].copy()
        meta = most_common(df_substance, meta, "Substance", "mostCommonSubstance")
        return meta

    def other_types(df):
        serious = {"Adverse Environmental Effects": 0,
                   "Fatality": 0,
                   "Serious Injury (CER or TSB)": 0}

        for type_list in df['Incident Types']:
            type_list = [x.strip() for x in type_list.split(",")]
            for t in type_list:
                if t in serious:
                    serious[t] = serious[t] + 1
        return serious

    # filter to specific company
    df_c = df[df['Company'] == company].copy()
    meta = {}
    meta['companyName'] = company
    meta['seriousEvents'] = other_types(df_c)
    meta['release'] = int(df_c['Approximate Volume Released'].notnull().sum())
    meta['nonRelease'] = int(df_c['Approximate Volume Released'].isna().sum())

    meta = most_common(df_c, meta, "what common", "mostCommonWhat")
    meta = most_common(df_c, meta, "why common", "mostCommonWhy")

    meta["mostCommonWhat"] = [x.strip() for x in meta["mostCommonWhat"].split(" & ")]
    meta["mostCommonWhy"] = [x.strip() for x in meta["mostCommonWhy"].split(" & ")]
    meta = most_common_substance(df_c, meta)
    return meta


def fix_columns(df):
    new_cols = {x: x.split("(")[0].strip() for x in df.columns}
    df = df.rename(columns=new_cols)
    return df


def process_english(df):

    def replace_what_why(df, col_name, values):
        new_col = []
        for what in df[col_name]:
            what = what.split(",")
            what = [x.strip() for x in what]
            what = [values[x] for x in what]
            new_col.append(what)

        df[col_name] = new_col
        return df

    df = fix_columns(df)
    df['Substance'] = df['Substance'].replace({'Butane': 'Natural Gas Liquids'})
    chosen_substances = ["Propane","Natural Gas - Sweet",
                         "Natural Gas - Sour",
                         "Fuel Gas",
                         "Lube Oil",
                         "Crude Oil - Sweet",
                         "Crude Oil - Synthetic",
                         "Crude Oil - Sour",
                         "Natural Gas Liquids",
                         "Condensate",
                         # "Sulphur Dioxide",
                         "Diesel Fuel",
                         "Gasoline"]
    df['Substance'] = [x if x in chosen_substances else "Other" for x in df['Substance']]
    # custom codes for product
    df['Substance'] = df['Substance'].replace({'Propane': 'pro',
                                               'Natural Gas - Sweet': 'ngsweet',
                                               'Natural Gas - Sour': 'ngsour',
                                               'Fuel Gas': 'fgas',
                                               'Lube Oil': 'loil',
                                               'Crude Oil - Sweet': 'cosweet',
                                               'Crude Oil - Synthetic': 'sco',
                                               'Crude Oil - Sour': 'cosour',
                                               'Natural Gas Liquids': 'ngl',
                                               'Condensate': 'co',
                                               'Diesel Fuel': 'diesel',
                                               'Gasoline': 'gas'
                                               })
    df = idify(df, "Province", "region")
    what = {"Defect and Deterioration": "dd",
            "Corrosion and Cracking": "cc",
            "Equipment Failure": "ef",
            "Incorrect Operation": "io",
            "External Interference": "ei",
            "Natural Force Damage": "nfd",
            "Other Causes": "oc",
            "To be determined": "tbd"}

    why = {"Engineering and Planning": "ep",
           "Maintenance": "m",
           "Inadequate Procurement": "ip",
           "Tools and Equipment": "te",
           "Standards and Procedures": "sp",
           "Failure in communication": "fc",
           "Inadequate Supervision": "is",
           "Human Factors": "hf",
           "Natural or Environmental Forces": "ef",
           "To be determined": "tbd"}

    df = replace_what_why(df, "What Happened", what)
    df = replace_what_why(df, "Why It Happened", why)
    df["what common"] = [", ".join(x) for x in df["What Happened"]]
    df["why common"] = [", ".join(x) for x in df["Why It Happened"]]
    df['Status'] = df['Status'].replace({"Closed": "c",
                                         "Initially Submitted": "is",
                                         "Submitted": "s"})
    df['Company'] = df['Company'].replace(company_rename())
    df = apply_system_id(df, "Company")
    return df


def optimize_json(df):
    df = df.rename(columns={"Incident Number": "id",
                            "Approximate Volume Released": "vol",
                            "What Happened": "what",
                            "Why It Happened": "why",
                            "Province": "p",
                            "Substance": "sub",
                            "Year": "y",
                            "Status": "s"})
    df["loc"] = [[round(lat, 4), round(long, 4)] for lat, long in zip(df['Latitude'],
                                                                      df['Longitude'])]
    for delete in ['Latitude', 'Longitude']:
        del df[delete]
    return df


def process_incidents(remote=False, companies=False, test=False):
    if remote:
        link = "https://www.cer-rec.gc.ca/open/incident/pipeline-incidents-data.csv"
        process_func = process_english
        print('downloading remote incidents file')
        df = pd.read_csv(link,
                         skiprows=0,
                         encoding="latin-1",
                         engine="python",
                         error_bad_lines=False)
        df.to_csv("./raw_data/incidents_"+"en"+".csv", index=False)
        df = process_func(df)

    elif test:
        print('reading test incidents file')
        path = "./raw_data/test_data/incidents_en.csv"
        process_func = process_english

        df = pd.read_csv(path,
                         skiprows=0,
                         encoding="utf-8",
                         error_bad_lines=False)
        df = process_func(df)

    else:
        print('reading local incidents file')
        path = "./raw_data/incidents_en.csv"
        process_func = process_english
        encoding = "latin-1"

        df = pd.read_csv(path,
                         skiprows=0,
                         encoding=encoding,
                         engine="python",
                         error_bad_lines=False)
        df = process_func(df)

    # initial data processing
    df['Approximate Volume Released'] = pd.to_numeric(df['Approximate Volume Released'],
                                                      errors='coerce')

    df['Reported Date'] = pd.to_datetime(df['Reported Date'], errors='raise')

    for delete in ['Significant',
                   'Release Type',
                   'Nearest Populated Centre',
                   'Reported Date']:
        del df[delete]

    if companies:
        company_files = companies
    else:
        company_files = get_company_list("all")

    for company in company_files:
        try:
            folder_name = company.replace(' ', '').replace('.', '')
            df_c = df[df['Company'] == company].copy().reset_index(drop=True)
            df_vol = df_c[~df_c['Approximate Volume Released'].isnull()].copy().reset_index(drop=True)
            this_company_data = {}
            if not df_vol.empty:
                # calculate metadata here, before non releases are filtered out
                meta = incident_meta_data(df, company)
                this_company_data['meta'] = meta
                for delete in ['Incident Types', 'Company', 'why common', 'what common']:
                    del df_vol[delete]
                df_vol = optimize_json(df_vol)
                this_company_data['events'] = df_vol.to_dict(orient='records')
                this_company_data['meta']['build'] = True
                if not test:
                    with open('../data_output/incidents/'+folder_name+'.json', 'w') as fp:
                        json.dump(this_company_data, fp)
            else:
                # there are no product release incidents
                this_company_data['events'] = df_vol.to_dict(orient='records')
                this_company_data['meta'] = {"companyName": company, "build": False}
                if not test:
                    with open('../data_output/incidents/'+folder_name+'.json', 'w') as fp:
                        json.dump(this_company_data, fp)
            print("completed: "+company)
        except:
            print("incidents error: "+company)

    return df_c, df_vol, meta


if __name__ == '__main__':
    print('starting incidents...')
    df_, volume_, meta_ = process_incidents(remote=True, test=False)
    print('completed incidents!')
