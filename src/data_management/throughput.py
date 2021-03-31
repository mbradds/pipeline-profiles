import pandas as pd
from util import execute_sql, normalize_dates, most_common, get_company_names, normalizeBool, normalize_text, normalize_numeric
import os
import json
import dateutil.relativedelta
script_dir = os.path.dirname(__file__)


def applyColors(trade_type):
    trade_type = trade_type.split("-")[0].strip()
    colors = {"intracanada": "#054169",
              "export": "#559B37",
              "import": "#5FBEE6",
              "capacity": "#FFBE4B",
              "domestic heavy": "#054169",
              "refined petroleum products": "#FF821E",
              "domestic light": "#5FBEE6",
              "domestic light / ngl": "#559B37",
              "natural gas liquids (ngl)": "#FFBE4B",
              "foreign light": "#8c8c96",
              "condensate": "#871455",
              "diluent": "#871455",
              "south east sask (ses) crude": "#054169",
              "westspur midale (msm) crude": "#559B37"}
    return colors[trade_type]


def fixCorporateEntity(df):
    df['Corporate Entity'] = df['Corporate Entity'].replace({'NOVA Gas Transmission Ltd. (NGTL)': 'NOVA Gas Transmission Ltd.',
                                                             "Alliance Pipeline Limited Partnership": "Alliance Pipeline Ltd.",
                                                             "Trans QuÃ©bec & Maritimes Pipeline Inc": "Trans Quebec and Maritimes Pipeline Inc.",
                                                             "Trans Québec & Maritimes Pipeline Inc": "Trans Quebec and Maritimes Pipeline Inc.",
                                                             "Foothills Pipe Lines Ltd. (Foothills)": "Foothills Pipe Lines Ltd.",
                                                             "Maritimes & Northeast Pipeline": "Maritimes & Northeast Pipeline Management Ltd."})
    return df


def fixKeyPoint(df):
    df['Key Point'] = df['Key Point'].replace({"Huntingdon Export": "Huntingdon/FortisBC Lower Mainland",
                                               "Baileyville, Ma. / St. Stephen N.B.": "St. Stephen"})
    df = df[~df['Key Point'].isin(['Regina', 'Windsor'])].reset_index(drop=True)
    return df


def get_data(test, sql=False, query='throughput_gas_monthly.sql'):

    csvName = query.split(".")[0]+'.csv'
    if sql:
        print('reading sql '+query.split(".")[0])
        df = execute_sql(path=script_dir, query_name=query, db='EnergyData')
        df.to_csv('raw_data/'+csvName, index=False)
    elif test:
        print('reading test '+query.split(".")[0])
        df = pd.read_csv('raw_data/test_data/'+csvName)
    else:
        print('reading local '+query.split(".")[0])
        df = pd.read_csv('raw_data/'+csvName, encoding='latin-1')

    # inital processing for key points
    if query == 'key_points.sql':
        # add extra key points that dont appear in database
        new = range(5)
        others = pd.DataFrame.from_dict({"Key Point": ["Calgary", "Edmonton", "Saturn", "OSDA Kirby", "OSDA Liege"],
                                         "Corporate Entity": ["NOVA Gas Transmission Ltd." for x in new],
                                         "Latitude": [51.22022, 51.80478, 55.99558, 53.31907, 56.9473],
                                         "Longitude": [-114.4925, -113.59329, -121.1104, -111.35386, -111.80979]})
        df = fixKeyPoint(df)
        df = df.append(others, ignore_index=True)
        df = normalize_text(df, ['Key Point', 'Corporate Entity'])
        df = normalize_numeric(df, ['Latitude', 'Longitude'], 3)
        df = fixCorporateEntity(df)
        df = df[df['Key Point'] != "FortisBC Lower Mainland"]

    return df


def meta_throughput(df_c, meta, data):
    df_meta = df_c[['Key Point', 'Direction of Flow', 'Trade Type']].copy()
    if data == "oil":
        df_meta['Trade Type'] = [x.split("-")[-1].strip() for x in df_meta['Trade Type']]
    df_meta = df_meta.drop_duplicates().reset_index(drop=True)
    df_meta = df_meta.sort_values(by=['Key Point', 'Trade Type'])
    df_meta = df_meta.groupby(['Key Point']).agg(direction=("Direction of Flow", set),
                                                 trade=("Trade Type", set))

    df_meta = df_meta.reset_index()
    for col in ['direction', 'trade']:
        df_meta[col] = [" & ".join(list(x)) for x in df_meta[col]]
    for col in df_meta:
        df_meta[col] = [x.strip() for x in df_meta[col]]

    directions = {}
    for key, flow, trade in zip(df_meta['Key Point'], df_meta['direction'], df_meta['trade']):
        directions[key] = [flow, trade]

    meta["directions"] = directions
    return meta


