import os
import json
import dateutil.relativedelta
import pandas as pd
from util import execute_sql, normalize_text, normalize_numeric, conversion, idify, get_company_list, set_cwd_to_script
set_cwd_to_script()


def apply_trade_id(df):
    trade = {"intracanada": "in",
             "export": "ex",
             "import": "im",
             "capacity": "cap",
             "domestic heavy": "dh",
             "refined petroleum products": "rp",
             "domestic light": "dl",
             "domestic light / ngl": "dln",
             "natural gas liquids (ngl)": "ngl",
             "NGL Volume": "ngl",
             "NGL": "ngl",
             "foreign light": "fl",
             "condensate": "co",
             "diluent": "di",
             "diluent (committed)": "dic",
             "diluent (uncommitted)": "diu",
             "Diluent - Committed": "dic",
             "Diluent - Uncommitted": "diu",
             "Diluent - Uncomitted": "diu",
             "southeast sask (SES) crude": "ses",
             "SES – Crude Volume": "ses",
             "SES – Crude": "ses",
             "petroleum": "pet",
             "westspur midale (MSM) crude": "msm",
             "MSM – Crude Volume": "msm",
             "MSM – Crude": "msm",
             "aggregate of heavy, medium, light crude petroleum": "agg"}
    df = idify(df, "Trade Type", trade, False)
    return df


def apply_colors(trade_type):
    trade_type = trade_type.split("-")[0].strip()
    colors = {"in": "#054169",
              "ex": "#559B37",
              "im": "#5FBEE6",
              "cap": "#FFBE4B",
              "dh": "#054169",
              "rp": "#FF821E",
              "dl": "#5FBEE6",
              "dln": "#559B37",
              "ngl": "#FFBE4B",
              "fl": "#8c8c96",
              "co": "#871455",
              "di": "#871455",
              "ses": "#054169",
              "msm": "#559B37",
              "pet": "#054169",
              "dic": "#054169",
              "diu": "#FF821E",
              "agg": "#054169"}
    return colors[trade_type]


def get_traffic_data(sql=False, query='throughput_gas_monthly.sql', db="PipelineInformation"):

    csv_name = query.split(".")[0]+'.csv'
    if sql:
        print('reading sql '+query.split(".")[0])
        df = execute_sql(path=os.path.join(os.getcwd(), "queries"), query_name=query, db=db)
        df.to_csv('raw_data/'+csv_name, index=False)

    else:
        print('reading local '+query.split(".")[0])
        df = pd.read_csv('raw_data/'+csv_name, encoding='utf-8')

    # inital processing for key points
    if query == 'key_points.sql':
        df = normalize_text(df, ['Key Point', 'Pipeline Name'])
        df = normalize_numeric(df, ['Latitude', 'Longitude'], 3)

    return df


def meta_throughput(df_c, meta, data):
    def direction_list(dr):
        dr = dr[0].split("&")
        dr = [x.strip() for x in dr]
        return dr

    df_meta = df_c[['KeyPointID', 'Direction of Flow', 'Trade Type']].copy()
    if data == "oil":
        df_meta['Trade Type'] = [x.split("-")[-1].strip() for x in df_meta['Trade Type']]
    df_meta = df_meta.drop_duplicates().reset_index(drop=True)
    df_meta = df_meta.sort_values(by=['KeyPointID', 'Trade Type'])
    df_meta = df_meta.groupby(['KeyPointID']).agg(direction=("Direction of Flow", set),
                                                  trade=("Trade Type", set))

    df_meta = df_meta.reset_index()
    for col in ['direction', 'trade']:
        df_meta[col] = [list(x) for x in df_meta[col]]

    directions = {}
    direction_id = {'north': 'n',
                    'east': 'e',
                    'south': 's',
                    'west': 'w',
                    'northeast': 'ne',
                    'northwest': 'nw',
                    'north-west': 'nw',
                    'north-east': 'ne',
                    'southeast': 'se',
                    'southwest': 'sw'
                   }
    df_meta['direction'] = [direction_list(x) for x in df_meta['direction']]
    for key, flow in zip(df_meta['KeyPointID'], df_meta['direction']):
        try:
            directions[key] = [direction_id[x.lower()] for x in flow]
        except:
            directions[key] = flow
    meta["directions"] = directions
    return meta


