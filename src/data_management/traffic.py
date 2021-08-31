import pandas as pd
from util import execute_sql, normalize_text, normalize_numeric, conversion, idify, get_company_list
import os
import json
import dateutil.relativedelta
script_dir = os.path.dirname(__file__)


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


def get_traffic_data(sql=False, query='throughput_gas_monthly.sql', db="PipelineInformation"):

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
    for key, flow, trade in zip(df_meta['KeyPointID'], df_meta['direction'], df_meta['trade']):
        try:
            directions[key] = [directionId[x.lower()] for x in flow]
        except:
            directions[key] = flow
    meta["directions"] = directions
    return meta


# TODO: create a general purpose round finder by looking at the average throughput
def getRounding(point):
    if point in ['KP0023', 'KP0029', 'KP0046']:
        rounding = 4
    elif point in ['KP0014', 'KP0010']:
        rounding = 3
    else:
        rounding = 2
    return rounding


def meta_trend(df_c, commodity):

    def group_trends(df):
        df = df.groupby(['Date', 'Pipeline Name', 'KeyPointID']).agg({'Capacity': 'mean', 'Throughput': 'sum'})
        df = df.reset_index()
        return df

    def calculate_trend(dfp, metaTrends, point, trendName, commodity):
        dfp = dfp.sort_values(by='Date', ascending=True)
        dfp = dfp.set_index('Date')
        dfp = dfp.groupby(['Pipeline Name', 'KeyPointID', 'Direction of Flow', 'Trade Type']).resample('Q', convention='end').agg('mean').reset_index()
        if commodity == "Gas":
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
    for point in list(set(df_c['KeyPointID'])):
        rounding = getRounding(point)
        df_t = df_c.copy()
        dfp = df_t[df_t['KeyPointID'] == point].copy().reset_index(drop=True)
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
    defaults = {'NGTL': 'KP0040',
                'Westcoast': 'KPWESC',
                'TCPL': 'KP0033',
                'Alliance': 'KP0002',
                'TQM': 'KP0035',
                'Foothills': 'KP0023',
                'MNP': 'KP0046',
                'EnbridgeMainline': 'KP0016',
                'Keystone': 'KP0020',
                'TransMountain': 'KP0003',
                'Cochin': 'KP0018',
                'NormanWells': 'KP0044'}
    try:
        return defaults[company]
    except:
        return 'KP0000'


def process_throughput(points,
                       save=False,
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
    df = applyTradeId(df)
    df['Date'] = pd.to_datetime(df['Date'])
    company_files = get_company_list(commodity)

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
        if not df_c.empty:
            if company == "MNP":
                df_c["KeyPointID"] = "KP0046"
            meta["build"] = True
            trend = meta_trend(df_c, commodity)
            meta["trendText"] = trend
            meta = meta_throughput(df_c, meta, commodity)
            thisKeyPoints = points[points['Pipeline Name'] == company].copy().reset_index(drop=True)
            thisKeyPoints['loc'] = [[lat, long] for lat, long in zip(thisKeyPoints['Latitude'], thisKeyPoints['Longitude'])]
            for delete in ['Pipeline Name', 'Latitude', 'Longitude', 'Description', 'Description FRA', 'Key Point']:
                del thisKeyPoints[delete]
            meta['keyPoints'] = thisKeyPoints.to_dict(orient='records')
            for delete in ['Direction of Flow']:
                del df_c[delete]

            point_data = {}
            pointsList = sorted(list(set(df_c['KeyPointID'])))
            for p in pointsList:
                rounding = getRounding(p)
                pointCapacity, pointImportCapacity = [], []
                df_p = df_c[df_c['KeyPointID'] == p].copy().reset_index(drop=True)
                df_p = df_p.groupby(['Date', 'KeyPointID', 'Trade Type']).agg({'Capacity':'mean','Throughput':'sum'}).reset_index()
                traffic_types = {}
                counter = 0
                pointDates = sorted(list(set(df_p['Date'])))
                df_p = df_p.drop_duplicates(subset=['Date', 'KeyPointID', 'Trade Type'], ignore_index=True)
                tradeData, dateAdded = [], []
                for tr in list(set(df_p['Trade Type'])):
                    df_p_t = df_p[df_p['Trade Type'] == tr].copy()
                    df_p_t = df_p_t.merge(pd.DataFrame(pointDates), how='right', left_on='Date', right_on=0)
                    del[df_p_t[0]]
                    for totalFill in ['KeyPointID', 'Trade Type']:
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


def getPoints(sql):
    def pointLookup(p, desc="Description"):
        return {kpId: [n, d] for kpId, n, d in zip(p['KeyPointID'], p['Key Point'], p[desc])} 
    points = get_traffic_data(sql, 'key_points.sql')
    points = points.fillna("")
    eng = pointLookup(points, "Description")
    fra = pointLookup(points, "Description FRA")
    eng["KP0000"] = ["system", "Pipeline throughput is measured at the system level (entire pipeline) instead of individual key points."]
    fra["KP0000"] = ["Réseau", "Le débit du pipeline est mesuré au niveau du système (tout le pipeline) au lieu de points clés individuels."]
    with open('../data_output/traffic/points/en.json', 'w') as fp:
        json.dump(eng, fp)
    with open('../data_output/traffic/points/fr.json', 'w') as fp:
        json.dump(fra, fp)
    return points


def combined_traffic(save=True, sql=True):
    points = getPoints(sql)
    gas, df_gas = process_throughput(points, save=save, sql=sql, commodity='Gas', frequency='m')
    oil, df_oil = process_throughput(points, save=save, sql=sql, commodity='Liquid', frequency='m') #, companies=['EnbridgeMainline'])
    return [gas, oil]


# TODO: enforce case on text columns
# TODO: add warnings in case id replace doesnt cover everything in column
if __name__ == "__main__":
    print('starting throughput...')
    # points = get_traffic_data(False, True, "key_points.sql")
    # oil = get_traffic_data(True, True, query="throughput_oil_monthly.sql")
    # gas = get_traffic_data(True, True, query="throughput_gas_monthly.sql")
    combined_traffic(save=True, sql=True)
    print('completed throughput!')
