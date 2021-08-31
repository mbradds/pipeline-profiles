import pandas as pd
from util import normalize_dates, conversion, normalize_numeric, normalize_text, get_company_list, get_data
from traffic import get_traffic_data
from errors import ApportionSeriesCombinationError
import dateutil.relativedelta
import time
import json
import os
script_dir = os.path.dirname(__file__)


def getEnbridgePoints(sql=True):
    points = get_traffic_data(sql, 'key_points.sql')
    points = points.fillna("")
    points = points[points["Pipeline Name"] == "EnbridgeMainline"]
    return [pId for pId, desc in zip(points["KeyPointID"], points["Description"]) if desc == ""]


def hasData(df, col):
    if df[col].sum() > 0:
        return True
    else:
        return False


def hasNotNull(df, col):
    for x in df[col]:
        if not pd.isnull(x):
            return True
    return False


def apportionLine(df_p,
                  company,
                  pctData,
                  lineData,
                  areaData,
                  series):

    hasPct = hasNotNull(df_p, "Apportionment Percentage")
    hasCap = hasData(df_p, "Available Capacity")
    hasOrigNom = hasData(df_p, "Original Nominations")
    hasAccepNom = hasData(df_p, "Accepted Nominations")

    for cap, oNom, aNom, aPct in zip(df_p['Available Capacity'],
                                     df_p['Original Nominations'],
                                     df_p['Accepted Nominations'],
                                     df_p['Apportionment Percentage']):

        if hasCap and hasOrigNom:
            linePoint = cap
            areaPoint = oNom
            areaName = "on"  # Original Nominations
            lineName = "ac"  # Available Capacity
        elif hasOrigNom and hasAccepNom:
            linePoint = aNom
            areaPoint = oNom
            areaName = "on"
            lineName = "an"
        else:
            raise ApportionSeriesCombinationError(company)

        pctData.append(aPct)
        lineData.append(linePoint)
        areaData.append(areaPoint)

    series.append({"id": lineName,
                   "data": lineData,
                   "yAxis": 0,
                   "type": "line"})
    series.append({"id": areaName,
                   "data": areaData,
                   "yAxis": 0,
                   "type": "area"})
    if hasPct:
        series.append({"id": "ap",  # Apportionment Percent
                       "data": pctData,
                       "yAxis": 1,
                       "type": "line",
                       "visible": False,
                      })
    return series


def apportionPoint(df_p, company, pctData, series, kp, yAxis):
    data = df_p[['Date', 'Apportionment Percentage']]
    data = data.rename(columns={"Date": "x", "Apportionment Percentage": "y"})
    data = [[int(time.mktime(x.timetuple()))*1000, y] for x, y in zip(data['x'], data['y'])]
    series.append({
        "id": kp,
        "data": data,
        })
    return series


def process_apportionment(save=False, sql=False, companies=False):

    if sql:
        df = get_data(script_dir, "apportionment.sql", "PipelineInformation", sql)
    else:
        print('reading local apportionment csv...')
        df = pd.read_csv("./raw_data/apportionment.csv")

    df = normalize_dates(df, ['Date'])
    df = normalize_text(df, ['Pipeline Name'])
    # enbridge processing
    df = df.drop(df[(df['Pipeline Name'] == 'EnbridgeMainline') & (df['KeyPointID'].isin(['KP0016', 'KP0021']))].index)
    df = df.drop(df[(df['Pipeline Name'] == 'EnbridgeMainline') & (df['Date'].dt.year < 2016)].index)
    # cochin processing
    df = df.drop(df[(df['Pipeline Name'] == 'Cochin') & (df['KeyPointID'] != 'KP0018')].index)
    df = df[~df['Pipeline Name'].isin(["SouthernLights",
                                       "Westpur",
                                       "TransNorthern"])].reset_index(drop=True)

    df = df.rename(columns={x: x.split("(")[0].strip() for x in df.columns})
    numCols = ['Available Capacity',
               'Original Nominations',
               'Accepted Nominations',
               'Apportionment Percentage']
    df = normalize_numeric(df, numCols, 2)
    df = conversion(df, "oil", numCols[:-1], 2, False)
    df['Apportionment Percentage'] = df['Apportionment Percentage'].round(2)
    company_files = get_company_list("all")

    if companies:
        company_files = companies

    enbridgePoints = getEnbridgePoints(sql)

    for company in company_files:
        thisCompanyData = {}
        folder_name = company.replace(' ', '').replace('.', '')
        df_c = df[df['Pipeline Name'] == company].copy().reset_index(drop=True)
        df_c = df_c.where(pd.notnull(df_c), None)
        if not df_c.empty:
            thisCompanyData['build'] = True
            df_c = df_c.drop_duplicates(subset=['Date', 'KeyPointID'])
            minDate = min(df_c['Date']) - dateutil.relativedelta.relativedelta(months=1)
            thisCompanyData["company"] = company
            pointSeries = []
            series = []
            series.append({"name": "date",
                           "min": [minDate.year, minDate.month-1, minDate.day]})

            yAxis = 1
            for kp in df_c["KeyPointID"].unique():
                lineData, areaData, pctData = [], [], []
                df_p = df_c[df_c["KeyPointID"] == kp].copy().reset_index(drop=True)
                df_p = df_p.sort_values(by='Date')
                if kp not in enbridgePoints:
                    series = apportionLine(df_p, company, pctData, lineData, areaData, series)
                    thisCompanyData["keyPoint"] = kp
                else:
                    # enbridge apportionment by line
                    pointSeries = apportionPoint(df_p, company, pctData, pointSeries, kp, yAxis)
                    yAxis = yAxis + 1
                    thisCompanyData["keyPoint"] = False

            thisCompanyData["series"] = series
            thisCompanyData["pointSeries"] = pointSeries
        else:
            thisCompanyData["build"] = False

        if save:
            with open('../data_output/apportionment/'+folder_name+'.json', 'w') as fp:
                json.dump(thisCompanyData, fp, default=str)

    return df


if __name__ == "__main__":
    print('starting apportionment...')
    df = process_apportionment(sql=True, save=True)
    print('completed apportionment!')