# TODO: create a general purpose round finder by looking at the average throughput
def get_rounding(point):
    # if point in ['KP0023', 'KP0029', 'KP0046']:
    #     rounding = 4
    # elif point in ['KP0014', 'KP0010']:
    #     rounding = 3
    # else:
    #     rounding = 3
    rounding = 4
    return rounding


def meta_trend(df_c, commodity):

    def group_trends(df):
        df = df.groupby(['Date', 'Pipeline Name', 'KeyPointID']).agg({'Capacity': 'mean', 'Throughput': 'sum'})
        df = df.reset_index()
        return df

    def calculate_trend(df_p, meta_trends, point, trend_name, commodity):
        df_p = df_p.sort_values(by='Date', ascending=True)
        df_p = df_p.set_index('Date')
        df_p = df_p.groupby(['Pipeline Name', 'KeyPointID', 'Direction of Flow', 'Trade Type']).resample('Q', convention='end').agg('mean').reset_index()
        if commodity == "Gas":
            df_p = df_p[df_p['Date'] >= max(df_p['Date']) - dateutil.relativedelta.relativedelta(months=12)].copy().reset_index(drop=True)
        else:
            df_p = df_p[df_p['Date'] >= max(df_p['Date']) - dateutil.relativedelta.relativedelta(months=3)].copy().reset_index(drop=True)

        df_old = df_p[df_p['Date'] == min(df_p['Date'])].copy().reset_index(drop=True)
        df_new = df_p[df_p['Date'] == max(df_p['Date'])].copy().reset_index(drop=True)

        df_old = group_trends(df_old)
        df_new = group_trends(df_new)
        new_through, new_date = df_new.loc[0, "Throughput"], df_new.loc[0, "Date"]
        old_through, old_date = df_old.loc[0, "Throughput"], df_old.loc[0, "Date"]

        this_trend = {}
        try:
            if old_through > 0:
                pct = int(round((new_through-old_through)/abs(old_through)*100, 0))
            else:
                pct = None
            this_trend["throughChange"] = {"pct": pct,
                                          "from": round(old_through, rounding),
                                          "to": round(new_through, rounding)}
        except:
            raise

        this_trend["fromDate"] = [old_date.year, old_date.month]
        this_trend["toDate"] = [new_date.year, new_date.month]
        this_trend["name"] = trend_name
        meta_trends[point].append(this_trend)
        return meta_trends

    meta_trends = {}
    for point in list(set(df_c['KeyPointID'])):
        rounding = get_rounding(point)
        df_t = df_c.copy()
        df_p = df_t[df_t['KeyPointID'] == point].copy().reset_index(drop=True)
        meta_trends[point] = []
        if "im" in list(df_p['Trade Type']):
            df_import = df_p[df_p['Trade Type'] == "im"].copy()
            df_other = df_p[df_p['Trade Type'] != "im"].copy()
            meta_trends = calculate_trend(df_other, meta_trends, point, "ex", commodity)
            meta_trends = calculate_trend(df_import, meta_trends, point, "im", commodity)
        else:
            meta_trends = calculate_trend(df_p, meta_trends, point, "default", commodity)
    return meta_trends


def get_default_point(company):
    defaults = {'NGTL': 'KP0040',
                'Westcoast': 'KPWESC',
                'TCPL': 'KP0033',
                'Alliance': 'KP0002',
                'TQM': 'KP0035',
                'Foothills': 'KP0023',
                'MNP': 'KP0001',
                'EnbridgeMainline': 'KP0016',
                'Keystone': 'KP0020',
                'TransMountain': 'KP0003',
                'Cochin': 'KP0018',
                'NormanWells': 'KP0044'}
    try:
        return defaults[company]
    except:
        return 'KP0000'


def push_traffic(t, arr, rounding, applyNone=False):
    if t == 0 and applyNone:
        arr.append(None)
    elif t == 0 and not applyNone:
        arr.append(0)
    else:
        arr.append(round(float(t), rounding))
    return arr


