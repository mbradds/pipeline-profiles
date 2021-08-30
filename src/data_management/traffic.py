import pandas as pd
from util import execute_sql, normalize_text, normalize_numeric, conversion, idify, get_company_list
import os
import json
import dateutil.relativedelta
script_dir = os.path.dirname(__file__)


def addIds(df):
    df = df[df['Key Point'] != "FortisBC Lower Mainland"]
    df = df[df['Key Point'] != "St Clair"]
    points = {'system': '0',
              'KP0000': '0',
              'Border': '1',
              'Zone 2': '2',
              'Huntingdon/FortisBC Lower Mainland': '3',
              'Kingsvale': '4',
              'NOVA/Gordondale': '5',
              'Sunset Creek': '6',
              'St. Stephen': '7',
              'Chippawa': '8',
              'Cromer/Regina': '9',
              'Eastern Triangle - NOL Receipts': '10',
              'Eastern Triangle - Parkway Deliveries': '11',
              'Eastern Triangle - Parkway Receipts': '12',
              'Emerson I': '13',
              'Emerson II': '14',
              'ex-Cromer': '15',
              'ex-Gretna': '16',
              'Into-Sarnia': '17',
              'Iroquois': '18',
              'Niagara': '19',
              'Northern Ontario Line': '20',
              'Other US Northeast': '21',
              'Prairies': '22',
              'St Clair': '23',
              'Ft. Saskatchewan': '24',
              'Regina': '25',
              'Windsor': '26',
              'Kingsgate': '27',
              'Monchy': '28',
              'International boundary at or near Haskett, Manitoba': '29',
              'East Gate': '30',
              'North and East': '31',
              'Upstream of James River': '32',
              'West Gate': '33',
              'Zama': '34',
              'Burnaby': '35',
              'Sumas': '36',
              'Westridge': '37',
              'East Hereford': '38',
              'Saint Lazare': '39',
              'Calgary': '40',
              'Edmonton': '41',
              'OSDA Kirby': '42',
              'OSDA Liege': '43',
              'Saturn': '44'
              }

    df['Key Point'] = df['Key Point'].replace(points)
    return df


def applyTradeId(df):
    trade = {"intracanada": "in",
             "export": "ex",
             "import": "im",
             "capacity": "cap",
             "domestic heavy": "dh",
             "refined petroleum products": "rp",
             "domestic light": "dl",
             "domestic light / ngl": "dln",
             "natural gas liquids (ngl)": "ngl",
             "foreign light": "fl",
             "condensate": "co",
             "diluent": "di",
             "diluent (committed)": "dic",
             "diluent (uncommitted)": "diu",
             "southeast sask (SES) crude": "ses",
             "petroleum": "pet",
             "westspur midale (MSM) crude": "msm"}
    df = idify(df, "Trade Type", trade, False)
    return df


def applyColors(trade_type):
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
              "diu": "#FF821E"}
    return colors[trade_type]


def fixKeyPoint(df):
    df['Key Point'] = df['Key Point'].replace({"Huntingdon Export": "Huntingdon/FortisBC Lower Mainland",
                                               "Baileyville, Ma. / St. Stephen N.B.": "St. Stephen"})
    df = df[~df['Key Point'].isin(['Regina', 'Windsor'])].reset_index(drop=True)
    return df


def get_data(sql=False, query='throughput_gas_monthly.sql', db="PipelineInformation"):

    csvName = query.split(".")[0]+'.csv'
    if sql:
        print('reading sql '+query.split(".")[0])
        df = execute_sql(path=os.path.join(script_dir, "queries"), query_name=query, db=db)
        df.to_csv('raw_data/'+csvName, index=False)

    else:
        print('reading local '+query.split(".")[0])
        df = pd.read_csv('raw_data/'+csvName, encoding='latin-1')

    # inital processing for key points
    if query == 'key_points.sql':
        # add extra key points that dont appear in database
        df = fixKeyPoint(df)
        df = normalize_text(df, ['Key Point', 'Pipeline Name'])
        df = normalize_numeric(df, ['Latitude', 'Longitude'], 3)
        df = addIds(df)

    return df


