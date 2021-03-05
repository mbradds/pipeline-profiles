import pandas as pd
from util import execute_sql, normalize_dates, most_common, get_company_names, normalizeBool
import os
import json
from datetime import datetime
import time
script_dir = os.path.dirname(__file__)


def get_data(test, sql=False):
    if sql:
        print('reading sql throughput')
        df = execute_sql(path=script_dir, query_name='throughput_gas.sql', db='EnergyData')
        df.to_csv('raw_data/throughput_gas.csv', index=False)
    elif test:
        print('reading test throughput')
        df = pd.read_csv('raw_data/test_data/throughput_gas_monthly.csv')
    else:
        print('reading local throughput')
        df = pd.read_csv('raw_data/throughput_gas_monthly.csv', encoding='latin-1')
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


def serialize(df, col):
    serialized_col = []
    for date in df[col]:
        dateSeries = int(''.join(list(pd.Series(date).to_json(orient='records'))[1:-1]))
        serialized_col.append(dateSeries)

    df['Date'] = serialized_col
    return df


def process_throughput(test=False, sql=False):
    if not os.path.exists("../operationsAndMaintenance"):
        os.mkdir("../operationsAndMaintenance")
        os.mkdir("../operationsAndMaintenance/company_data")

    df = get_data(test, sql)

    df['Date'] = pd.to_datetime(df['Date'])
    df = serialize(df, 'Date')

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

        point_data = {}
        points = sorted(list(set(df_c['Key Point'])))
        for p in points:
            pointThroughput, pointCapacity, pointDates = [], [], []
            df_p = df_c[df_c['Key Point'] == p].copy().reset_index()
            for date, t, c in zip(df_p['Date'], df_p['Throughput'], df_p['Capacity']):
                # pointDates.append(date)
                pointThroughput.append([date, t])
                pointCapacity.append([date, c])
            point_data[p] = [{"name": "Throughput",
                              "type": "area",
                              "data": pointThroughput},
                             {"name": "Capacity",
                              "type": "line",
                              "data": pointCapacity}]

        meta["points"] = points
        # thisCompanyData['traffic'] = df_c.to_dict(orient='records')
        thisCompanyData["traffic"] = point_data
        thisCompanyData['meta'] = meta
        if not test:
            with open('../traffic/company_data/'+folder_name+'.json', 'w') as fp:
                json.dump(thisCompanyData, fp, default=str)

    return thisCompanyData, df_c


if __name__ == "__main__":
    print('starting throughput...')
    nova, df = process_throughput(test=False, sql=False)
    print('completed throughput!')
