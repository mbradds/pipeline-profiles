import pandas as pd
import numpy as np
from util import get_company_names, company_rename
import ssl
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


def incidentMetaData(df, dfPerKm, company):

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
    meta['relativePct'] = thisCompanyPct(df, df_c)
    meta['companyName'] = company
    meta['seriousEvents'] = other_types(df_c)
    meta['release'] = int(df_c['Approximate Volume Released'].notnull().sum())
    meta['nonRelease'] = int(df_c['Approximate Volume Released'].isna().sum())

    thisPerKm = dfPerKm[dfPerKm['Company'] == company].copy()
    perKm = {}
    perKm['incidentsPerKm'] = thisPerKm['Incidents per 1000km'].iloc[0]
    perKm['avgPerKm'] = thisPerKm['Avg per 1000km'].iloc[0]
    perKm['commodity'] = thisPerKm['Commodity'].iloc[0].lower()
    meta['per1000km'] = perKm
    # calculate the most common what and why and most common substance released
    meta = most_common(df_c, meta, "What Happened", "mostCommonWhat")
    meta = most_common(df_c, meta, "Why It Happened", "mostCommonWhy")
    meta = most_common_substance(df_c, meta)
    return meta


def process_incidents(remote=False, land=False, company_names=False, companies=False):
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

    # initial data processing
    #df = df[df['Company'] != 'Plains Midstream Canada ULC']
    # TODO: plains midstream isnt broken down into its seperate pipes...
    df['Company'] = df['Company'].replace(company_rename())

    df['Approximate Volume Released'] = pd.to_numeric(df['Approximate Volume Released'],
                                                      errors='coerce')
    df['Reported Date'] = pd.to_datetime(df['Reported Date'], errors='raise')
    df['Substance'] = df['Substance'].replace({"Water": "Other",
                                               "Hydrogen Sulphide": "Other",
                                               "Amine": "Other",
                                               "Contaminated Water": "Other",
                                               "Potassium Hydroxide (caustic solution)": "Other",
                                               "Glycol": "Other",
                                               "Pulp slurry": "Other",
                                               "Sulphur": "Other",
                                               "Odourant": "Other",
                                               "Potassium Carbonate": "Other",
                                               "Waste Oil": "Other",
                                               "Produced Water": "Other",
                                               "Butane": "Other",
                                               "Mixed HVP Hydrocarbons": "Other",
                                               "Drilling Fluid": "Other"})

    for delete in ['Significant',
                   'Release Type',
                   'Nearest Populated Centre',
                   'Reported Date']:
        del df[delete]

    if company_names:
        print(get_company_names(df['Company']))

    perKm = incidentsPerKm(df)

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
                         'Maritimes & Northeast Pipeline Management Ltd.']

    for company in company_files:
        folder_name = company.replace(' ', '').replace('.', '')
        df_c = df[df['Company'] == company].copy().reset_index(drop=True)
        df_vol = df_c[~df_c['Approximate Volume Released'].isnull()].copy().reset_index(drop=True)
        thisCompanyData = {}
        if not df_vol.empty:
            # calculate metadata here, before non releases are filtered out
            meta = incidentMetaData(df, perKm, company)
            thisCompanyData['meta'] = meta
            del df_vol['Incident Types']
            del df_vol['Company']
            if land:
                on_land = events_on_land(df_vol)
                df_vol = events_near_land(df_vol)
                df_vol['landProximityCategory'] = df_vol['landProximityCategory'].fillna(3)
                df_vol['landProximityCategory'] = df_vol['landProximityCategory'].replace({0: "within 10 km",
                                                                                           1: "within 40 km",
                                                                                           3: "no proximity"})
                if len(on_land) > 0:
                    for location in on_land:
                        df_vol.loc[df_vol["Incident Number"] == location["id"], ["landProximityCategory"]] = "On First Nations Land"
                        df_vol.loc[df_vol["Incident Number"] == location["id"], ["landName"]] = location["landName"]+" ("+location["landType"]+")"

                df_vol = df_vol.rename(columns={'landProximityCategory':
                                                'First Nations Proximity'})

            thisCompanyData['events'] = df_vol.to_dict(orient='records')
            with open('../incidents/company_data/'+folder_name+'.json', 'w') as fp:
                json.dump(thisCompanyData, fp)
        else:
            # there are no product release incidents
            thisCompanyData['events'] = df_vol.to_dict(orient='records')
            thisCompanyData['meta'] = {"companyName": company}
            with open('../incidents/company_data/'+folder_name+'.json', 'w') as fp:
                json.dump(thisCompanyData, fp)

    return df_c, df_vol, meta, perKm


if __name__ == '__main__':
    print('starting incidents...')
    df, volume, meta, perKm = process_incidents(remote=False, companies=['Plains Midstream Canada ULC'])
    print('completed incidents!')

#%%
