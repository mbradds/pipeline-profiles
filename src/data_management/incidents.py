import pandas as pd
from util import get_company_names, company_rename, most_common
import ssl
import json
ssl._create_default_https_context = ssl._create_unverified_context
# lastFullYear = 2021


def incidentsPerKm(dfAll):
    dfKm = pd.read_excel('./raw_data/pipeline_length.XLSX')
    dfKm = dfKm[dfKm['Regulated KM Rounded'].notnull()]
    dfKm['Company Name'] = [x.strip() for x in dfKm['Company Name']]
    dfKm['Company Name'] = dfKm['Company Name'].replace(company_rename())

    dfAll = dfAll.groupby('Company')['Incident Number'].count()
    dfAll = dfAll.reset_index()
    dfAll = dfAll.rename(columns={'Incident Number': 'Incident Count'})
    dfAll = dfAll.merge(dfKm, how='inner', left_on='Company', right_on='Company Name')
    for delete in ['Company Name', 'Regulated KM', 'PipelineID']:
        del dfAll[delete]
    dfAll['Incidents per 1000km'] = [round((i/l)*1000, 0) for i, l in zip(dfAll['Incident Count'], dfAll['Regulated KM Rounded'])]

    # find the average incident per 1000km per group
    dfAvg = dfAll.copy()
    dfAvg = dfAvg.groupby(['Commodity'])['Incidents per 1000km'].mean().reset_index()
    dfAvg = dfAvg.rename(columns={'Incidents per 1000km': 'Avg per 1000km'})
    # merge the average with the company results
    dfAll = dfAll.merge(dfAvg, how='inner', left_on='Commodity', right_on='Commodity')
    dfAll['Avg per 1000km'] = dfAll['Avg per 1000km'].round(0)
    return dfAll


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
    # meta['relativePct'] = thisCompanyPct(df, df_c)
    meta['companyName'] = company
    meta['seriousEvents'] = other_types(df_c, lang)
    meta['release'] = int(df_c['Approximate Volume Released'].notnull().sum())
    meta['nonRelease'] = int(df_c['Approximate Volume Released'].isna().sum())

    meta = most_common(df_c, meta, "What Happened", "mostCommonWhat")
    meta = most_common(df_c, meta, "Why It Happened", "mostCommonWhy")
    meta = most_common_substance(df_c, meta, lang)
    return meta


# def changes(df, volume=True):
#     changeMeta = {}
#     trend = df.copy().reset_index(drop=True)
#     if volume:
#         trend = trend[~trend['Approximate Volume Released'].isnull()].copy().reset_index(drop=True)
#     trend = trend.groupby(['Year'])['Incident Number'].count()
#     trend = trend.reset_index()
#     trend = trend.sort_values(by='Year')
#     trend = trend.rename(columns={'Incident Number': 'Incident Count'})
#     max_year = max(trend['Year'])
#     # isolate the five year range
#     trend = trend[(trend['Year'] <= lastFullYear) & (trend['Year'] >= lastFullYear-5)]
#     if lastFullYear in list(trend['Year']):
#         recentIncidents = trend[trend['Year'] == lastFullYear].copy().reset_index()
#         recentIncidents = recentIncidents.loc[0, "Incident Count"]
#         fiveYearAvg = trend[trend['Year'] != lastFullYear].copy().reset_index()
#         fiveYearAvg = fiveYearAvg['Incident Count'].mean()
#         changeMeta['year'] = int(lastFullYear)
#         changeMeta['pctChange'] = round(((int(recentIncidents)-int(fiveYearAvg))/int(fiveYearAvg))*100, 0)

#     else:
#         changeMeta["noneSince"] = max_year
#     return changeMeta


def fixColumns(df):
    new_cols = {x: x.split("(")[0].strip() for x in df.columns}
    df = df.rename(columns=new_cols)
    return df


