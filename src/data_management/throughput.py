import pandas as pd
from util import execute_sql, normalize_dates, most_common, get_company_names, normalizeBool
import os
import json
script_dir = os.path.dirname(__file__)


def get_data(test, sql=False):
    if sql:
        print('reading sql throughput')
        df = execute_sql(path=script_dir, query_name='throughput_gas.sql', db='EnergyData')
        df.to_csv('raw_data/throughput_gas.csv', index=False)
    elif test:
        print('reading test throughput')
        df = pd.read_csv('raw_data/test_data/throughput_gas.csv')
    else:
        print('reading local throughput')
        df = pd.read_csv('raw_data/throughput_gas.csv')
    return df


def meta_throughput(df_c, meta):
    df_meta = df_c[['Key Point', 'Direction of Flow', 'Trade Type']].copy()
    df_meta = df_meta.drop_duplicates().reset_index(drop=True)
    for col in df_meta:
        df_meta[col] = [x.strip() for x in df_meta[col]]
    
    directions = {}
    for key, flow, trade in zip(df_meta['Key Point'], df_meta['Direction of Flow'], df_meta['Trade Type']):
        directions[key] = [flow, trade]
    
    meta["directions"] = directions
    return meta


def process_throughput(test=False, sql=False):
    if not os.path.exists("../operationsAndMaintenance"):
        os.mkdir("../operationsAndMaintenance")
        os.mkdir("../operationsAndMaintenance/company_data")

    df = get_data(test, sql)
    df = normalize_dates(df, ['Date'])

    for col in ['Capacity (1000 m3/d)', 'Throughput (1000 m3/d)']:
        df[col] = df[col].fillna(0)
        df[col] = df[col].astype(int)

    df = df.rename(columns={'Capacity (1000 m3/d)': 'Capacity',
                            'Throughput (1000 m3/d)': 'Throughput'})

    df['Corporate Entity'] = df['Corporate Entity'].replace({'NOVA Gas Transmission Ltd. (NGTL)': 'NOVA Gas Transmission Ltd.'})
    company_files = ['NOVA Gas Transmission Ltd.']

    for company in company_files:
        meta = {"companyName": company}
        thisCompanyData = {}
        folder_name = company.replace(' ', '').replace('.', '')
        df_c = df[df['Corporate Entity'] == company].copy().reset_index(drop=True)
        meta = meta_throughput(df_c, meta)
        for delete in ['Direction of Flow', 'Corporate Entity', 'Trade Type']:
            del df_c[delete]
        
        thisCompanyData['traffic'] = df_c.to_dict(orient='records')
        thisCompanyData['meta'] = meta
        if not test:
            with open('../traffic/company_data/'+folder_name+'.json', 'w') as fp:
                json.dump(thisCompanyData, fp, default=str)

    return thisCompanyData


if __name__ == "__main__":
    print('starting throughput...')
    nova = process_throughput(test=False, sql=False)
    print('completed throughput!')
    