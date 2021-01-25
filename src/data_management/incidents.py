import pandas as pd
from util import saveJson
import ssl
import os
import json
ssl._create_default_https_context = ssl._create_unverified_context


def companyMetaData(df, company):

    def most_common(df, meta, col_name, meta_key):
        what_list = []
        for what in df[col_name]:
            if ',' in what:
                what_list.extend(what.split(','))
            else:
                what_list.append(what)
        what_list = [x.strip() for x in what_list]
        what_list = [x for x in what_list if x != 'To be determined']
        meta[meta_key] = max(set(what_list), key=what_list.count)

        return meta

    def most_common_substance(df, meta):
        df_substance = df[df['Substance'] != "Not Applicable"].copy()
        meta = most_common(df_substance, meta, "Substance", "mostCommonSubstance")
        return meta

    meta = {}
    meta['companyName'] = company
    meta['release'] = int(df['Approximate Volume Released'].notnull().sum())
    meta['nonRelease'] = int(df['Approximate Volume Released'].isna().sum())

    # calculate the most common what and why and most common substance released
    meta = most_common(df, meta, "What Happened", "mostCommonWhat")
    meta = most_common(df, meta, "Why It Happened", "mostCommonWhy")
    meta = most_common_substance(df, meta)
    return meta


def process_incidents(remote=False):
    if remote:
        link = "https://www.cer-rec.gc.ca/en/safety-environment/industry-performance/interactive-pipeline/map/2020-12-31-incident-data.csv"
        print('downloading remote file')
        df = pd.read_csv(link,
                         skiprows=1,
                         encoding="UTF-16",
                         error_bad_lines=False)
        df.to_csv("./raw_data/incidents.csv", index=False)
    else:
        print('reading local file')
        df = pd.read_csv("./raw_data/incidents.csv",
                         skiprows=0,
                         encoding="UTF-8",
                         error_bad_lines=False)
    try:
        df = df.rename(columns={'Approximate Volume Released (m³)':
                                'Approximate Volume Released'})
    except:
        None

    try:
        df = df.rename(columns={'Approximate Volume Released (m3)':
                                'Approximate Volume Released'})
    except:
        None
    df['Approximate Volume Released'] = pd.to_numeric(df['Approximate Volume Released'], errors='coerce')
    df['Reported Date'] = pd.to_datetime(df['Reported Date'], errors='raise')

    for delete in ['Significant', 'Release Type']:
        del df[delete]

    # df = df[~df['Approximate Volume Released'].isnull()]
    company_files = ['NOVA Gas Transmission Ltd.']
    for company in company_files:
        folder_name = company.replace(' ', '').replace('.', '')
        if not os.path.exists("../incidents/"+folder_name):
            os.makedirs("../incidents/"+folder_name)

        df_c = df[df['Company'] == company].copy()
        # calculate metadata here, before non releases are filtered out
        meta = companyMetaData(df_c, company)
        with open('../incidents/'+folder_name+'/summaryMetadata.json', 'w') as fp:
            json.dump(meta, fp)
        df_c = df_c[~df_c['Approximate Volume Released'].isnull()]
        saveJson(df_c, '../incidents/'+folder_name+'/incidents_map.json', 3)

    return df_c, meta


if __name__ == '__main__':
    print('starting incidents...')
    df, meta = process_incidents(remote=False)
    print('completed incidents!')