def meta_throughput(df_c, meta, data):
    def direction_list(dr):
        dr = dr[0].split("&")
        dr = [x.strip() for x in dr]
        return dr

    df_meta = df_c[['Key Point', 'Direction of Flow', 'Trade Type']].copy()
    if data == "oil":
        df_meta['Trade Type'] = [x.split("-")[-1].strip() for x in df_meta['Trade Type']]
    df_meta = df_meta.drop_duplicates().reset_index(drop=True)
    df_meta = df_meta.sort_values(by=['Key Point', 'Trade Type'])
    df_meta = df_meta.groupby(['Key Point']).agg(direction=("Direction of Flow", set),
                                                 trade=("Trade Type", set))

    df_meta = df_meta.reset_index()
    for col in ['direction', 'trade']:
        df_meta[col] = [list(x) for x in df_meta[col]]

    directions = {}
    directionId = {'north': 'n',
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
    for key, flow, trade in zip(df_meta['Key Point'], df_meta['direction'], df_meta['trade']):
        try:
            directions[key] = [directionId[x.lower()] for x in flow]
        except:
            directions[key] = flow
    meta["directions"] = directions
    return meta


def getRounding(point):
    if point in ['Kingsvale', 'NOVA/Gordondale', 'St. Stephen']:
        rounding = 4
    elif point in ['Emerson II', 'Eastern Triangle - Parkway Deliveries']:
        rounding = 3
    else:
        rounding = 2
    return rounding


def meta_trend(df_c, commodity):

    def group_trends(df):
        df = df.groupby(['Date', 'Pipeline Name', 'Key Point']).agg({'Capacity': 'mean', 'Throughput': 'sum'})
        df = df.reset_index()
        return df

    def calculate_trend(dfp, metaTrends, point, trendName, commodity):
        dfp = dfp.sort_values(by='Date', ascending=True)
        dfp = dfp.set_index('Date')
        dfp = dfp.groupby(['Pipeline Name', 'Key Point', 'Direction of Flow', 'Trade Type']).resample('Q', convention='end').agg('mean').reset_index()
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
            if oldThrough > 0:
                pct = int(round((newThrough-oldThrough)/abs(oldThrough)*100, 0))
            else:
                pct = None
            thisTrend["throughChange"] = {"pct": pct,
                                          "from": round(oldThrough, rounding),
                                          "to": round(newThrough, rounding)}
        except:
            raise

        thisTrend["fromDate"] = [oldDate.year, oldDate.month]
        thisTrend["toDate"] = [newDate.year, newDate.month]
        thisTrend["name"] = trendName
        metaTrends[point].append(thisTrend)
        return metaTrends

    metaTrends = {}
    for point in list(set(df_c['Key Point'])):
        rounding = getRounding(point)
        df_t = df_c.copy()
        dfp = df_t[df_t['Key Point'] == point].copy().reset_index(drop=True)
        metaTrends[point] = []
        if "im" in list(dfp['Trade Type']):
            dfImport = dfp[dfp['Trade Type'] == "im"].copy()
            dfOther = dfp[dfp['Trade Type'] != "im"].copy()
            metaTrends = calculate_trend(dfOther, metaTrends, point, "ex", commodity)
            metaTrends = calculate_trend(dfImport, metaTrends, point, "im", commodity)
        else:
            metaTrends = calculate_trend(dfp, metaTrends, point, "default", commodity)
    return metaTrends


def getDefaultPoint(company):
    defaults = {'NGTL': '32',
                'Westcoast': '3',
                'TCPL': '22',
                'Alliance': '1',
                'Brunswick': '0',
                'TQM': '39',
                'Foothills': '27',
                'MNP': '7',
                'EnbridgeMainline': '16',
                'Keystone': '29',
                'TransMountain': '35',
                'Cochin': '24',
                'TransNorthern': '0',
                'NormanWells': '34',
                'SouthernLights': '0',
                'Westspur': '0'}
    try:
        return defaults[company]
    except:
        return '0'


def process_throughput(save=False,
                       sql=False,
                       commodity='Gas',
                       companies=False,
                       frequency='m'):

    def pushTraffic(t, arr, date, rounding):
        if t == 0:
            arr.append(None)
        else:
            arr.append(round(float(t), rounding))
        return arr

    if commodity == 'gas':
        if frequency == "m":
            query = 'throughput_gas_group2.sql'
        else:
            query = 'throughput_gas.sql'

        df = get_data(sql, query)
        df = df.rename(columns={'Capacity (1000 m3/d)': 'Capacity',
                                'Throughput (1000 m3/d)': 'Throughput'})

        df = df.drop(df[(df['Key Point'] == "Saturn") & (df['Throughput'] == 0)].index)
        units = "Bcf/d"

    else:
        query = 'throughput_oil_group2.sql'
        df = get_data(sql, query)
        df = df.rename(columns={'Available Capacity (1000 m3/d)': 'Capacity',
                                'Throughput (1000 m3/d)': 'Throughput'})
        df['Trade Type'] = [str(p).strip() for p in df['Product']]
        del df['Product']
        units = "Mb/d"

    df = conversion(df, commodity, ['Capacity', 'Throughput'], False, 0)
    df = df[df['Trade Type'] != "`"].copy().reset_index(drop=True)
    df = fixKeyPoint(df)
    df = addIds(df)
    df = applyTradeId(df)
    points = get_data(sql, 'key_points.sql')

    df['Date'] = pd.to_datetime(df['Date'])

    company_files = get_company_list(commodity)
    group2 = []

    if companies:
        company_files = companies

    for company in company_files:
        meta = {"companyName": company}
        meta["units"] = units
        if company == "SouthernLights":
            frequency = "q"
        else:
            frequency = "m"
        meta["frequency"] = frequency
        meta['defaultPoint'] = getDefaultPoint(company)
        thisCompanyData = {}
        folder_name = company.replace(' ', '').replace('.', '')
        df_c = df[df['Pipeline Name'] == company].copy().reset_index(drop=True)
        if not df_c.empty and company not in group2:
            meta["build"] = True
            trend = meta_trend(df_c, commodity)
            meta["trendText"] = trend
            meta = meta_throughput(df_c, meta, commodity)
            thisKeyPoints = points[points['Pipeline Name'] == company].copy().reset_index(drop=True)
            thisKeyPoints['loc'] = [[lat, long] for lat, long in zip(thisKeyPoints['Latitude'], thisKeyPoints['Longitude'])]
            for delete in ['Pipeline Name', 'Latitude', 'Longitude']:
                del thisKeyPoints[delete]
            meta['keyPoints'] = thisKeyPoints.to_dict(orient='records')
            for delete in ['Direction of Flow']:
                del df_c[delete]

            point_data = {}
            pointsList = sorted(list(set(df_c['Key Point'])))
            for p in pointsList:
                rounding = getRounding(p)
                pointCapacity, pointImportCapacity = [], []
                df_p = df_c[df_c['Key Point'] == p].copy().reset_index(drop=True)
                df_p = df_p.groupby(['Date', 'Key Point', 'Trade Type']).agg({'Capacity':'mean','Throughput':'sum'}).reset_index()
                traffic_types = {}
                counter = 0
                pointDates = sorted(list(set(df_p['Date'])))
                df_p = df_p.drop_duplicates(subset=['Date', 'Key Point', 'Trade Type'], ignore_index=True)
                tradeData, dateAdded = [], []
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
                if p == "16":
                    df_p = df_p.sort_values(by=['Trade Type', 'Date'], ascending=[True, True])
                for date, t, c, trade in zip(df_p['Date'], df_p['Throughput'], df_p['Capacity'], df_p['Trade Type']):
                    t, c = float(t), float(c)

                    if trade in traffic_types:
                        traffic_types[trade] = pushTraffic(t, traffic_types[trade], date, rounding)
                    else:
                        traffic_types[trade] = pushTraffic(t, [], date, rounding)

                    if date not in dateAdded and trade != "im":
                        pointCapacity = pushTraffic(c, pointCapacity, date, rounding)
                        dateAdded.append(date)

                    if trade == "im":
                        pointImportCapacity = pushTraffic(c, pointImportCapacity, date, rounding)

                    counter = counter + 1

                throughput_series = []
                if frequency == "m":
                    minDate = min(pointDates) - dateutil.relativedelta.relativedelta(months=1)
                elif frequency == "d":
                    minDate = min(pointDates) - dateutil.relativedelta.relativedelta(days=1)
                elif frequency == "q":
                    minDate = min(pointDates) - dateutil.relativedelta.relativedelta(months=5)

                throughput_series.append({"id": "date", "min": [minDate.year, minDate.month-1, minDate.day]})

                for tt, data in traffic_types.items():
                    if tt == "im":
                        yAxis = 1
                    else:
                        yAxis = 0

                    throughput_series.append({"id": tt,
                                              "yAxis": yAxis,
                                              "color": applyColors(tt),
                                              "data": data})

                if len(pointImportCapacity) > 0:
                    throughput_series.append({"id": "icap",
                                              "yAxis": 1,
                                              "color": "#FFBE4B",
                                              "data": pointImportCapacity})
                    throughput_series.append({"id": "ecap",
                                              "yAxis": 0,
                                              "color": "#FFBE4B",
                                              "data": pointCapacity})
                else:
                    # check if there is at least one non null in the data
                    hasData = False
                    for val in pointCapacity:
                        if val:
                            hasData = True
                            break

                    if hasData:
                        throughput_series.append({"id": "cap",
                                                  "yAxis": 0,
                                                  "color": "#FFBE4B",
                                                  "data": pointCapacity})

                point_data[p] = throughput_series

            thisCompanyData["traffic"] = point_data
            thisCompanyData['meta'] = meta
            if save:
                print('saving '+company)
                with open('../data_output/traffic/'+folder_name+'.json', 'w') as fp:
                    json.dump(thisCompanyData, fp, default=str)
        else:
            # there is no traffic data
            thisCompanyData['traffic'] = {}
            thisCompanyData['meta'] = {"companyName": company, "build": False}
            if save:
                print('saving '+company)
                with open('../data_output/traffic/'+folder_name+'.json', 'w') as fp:
                    json.dump(thisCompanyData, fp)

    return thisCompanyData, df_c


# TODO: enforce case on text columns
# TODO: add warnings in case id replace doesnt cover everything in column
if __name__ == "__main__":
    print('starting throughput...')
    # points = get_data(False, True, "key_points.sql")
    # oil = get_data(True, True, query="throughput_oil_monthly.sql")
    # gas = get_data(True, True, query="throughput_gas_monthly.sql")
    # traffic, df = process_throughput(save=True, sql=False, commodity='Gas', frequency='m')
    traffic, df = process_throughput(save=True, sql=False, commodity='Liquid', frequency='m', companies=['EnbridgeMainline'])
    print('completed throughput!')