def process_company(df, company, commodity, points, units, save):
    meta = {"companyName": company}
    meta["units"] = units
    if company == "SouthernLights":
        frequency = "q"
    else:
        frequency = "m"

    if company in ["Montreal"]:
        applyNone = False
    else:
        applyNone = True
    meta["frequency"] = frequency
    meta['defaultPoint'] = get_default_point(company)
    this_company_data = {}
    folder_name = company.replace(' ', '').replace('.', '')
    df_c = df[df['Pipeline Name'] == company].copy().reset_index(drop=True)
    if not df_c.empty:
        meta["build"] = True
        trend = meta_trend(df_c, commodity)
        meta["trendText"] = trend
        meta = meta_throughput(df_c, meta, commodity)
        this_key_points = points[points['Pipeline Name'] == company].copy().reset_index(drop=True)
        this_key_points['loc'] = [[lat, long] for lat, long in zip(this_key_points['Latitude'], this_key_points['Longitude'])]
        for delete in ['Pipeline Name', 'Latitude', 'Longitude', 'Description', 'Description FRA', 'Key Point']:
            del this_key_points[delete]
        meta['keyPoints'] = this_key_points.to_dict(orient='records')
        for delete in ['Direction of Flow']:
            del df_c[delete]

        point_data = {}
        points_list = sorted(list(set(df_c['KeyPointID'])))
        for p in points_list:
            rounding = get_rounding(p)
            point_capacity, point_import_capacity = [], []
            df_p = df_c[df_c['KeyPointID'] == p].copy().reset_index(drop=True)
            df_p = df_p.groupby(['Date', 'KeyPointID', 'Trade Type']).agg({'Capacity':'mean','Throughput':'sum'}).reset_index()
            traffic_types = {}
            counter = 0
            point_dates = sorted(list(set(df_p['Date'])))
            df_p = df_p.drop_duplicates(subset=['Date', 'KeyPointID', 'Trade Type'], ignore_index=True)
            trade_data, date_added = [], []
            for tr in list(set(df_p['Trade Type'])):
                df_p_t = df_p[df_p['Trade Type'] == tr].copy()
                df_p_t = df_p_t.merge(pd.DataFrame(point_dates), how='right', left_on='Date', right_on=0)
                del[df_p_t[0]]
                for total_fill in ['KeyPointID', 'Trade Type']:
                    df_p_t[total_fill] = df_p_t[total_fill].fillna(method="bfill").fillna(method='ffill')

                for num_fill in ['Throughput', 'Capacity']:
                    df_p_t[num_fill] = df_p_t[num_fill].fillna(0)
                trade_data.append(df_p_t)
            df_p = pd.concat(trade_data, ignore_index=True).copy()
            if p == "KP0016":
                df_p = df_p.sort_values(by=['Trade Type', 'Date'], ascending=[True, True])
            for date, t, c, trade in zip(df_p['Date'], df_p['Throughput'], df_p['Capacity'], df_p['Trade Type']):
                t, c = float(t), float(c)

                if trade in traffic_types:
                    traffic_types[trade] = push_traffic(t, traffic_types[trade], rounding, applyNone)
                else:
                    traffic_types[trade] = push_traffic(t, [], rounding, applyNone)

                if date not in date_added and trade != "im":
                    point_capacity = push_traffic(c, point_capacity, rounding, True)
                    date_added.append(date)

                if trade == "im":
                    point_import_capacity = push_traffic(c, point_import_capacity, rounding, True)

                counter = counter + 1

            throughput_series = []
            if frequency == "m":
                min_date = min(point_dates) - dateutil.relativedelta.relativedelta(months=1)
            elif frequency == "d":
                min_date = min(point_dates) - dateutil.relativedelta.relativedelta(days=1)
            elif frequency == "q":
                min_date = min(point_dates) - dateutil.relativedelta.relativedelta(months=5)

            throughput_series.append({"id": "date", "min": [min_date.year, min_date.month-1, min_date.day]})

            for tt, data in traffic_types.items():
                if tt == "im":
                    yAxis = 1
                else:
                    yAxis = 0

                throughput_series.append({"id": tt,
                                          "yAxis": yAxis,
                                          "color": apply_colors(tt),
                                          "data": data})

            if len(point_import_capacity) > 0:
                throughput_series.append({"id": "icap",
                                          "yAxis": 1,
                                          "color": "#FFBE4B",
                                          "data": point_import_capacity})
                throughput_series.append({"id": "ecap",
                                          "yAxis": 0,
                                          "color": "#FFBE4B",
                                          "data": point_capacity})
            else:
                # check if there is at least one non null in the data
                has_data = False
                for val in point_capacity:
                    if val:
                        has_data = True
                        break

                if has_data:
                    throughput_series.append({"id": "cap",
                                              "yAxis": 0,
                                              "color": "#FFBE4B",
                                              "data": point_capacity})

            point_data[p] = throughput_series

        this_company_data["traffic"] = point_data
        this_company_data['meta'] = meta
        if save:
            with open('../data_output/traffic/'+folder_name+'.json', 'w') as fp:
                json.dump(this_company_data, fp, default=str)
    else:
        # there is no traffic data
        this_company_data['traffic'] = {}
        this_company_data['meta'] = {"companyName": company, "build": False}
        if save:
            with open('../data_output/traffic/'+folder_name+'.json', 'w') as fp:
                json.dump(this_company_data, fp)
    return this_company_data, df_c