def process_french(df):
    df = fixColumns(df)
    df = df.rename(columns={"Numéro d'incident": "Incident Number",
                            "Types d'incident": "Incident Types",
                            "Date de l'événement signalé": "Reported Date",
                            "Centre habité le plus près": "Nearest Populated Centre",
                            "Province": "Province",
                            "Société": "Company",
                            "État": "Status",
                            "Latitude": "Latitude",
                            "Longitude": "Longitude",
                            "Approximation du volume déversé": "Approximate Volume Released",
                            "Substance": "Substance",
                            "Type de Déversement": "Release Type",
                            "Majeur": "Significant",
                            "Année": "Year",
                            "Ce qui s’est passé": "What Happened",
                            "Cause": "Why It Happened"})

    # take care of "what happened" french col error
    for colName in df.columns:
        if "est passé" in colName:
            df = df.rename(columns={colName: "What Happened"})

    chosenSubstances = ["Propane",
                        "Gaz Naturel - non sulfureux",
                        "Gaz naturel - sulfureux",
                        "Huile lubrifiante",
                        "Pétrole brut non sulfureux",
                        "Pétrole brut synthétique",
                        "Pétrole brut sulfureux",
                        "Liquides de gaz naturel",
                        "Condensat",
                        # "Dioxyde de soufre",
                        "Carburant diesel",
                        "Essence"]
    df['Substance'] = [x if x in chosenSubstances else "Autre" for x in df['Substance']]
    df['Substance'] = df['Substance'].replace({'Butane': 'Liquides de gaz naturel'})
    return df


def process_english(df):
    df = fixColumns(df)
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
    df['Substance'] = df['Substance'].replace({'Butane': 'Natural Gas Liquids'})
    return df


def optimizeJson(df):
    df = df.rename(columns={"Incident Number": "id",
                            "Approximate Volume Released": "vol",
                            "What Happened": "what",
                            "Why It Happened": "why"})
    df["lat long"] = [[round(lat,4), round(long,4)] for lat, long in zip(df['Latitude'],
                                                       df['Longitude'])]
    for delete in ['Latitude', 'Longitude']:
        del df[delete]
    return df


def process_incidents(remote=False, land=False, company_names=False, companies=False, test=False, lang='en'):

    if remote:
        if lang == 'en':
            link = "https://www.cer-rec.gc.ca/en/safety-environment/industry-performance/interactive-pipeline/map/2021-03-31-incident-data.csv"
            process_func = process_english
        else:
            link = "https://www.cer-rec.gc.ca/fr/securite-environnement/rendement-lindustrie/carte-interactive-pipelines/carte/2021-03-31-donnees-incidents.csv"
            process_func = process_french
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
        if lang == 'en':
            path = "./raw_data/test_data/incidents_en.csv"
            process_func = process_english
        else:
            path = "./raw_data/test_data/incidents_fr.csv"
            process_func = process_french

        df = pd.read_csv(path,
                         skiprows=0,
                         encoding="utf-8",
                         error_bad_lines=False)
        df = process_func(df)

    else:
        print('reading local incidents file')
        if lang == 'en':
            print('starting english incidents...')
            path = "./raw_data/incidents_en.csv"
            process_func = process_english
            encoding = "utf-8"
        else:
            print('starting french incidents...')
            path = "./raw_data/incidents_fr.csv"
            process_func = process_french
            encoding = "utf-8-sig"

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

    # industryTrend = changes(df, volume=True)
    # perKm = incidentsPerKm(df)
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
            # companyTrend = changes(df_vol, volume=False)
            # meta['trends'] = {"company": companyTrend, "industry": industryTrend}
            thisCompanyData['meta'] = meta
            del df_vol['Incident Types']
            del df_vol['Company']
            df_vol = optimizeJson(df_vol)
            thisCompanyData['events'] = df_vol.to_dict(orient='records')
            if not test:
                with open('../incidents/company_data/'+lang+'/'+folder_name+'.json', 'w') as fp:
                    json.dump(thisCompanyData, fp)
        else:
            # there are no product release incidents
            thisCompanyData['events'] = df_vol.to_dict(orient='records')
            thisCompanyData['meta'] = {"companyName": company}
            if not test:
                with open('../incidents/company_data/'+lang+'/'+folder_name+'.json', 'w') as fp:
                    json.dump(thisCompanyData, fp)

    return df_c, df_vol, meta


if __name__ == '__main__':
    print('starting incidents...')
    df, volume, meta = process_incidents(remote=False, test=False, lang='en')
    df, volume, meta = process_incidents(remote=False, test=False, lang='fr')
    print('completed incidents!')

#%%