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


def load_fn_land():
    df = gpd.read_file("./raw_data/AL_TA_CA_SHP_eng/AL_TA_CA_2_128_eng.shp")
    return df


def load_fn_point():
    df = gpd.read_file("./raw_data/Premiere_Nation_First_Nation_SHP/Premiere_Nation_First_Nation.shp")
    df = df.to_crs(canada_geographic)
    return df


def events_on_land(events):
    land = load_fn_land()
    events_gdf = events.copy()
    gEvents = gpd.GeoDataFrame(events_gdf, geometry=gpd.points_from_xy(events.Longitude, events.Latitude))
    # gEvents.to_file("./raw_data/land_test/nova.shp")

    all_inside = []
    for land_index, land_row in land.iterrows():
        in_land = gEvents.within(land_row['geometry'])
        in_land = gEvents.loc[in_land]
        if len(in_land) > 0:
            for event_index, event_row in in_land.iterrows():
                on_land_details = {}
                on_land_details['id'] = event_row["Incident Number"]
                on_land_details['landName'] = land_row["NAME1"]
                on_land_details['landType'] = land_row['ALTYPE']
                all_inside.append(on_land_details)

    return all_inside


def events_near_land(events):
    fn = load_fn_point()
    proximity_result = []
    for index, row in events.iterrows():
        inc_lon, inc_lat = row['Longitude'], row['Latitude']
        for p, band_name in zip(fn['geometry'], fn['BAND_NAME']):
            fn_lon, fn_lat = p.x, p.y
            dist = haversine(lon1=inc_lon, lat1=inc_lat, lon2=fn_lon, lat2=fn_lat)
            if dist <= 40:
                proximity_result.append({"id": row['Incident Number'],
                                         "landName": band_name,
                                         "distance": round(dist, 1)})
    proximity_result = pd.DataFrame(proximity_result)
    category = []
    for dist in proximity_result['distance']:
        if dist <= 10:
            category.append(0)
        else:
            category.append(1)
    proximity_result['landProximityCategory'] = category
    proximity_result = proximity_result.groupby(['id']).agg({'landName': ', '.join,
                                                             'landProximityCategory': min})
    events = events.merge(proximity_result,
                          how='left',
                          left_on=['Incident Number'],
                          right_on=['id'])
    return events


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

    meta = {}
    meta['companyName'] = company
    meta['seriousEvents'] = other_types(df)
    meta['release'] = int(df['Approximate Volume Released'].notnull().sum())
    meta['nonRelease'] = int(df['Approximate Volume Released'].isna().sum())

    # calculate the most common what and why and most common substance released
    meta = most_common(df, meta, "What Happened", "mostCommonWhat")
    meta = most_common(df, meta, "Why It Happened", "mostCommonWhy")
    meta = most_common_substance(df, meta)
    return meta


def process_incidents(remote=False, land=False):
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

    df['Approximate Volume Released'] = pd.to_numeric(df['Approximate Volume Released'],
                                                      errors='coerce')
    df['Reported Date'] = pd.to_datetime(df['Reported Date'], errors='raise')

    for delete in ['Significant',
                   'Release Type',
                   'Nearest Populated Centre',
                   'Reported Date']:
        del df[delete]

    # print(set(df['Company']))
    company_files = ['NOVA Gas Transmission Ltd.', 'TransCanada PipeLines Limited']
    for company in company_files:
        folder_name = company.replace(' ', '').replace('.', '')
        if not os.path.exists("../incidents/"+folder_name):
            os.makedirs("../incidents/"+folder_name)

        df_c = df[df['Company'] == company].copy()
        # calculate metadata here, before non releases are filtered out
        meta = companyMetaData(df_c, company)
        del df_c['Incident Types']
        with open('../incidents/'+folder_name+'/summaryMetadata.json', 'w') as fp:
            json.dump(meta, fp)
        df_c = df_c[~df_c['Approximate Volume Released'].isnull()]
        del df_c['Company']
        if land:
            on_land = events_on_land(df_c)
            df_c = events_near_land(df_c)
            df_c['landProximityCategory'] = df_c['landProximityCategory'].fillna(3)
            df_c['landProximityCategory'] = df_c['landProximityCategory'].replace({0: "within 10 km",
                                                                                   1: "within 40 km",
                                                                                   3: "no proximity"})
            if len(on_land) > 0:
                for location in on_land:
                    df_c.loc[df_c["Incident Number"] == location["id"], ["landProximityCategory"]] = "On First Nations Land"
                    df_c.loc[df_c["Incident Number"] == location["id"], ["landName"]] = location["landName"]+" ("+location["landType"]+")"

            df_c = df_c.rename(columns={'landProximityCategory':
                                        'First Nations Proximity'})
        saveJson(df_c, '../incidents/'+folder_name+'/incidents_map.json', 3)

    return df_c, meta


if __name__ == '__main__':
    print('starting incidents...')
    df, meta = process_incidents(remote=False)
    print('completed incidents!')