def getRounding(point):
    if point in ['Kingsvale', 'NOVA/Gordondale', 'St. Stephen']:
        rounding = 4
    else:
        rounding = 2
    return rounding


def meta_trend(df_c, commodity):

    def group_trends(df):
        df = df.groupby(['Date', 'Corporate Entity', 'Key Point']).agg({'Capacity': 'mean', 'Throughput': 'sum'})
        df = df.reset_index()
        return df

    def calculate_trend(dfp, metaTrends, point, trendName, commodity):
        dfp = dfp.sort_values(by='Date', ascending=True)
        dfp = dfp.set_index('Date')
        dfp = dfp.groupby(['Corporate Entity', 'Key Point', 'Direction of Flow', 'Trade Type']).resample('Q', convention='end').agg('mean').reset_index()
        if commodity == "gas":
            dfp = dfp[dfp['Date'] >= max(dfp['Date']) - dateutil.relativedelta.relativedelta(months=12)].copy().reset_index(drop=True)
        else:
            dfp = dfp[dfp['Date'] >= max(dfp['Date']) - dateutil.relativedelta.relativedelta(months=3)].copy().reset_index(drop=True)

        df_old = dfp[dfp['Date'] == min(dfp['Date'])].copy().reset_index(drop=True)
        df_new = dfp[dfp['Date'] == max(dfp['Date'])].copy().reset_index(drop=True)

        df_old = group_trends(df_old)
        df_new = group_trends(df_new)
        newThrough, newCap, newDate = df_new.loc[0, "Throughput"], df_new.loc[0, "Capacity"], df_new.loc[0, "Date"]
        oldThrough, oldCap, oldDate = df_old.loc[0, "Throughput"], df_old.loc[0, "Capacity"], df_old.loc[0, "Date"]

        thisTrend = {}
        try:
            thisTrend["throughChange"] = {"pct": int(round((newThrough-oldThrough)/abs(oldThrough)*100, 0)),
                                                  "from": round(oldThrough, rounding),
                                                  "to": round(newThrough, rounding)}
        except:
            thisTrend["throughChange"] = {"pct": 0, "from": 0, "to": 0}

        thisTrend["fromDate"] = [oldDate.year, oldDate.month]
        thisTrend["toDate"] = [newDate.year, newDate.month]
        thisTrend["name"] = trendName
        metaTrends[point].append(thisTrend)
        return metaTrends

    metaTrends = {}
    for point in list(set(df_c['Key Point'])):
        rounding = getRounding(point)
        df_t = df_c.copy()
        # del df_t['Json Date']
        dfp = df_t[df_t['Key Point'] == point].copy().reset_index(drop=True)
        metaTrends[point] = []
        if "import" in list(dfp['Trade Type']):
            dfImport = dfp[dfp['Trade Type'] == "import"].copy()
            dfOther = dfp[dfp['Trade Type'] != "import"].copy()
            metaTrends = calculate_trend(dfOther, metaTrends, point, "export", commodity)
            metaTrends = calculate_trend(dfImport, metaTrends, point, "import", commodity)
        else:
            metaTrends = calculate_trend(dfp, metaTrends, point, "default", commodity)
    return metaTrends


def serialize(df, col):
    serialized_col = []
    for date in df[col]:
        dateSeries = int(''.join(list(pd.Series(date).to_json(orient='records'))[1:-1]))
        serialized_col.append(dateSeries)

    df['Json Date'] = serialized_col
    return df


def getDefaultPoint(company):
    defaults = {'NOVA Gas Transmission Ltd.': 'Upstream of James River',
                'Westcoast Energy Inc.': 'Huntingdon/FortisBC Lower Mainland',
                'TransCanada PipeLines Limited': 'Prairies',
                'Alliance Pipeline Ltd.': 'Border',
                'Emera Brunswick Pipeline Company Ltd.': 'system',
                'Trans Quebec and Maritimes Pipeline Inc.': 'Saint Lazare',
                'Foothills Pipe Lines Ltd.': 'Kingsgate',
                'Maritimes & Northeast Pipeline Management Ltd.': 'St. Stephen',
                'Enbridge Pipelines Inc.': 'ex-Gretna',
                'TransCanada Keystone Pipeline GP Ltd.': 'International boundary at or near Haskett, Manitoba',
                'Trans Mountain Pipeline ULC': 'Burnaby',
                'PKM Cochin ULC': 'Ft. Saskatchewan',
                'Trans-Northern Pipelines Inc.': 'system',
                'Enbridge Pipelines (NW) Inc.': 'Zama',
                'Enbridge Southern Lights GP Inc.': 'system',
                'TEML Westpur Pipelines Limited (TEML)': 'system'}
    try:
        return defaults[company]
    except:
        return None


