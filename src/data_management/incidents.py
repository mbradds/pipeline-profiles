import pandas as pd
from util import get_company_names, company_rename, most_common, idify
import ssl
import json
ssl._create_default_https_context = ssl._create_unverified_context


def incidentMetaData(df, dfPerKm, company, lang):

    def most_common_substance(df, meta, lang):
        if lang == 'en':
            df_substance = df[df['Substance'] != "Not Applicable"].copy()
        else:
            df_substance = df[df['Substance'] != "Sans object"].copy()
        meta = most_common(df_substance, meta, "Substance", "mostCommonSubstance")
        return meta

    def other_types(df, lang):
        if lang == 'en':
            serious = {"Adverse Environmental Effects": 0,
                       "Fatality": 0,
                       "Serious Injury (CER or TSB)": 0}
        else:
            newTxt = []
            for txt in df['Incident Types']:
                newTxt.append(txt.replace("Effets environnementaux négatifs",
                                          "Adverse Environmental Effects")
                              .replace("Blessure grave (Régie ou BST)",
                                       "Serious Injury (CER or TSB)")
                              .replace("Décès", "Fatality"))

            df['Incident Types'] = newTxt

            serious = {"Adverse Environmental Effects": 0,
                       "Fatality": 0,
                       "Serious Injury (CER or TSB)": 0}
        for type_list in df['Incident Types']:
            type_list = [x.strip() for x in type_list.split(",")]
            for t in type_list:
                if t in serious:
                    serious[t] = serious[t] + 1
        return serious

    def thisCompanyPct(df, df_c):
        pct = {}
        countPct = (len(df_c.index)/len(df.index))*100
        if countPct >= 1:
            countPct = round(countPct, 0)
        else:
            countPct = round(countPct, 1)
        pct['count'] = countPct
        return pct

    # filter to specific company
    df_c = df[df['Company'] == company].copy()
    meta = {}
    meta['companyName'] = company
    meta['seriousEvents'] = other_types(df_c, lang)
    meta['release'] = int(df_c['Approximate Volume Released'].notnull().sum())
    meta['nonRelease'] = int(df_c['Approximate Volume Released'].isna().sum())

    meta = most_common(df_c, meta, "what common", "mostCommonWhat")
    meta = most_common(df_c, meta, "why common", "mostCommonWhy")

    meta["mostCommonWhat"] = [x.strip() for x in meta["mostCommonWhat"].split(" & ")]
    meta["mostCommonWhy"] = [x.strip() for x in meta["mostCommonWhy"].split(" & ")]
    meta = most_common_substance(df_c, meta, lang)
    return meta


def fixColumns(df):
    new_cols = {x: x.split("(")[0].strip() for x in df.columns}
    df = df.rename(columns=new_cols)
    return df


def process_english(df):

    def replaceWhatWhy(df, colName, values):
        newCol = []
        for what in df[colName]:
            what = what.split(",")
            what = [x.strip() for x in what]
            what = [values[x] for x in what]
            newCol.append(what)

        df[colName] = newCol
        return df

    df = fixColumns(df)
    df['Substance'] = df['Substance'].replace({'Butane': 'Natural Gas Liquids'})
    chosenSubstances = ["Propane",
                        "Natural Gas - Sweet",
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
    df['Substance'] = [x if x in chosenSubstances else "Other" for x in df['Substance']]
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

    df = replaceWhatWhy(df, "What Happened", what)
    df = replaceWhatWhy(df, "Why It Happened", why)
    df["what common"] = [", ".join(x) for x in df["What Happened"]]
    df["why common"] = [", ".join(x) for x in df["Why It Happened"]]
    df['Status'] = df['Status'].replace({"Closed": "c",
                                         "Initially Submitted": "is",
                                         "Submitted": "s"})
    return df


def optimizeJson(df):
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


def process_incidents(remote=False, land=False, company_names=False, companies=False, test=False):
    lang = "en"
    if remote:
        link = "https://www.cer-rec.gc.ca/en/safety-environment/industry-performance/interactive-pipeline/map/2021-03-31-incident-data.csv"
        process_func = process_english

        print('downloading remote incidents file')
        df = pd.read_csv(link,
                         skiprows=0,
                         encoding="latin-1",
                         engine="python",
                         error_bad_lines=False)
        df = process_func(df)
        df.to_csv("./raw_data/incidents_"+lang+".csv", index=False)
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
                         error_bad_lines=False)
        df = process_func(df)

    # initial data processing
    df['Company'] = df['Company'].replace(company_rename())
    df['Approximate Volume Released'] = pd.to_numeric(df['Approximate Volume Released'],
                                                      errors='coerce')

    df['Reported Date'] = pd.to_datetime(df['Reported Date'], errors='raise')

    for delete in ['Significant',
                   'Release Type',
                   'Nearest Populated Centre',
                   'Reported Date']:
        del df[delete]

    if company_names:
        print(get_company_names(df['Company']))

    perKm = None

    if companies:
        company_files = companies
    else:
        company_files = ['NOVA Gas Transmission Ltd.',
                         'TransCanada PipeLines Limited',
                         'Enbridge Pipelines Inc.',
                         'Enbridge Pipelines (NW) Inc.',
                         'Enbridge Bakken Pipeline Company Inc.',
                         'Express Pipeline Ltd.',
                         'Trans Mountain Pipeline ULC',
                         'Trans Quebec and Maritimes Pipeline Inc.',
                         'Trans-Northern Pipelines Inc.',
                         'TransCanada Keystone Pipeline GP Ltd.',
                         'Westcoast Energy Inc.',
                         'Alliance Pipeline Ltd.',
                         'PKM Cochin ULC',
                         'Foothills Pipe Lines Ltd.',
                         'Southern Lights Pipeline',
                         'Emera Brunswick Pipeline Company Ltd.',
                         'Plains Midstream Canada ULC',
                         'Genesis Pipeline Canada Ltd.',
                         'Montreal Pipe Line Limited',
                         'Trans-Northern Pipelines Inc.',
                         'Kingston Midstream Westspur Limited',
                         'Many Islands Pipe Lines (Canada) Limited',
                         'Vector Pipeline Limited Partnership',
                         'Maritimes & Northeast Pipeline Management Ltd.',
                         'Aurora Pipeline Company Ltd']

    for company in company_files:
        folder_name = company.replace(' ', '').replace('.', '')
        df_c = df[df['Company'] == company].copy().reset_index(drop=True)
        df_vol = df_c[~df_c['Approximate Volume Released'].isnull()].copy().reset_index(drop=True)
        thisCompanyData = {}
        if not df_vol.empty:
            # calculate metadata here, before non releases are filtered out
            meta = incidentMetaData(df, perKm, company, lang)
            thisCompanyData['meta'] = meta
            for delete in ['Incident Types', 'Company', 'why common', 'what common']:
                del df_vol[delete]
            df_vol = optimizeJson(df_vol)
            thisCompanyData['events'] = df_vol.to_dict(orient='records')
            if not test:
                with open('../incidents/company_data/'+folder_name+'.json', 'w') as fp:
                    json.dump(thisCompanyData, fp)
        else:
            # there are no product release incidents
            thisCompanyData['events'] = df_vol.to_dict(orient='records')
            thisCompanyData['meta'] = {"companyName": company}
            if not test:
                with open('../incidents/company_data/'+folder_name+'.json', 'w') as fp:
                    json.dump(thisCompanyData, fp)

    return df_c, df_vol, meta


if __name__ == '__main__':
    print('starting incidents...')
    df, volume, meta = process_incidents(remote=False, test=False)
    print('completed incidents!')

#%%