def process_throughput(points,
                       save=False,
                       sql=False,
                       commodity='Gas',
                       companies=False,
                       frequency='m'):

    if commodity == 'Gas':
        if frequency == "m":
            query = 'throughput_gas_monthly.sql'

        df = get_traffic_data(sql, query)
        df = df.rename(columns={'Capacity (1000 m3/d)': 'Capacity',
                                'Throughput (1000 m3/d)': 'Throughput'})

        # Saturn corner case
        df = df.drop(df[(df['KeyPointID'] == "KP0036") & (df['Throughput'] == 0)].index)
        units = "Bcf/d"

    else:
        query = 'throughput_oil_monthly.sql'
        df = get_traffic_data(sql, query)
        df = df.rename(columns={'Available Capacity (1000 m3/d)': 'Capacity',
                                'Throughput (1000 m3/d)': 'Throughput'})
        df['Trade Type'] = [str(p).strip() for p in df['Product']]
        del df['Product']
        units = "Mb/d"

    df = conversion(df, commodity, ['Capacity', 'Throughput'], False, 0)
    df = df[df['Trade Type'] != "`"].copy().reset_index(drop=True)
    df = apply_trade_id(df)
    df['Date'] = pd.to_datetime(df['Date'])
    company_files = get_company_list(commodity)

    if companies:
        company_files = companies

    for company in company_files:
        try:
            this_company_data, df_c = process_company(df, company, commodity, points, units, save)
            print("completed: "+company)
        except:
            print("traffic error: "+company)
            raise
    return this_company_data, df_c


def get_points(sql):
    def point_lookup(p, desc="Description"):
        return {kpId: [n, d] for kpId, n, d in zip(p['KeyPointID'], p['Key Point'], p[desc])}
    points = get_traffic_data(sql, 'key_points.sql')
    points = points.fillna("")
    eng = point_lookup(points, "Description")
    fra = point_lookup(points, "Description FRA")
    eng["KP0000"] = ["system", "Pipeline throughput is measured at the system level (entire pipeline) instead of individual key points."]
    fra["KP0000"] = ["Réseau", "Le débit du pipeline est mesuré au niveau du système (tout le pipeline) au lieu de points clés individuels."]
    with open('../data_output/traffic/points/en.json', 'w') as fp:
        json.dump(eng, fp)
    with open('../data_output/traffic/points/fr.json', 'w') as fp:
        json.dump(fra, fp)

    # filter out enbridge apportionment points
    points = points[points["Latitude"] != ""].copy().reset_index(drop=True)
    return points


def combined_traffic(save=True, sql=True):
    points = get_points(sql)
    process_throughput(points, save=save, sql=sql, commodity='Gas', frequency='m') # , companies=["TCPL"])
    process_throughput(points, save=save, sql=sql, commodity='Liquid', frequency='m') # , companies=['Montreal'])


# TODO: enforce case on text columns
# TODO: add warnings in case id replace doesnt cover everything in column
if __name__ == "__main__":
    print('starting throughput...')
    combined_traffic(save=True, sql=False)
    print('completed throughput!')
