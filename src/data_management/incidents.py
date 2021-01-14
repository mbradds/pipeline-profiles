import pandas as pd
from util import saveJson
import ssl
import os
ssl._create_default_https_context = ssl._create_unverified_context


def process_incidents(remote=False):
    if remote:
        link = 'https://www.cer-rec.gc.ca/en/safety-environment/industry-performance/interactive-pipeline/map/2020-09-30-incident-data.csv'
        print('downloading remote file')
        df = pd.read_csv(link,
                         skiprows=1,
                         encoding="UTF-16",
                         error_bad_lines=False)
    else:
        print('reading local file')
        df = pd.read_csv("./raw_data/2020-09-30-incident-data.csv",
                         skiprows=1,
                         encoding="UTF-16",
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
    # calculate metadata here

    for delete in ['Significant', 'Release Type']:
        del df[delete]

    df = df[~df['Approximate Volume Released'].isnull()]
    company_files = ['NOVA Gas Transmission Ltd.']
    for company in company_files:
        folder_name = company.replace(' ', '').replace('.', '')
        if not os.path.exists("../incidents/"+folder_name):
            os.makedirs("../incidents/"+folder_name)

        df_c = df[df['Company'] == company].copy()
        saveJson(df_c, '../incidents/'+folder_name+'/incidents_map.json')

    return df_c


if __name__ == '__main__':
    df = process_incidents(remote=False)