def conversion(df, data):
    if data == 'gas':
        for col in ['Capacity (1000 m3/d)', 'Throughput (1000 m3/d)']:
            df[col] = df[col].fillna(0)
            df[col] = [x/28316.85 for x in df[col]]
    else:
        for col in ['Capacity', 'Throughput']:
            df[col] = df[col].fillna(0)
            df[col] = [(x*6.2898) for x in df[col]]
    return df


def process_throughput(test=False, sql=False, commodity='gas', companies=False):

    def pushTraffic(t, arr, date, rounding):
        if t == 0:
            arr.append(None)
        else:
            arr.append(round(float(t), rounding))
        return arr

    if not os.path.exists("../traffic"):
        os.mkdir("../traffic")
        os.mkdir("../traffic/company_data")

    if commodity == 'gas':
        query = 'throughput_gas_monthly.sql'
        df = get_data(test, sql, query)
        df = conversion(df, commodity)
        df = df.rename(columns={'Capacity (1000 m3/d)': 'Capacity',
                                'Throughput (1000 m3/d)': 'Throughput'})
        df = df.drop(df[(df['Key Point'] == "Saturn") & (df['Throughput'] == 0)].index)
        units = "Bcf/d"
    else:
        query = 'throughput_oil_monthly.sql'
        df = get_data(test, sql, query)
        df = df.rename(columns={'Available Capacity (1000 m3/d)': 'Capacity',
                                'Throughput (1000 m3/d)': 'Throughput'})
        df = conversion(df, commodity)
        df['Trade Type'] = [str(p).strip()+"-"+str(tt).strip() for p, tt in zip(df['Product'], df['Trade Type'])]
        del df['Product']
        units = "Mb/d"

    # print(list(set(df['Corporate Entity'])))
    points = get_data(False, sql, 'key_points.sql')

    df['Date'] = pd.to_datetime(df['Date'])
    # df = serialize(df, 'Date')
    df = df[df['Trade Type'] != "`"].copy().reset_index(drop=True)
    df = fixCorporateEntity(df)
    df = fixKeyPoint(df)

    if commodity == 'gas':
        company_files = ['NOVA Gas Transmission Ltd.',
                         'Westcoast Energy Inc.',
                         'TransCanada PipeLines Limited',
                         'Alliance Pipeline Ltd.',
                         'Emera Brunswick Pipeline Company Ltd.',
                         'Trans Quebec and Maritimes Pipeline Inc.',
                         'Maritimes & Northeast Pipeline Management Ltd.',
                         'Many Islands Pipe Lines (Canada) Limited',
                         'Foothills Pipe Lines Ltd.']
    else:
        company_files = ['Enbridge Pipelines Inc.',
                         'TransCanada Keystone Pipeline GP Ltd.',
                         'Trans Mountain Pipeline ULC',
                         'PKM Cochin ULC',
                         'Trans-Northern Pipelines Inc.',
                         'Enbridge Pipelines (NW) Inc.',
                         'Enbridge Southern Lights GP Inc.',
                         'TEML Westpur Pipelines Limited (TEML)',
                         'Kingston Midstream Westspur Limited',
                         'Vector Pipeline Limited Partnership',
                         'Many Islands Pipe Lines (Canada) Limited',
                         'Plains Midstream Canada ULC',
                         'Enbridge Bakken Pipeline Company Inc.',
                         'Express Pipeline Ltd.',
                         'Genesis Pipeline Canada Ltd.',
                         'Montreal Pipe Line Limited']
    if companies:
        company_files = companies

    for company in company_files:
        meta = {"companyName": company}
        meta["units"] = units
        meta['defaultPoint'] = getDefaultPoint(company)
        thisCompanyData = {}
        folder_name = company.replace(' ', '').replace('.', '')
        df_c = df[df['Corporate Entity'] == company].copy().reset_index(drop=True)
        if not df_c.empty:
            trend = meta_trend(df_c, commodity)
            meta["trendText"] = trend
            meta = meta_throughput(df_c, meta, commodity)
            thisKeyPoints = points[points['Corporate Entity'] == company].copy().reset_index(drop=True)
            del thisKeyPoints['Corporate Entity']
            meta['keyPoints'] = thisKeyPoints.to_dict(orient='records')
            for delete in ['Direction of Flow', 'Corporate Entity']:
                del df_c[delete]

            # df_c = df_c.rename(columns={"Json Date": "Date"})
            point_data = {}
            pointsList = sorted(list(set(df_c['Key Point'])))
            # pointsList = ['Chippawa']
            for p in pointsList:
                rounding = getRounding(p)
                pointCapacity, pointImportCapacity = [], []
                df_p = df_c[df_c['Key Point'] == p].copy().reset_index(drop=True)
                df_p = df_p.groupby(['Date', 'Key Point', 'Trade Type']).agg({'Capacity':'mean','Throughput':'sum'}).reset_index()
                traffic_types = {}
                counter = 0
                lastDate = None
                pointDates = sorted(list(set(df_p['Date'])))
                df_p = df_p.drop_duplicates(subset=['Date', 'Key Point', 'Trade Type'], ignore_index=True)
                tradeData = []
                for tr in list(set(df_p['Trade Type'])):
                    df_p_t = df_p[df_p['Trade Type'] == tr].copy()
                    df_p_t = df_p_t.merge(pd.DataFrame(pointDates), how='right', left_on='Date', right_on=0)
                    del[df_p_t[0]]
                    for totalFill in ['Key Point', 'Trade Type']:
                        df_p_t[totalFill] = df_p_t[totalFill].fillna(method="bfill").fillna(method='ffill')

                    for numFill in ['Throughput', 'Capacity']:
                        df_p_t[numFill] = df_p_t[numFill].fillna(0)
                    tradeData.append(df_p_t)
                df_p = pd.concat(tradeData, ignore_index=True).copy()
                for date, t, c, trade in zip(df_p['Date'], df_p['Throughput'], df_p['Capacity'], df_p['Trade Type']):
                    t, c = float(t), float(c)
                    if trade in traffic_types:
                        traffic_types[trade] = pushTraffic(t, traffic_types[trade], date, rounding)
                    else:
                        traffic_types[trade] = pushTraffic(t, [], date, rounding)

                    if date != lastDate and trade != "import":
                        pointCapacity = pushTraffic(c, pointCapacity, date, rounding)

                    if trade == "import":
                        pointImportCapacity = pushTraffic(c, pointImportCapacity, date, rounding)

                    counter = counter + 1
                    lastDate = date

                throughput_series = []
                minDate = min(pointDates) - dateutil.relativedelta.relativedelta(months=1)
                throughput_series.append({"name": "date", "min": [minDate.year, minDate.month-1, minDate.day]})

                for tt, data in traffic_types.items():
                    if tt == "import":
                        yAxis = 1
                    else:
                        yAxis = 0

                    throughput_series.append({"name": tt,
                                              "yAxis": yAxis,
                                              "color": applyColors(tt),
                                              "data": data})

                if len(pointImportCapacity) > 0:
                    throughput_series.append({"name": "Import Capacity",
                                              "yAxis": 1,
                                              "color": "#FFBE4B",
                                              "data": pointImportCapacity})
                    throughput_series.append({"name": "Export Capacity",
                                              "yAxis": 0,
                                              "color": "#FFBE4B",
                                              "data": pointCapacity})
                else:
                    throughput_series.append({"name": "Capacity",
                                              "yAxis": 0,
                                              "color": "#FFBE4B",
                                              "data": pointCapacity})

                point_data[p] = throughput_series

            thisCompanyData["traffic"] = point_data
            thisCompanyData['meta'] = meta
            if not test:
                with open('../traffic/company_data/'+folder_name+'.json', 'w') as fp:
                    json.dump(thisCompanyData, fp, default=str)
        else:
            # there is no traffic data
            thisCompanyData['traffic'] = {}
            thisCompanyData['meta'] = {"companyName": company}
            if not test:
                with open('../traffic/company_data/'+folder_name+'.json', 'w') as fp:
                    json.dump(thisCompanyData, fp)

    return thisCompanyData, df_c


if __name__ == "__main__":
    print('starting throughput...')
    # points = get_data(False, False, "key_points.sql")
    # oil = get_data(False, True, query="throughput_oil_monthly.sql")
    # gas = get_data(False, True, query="throughput_gas_monthly.sql")
    traffic, df = process_throughput(test=False, sql=False, commodity='gas') #, companies=['TransCanada PipeLines Limited'])
    # traffic, df = process_throughput(test=False, sql=False, commodity='oil')
    print('completed throughput!')
    
#%%


