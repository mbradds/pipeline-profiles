import pandas as pd
from util import saveJson
import ssl
import os
import json
import geopandas as gpd
from math import radians, cos, sin, asin, sqrt
ssl._create_default_https_context = ssl._create_unverified_context
web_mercator = "EPSG:3857"
canada_geographic = "EPSG:4617"  # https://spatialreference.org/ref/epsg/4617/


def haversine(lon1, lat1, lon2, lat2):
    """
    Calculate the great circle distance between two points
    on the earth (specified in decimal degrees)
    """
    # convert decimal degrees to radians
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])

    # haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    r = 6371  # Radius of earth in kilometers. Use 3956 for miles
    return c * r


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
        meta[meta_key] = max(set(what_list), key=what_list.count).lower()
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


def load_fn():
    df = gpd.read_file("./raw_data/Premiere_Nation_First_Nation_SHP/Premiere_Nation_First_Nation.shp")
    df = df.to_crs(canada_geographic)
    df.plot()
    return df


def proximity_fn(inc):
    fn = load_fn()
    proximity_result = []
    for index, row in inc.iterrows():
        inc_lon, inc_lat = row['Longitude'], row['Latitude']
        for p, band_name in zip(fn['geometry'], fn['BAND_NAME']):
            fn_lon, fn_lat = p.x, p.y
            dist = haversine(lon1=inc_lon, lat1=inc_lat, lon2=fn_lon, lat2=fn_lat)
            if dist <= 50:
                proximity_result.append({"id": row['Incident Number'],
                                         "bandName": band_name,
                                         "distance": round(dist, 1)})
    proximity_result = pd.DataFrame(proximity_result)
    category = []
    for dist in proximity_result['distance']:
        if dist <= 10:
            category.append(0)
        else:
            category.append(1)
    proximity_result['category'] = category
    proximity_result = proximity_result.groupby(['id']).agg({'bandName': ', '.join,
                                                             'category': min})
    inc = inc.merge(proximity_result, how='left', left_on=['Incident Number'], right_on=['id'])
    return inc


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

    for delete in ['Significant', 'Release Type', 'Incident Types', 'Nearest Populated Centre', 'Reported Date']:
        del df[delete]

    # print(set(df['Company']))
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
        del df_c['Company']
        df_c = proximity_fn(df_c)
        df_c['category'] = df_c['category'].fillna(3)
        df_c['category'] = df_c['category'].replace({0: "within 10 km",
                                                     1: "within 50 km",
                                                     3: "no proximity"})
        del df_c['bandName']
        saveJson(df_c, '../incidents/'+folder_name+'/incidents_map.json', 3)

    return df_c, meta


if __name__ == '__main__':
    print('starting incidents...')
    df, meta = process_incidents(remote=False)
    print('completed incidents!')
