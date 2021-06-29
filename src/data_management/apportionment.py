import pandas as pd
from util import normalize_dates, conversion, normalize_numeric, normalize_text, idify
from errors import ApportionSeriesCombinationError, IdLengthError, IdError
import dateutil.relativedelta
from traffic import get_data, addIds
import time
import json

enbridgePoints = {
    "Cromer - Line 2/93": "crom2/93",
    "Kerrobert - Line 2/3": "kerr2/3",
    "Clearbrook - Line 2/3": "clea2/3",
    "Kerrobert - Line 2/93": "kerr2/93",
    "Kerrobert - Line 4/67": "kerr4/67",
    "Westover - Line 10": "west10",
    "Kerrobert - Line 1": "kerr1",
    "Regina - Line 4/67": "regi4/67",
    "Hardisty - Line 4/67": "hard4/67",
    "Cromer - Line 2/3": "crom2/3",
    "Cromer - Line 2/3/65": "crom2/3/65",
    "Westover - Line 11": "west11",
    "Edmonton - Line 2/3": "edmo2/3",
    }


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


def apportionmentIds(df):
    df['Key Point'] = [x.replace("line", "Line") for x in df["Key Point"]]
    try:
        df = idify(df, "Key Point", enbridgePoints, False)
    except IdLengthError:
        raise
    except IdError:
        pass

    sortPoints = {
        "crom2/93": 9,
        "kerr2/3": 3,
        "clea2/3": 11,
        "kerr2/93": 4,
        "kerr4/67": 5,
        "west10": 12,
        "kerr1": 6,
        "regi4/67": 7,
        "hard4/67": 2,
        "crom2/3": 8,
        "crom2/3/65": 10,
        "west11": 13,
        "edmo2/3": 1,
    }
    df['sort'] = [sortPoints[x] if x in sortPoints.keys() else 999 for x in df['Key Point']]
    df = df.sort_values(by=['sort', 'Date'])
    del df['sort']
    return df


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
        df = get_data(False, True, "apportionment.sql")
    else:
        print('reading local apportionment csv...')
        df = pd.read_csv("./raw_data/apportionment.csv")

    df = normalize_dates(df, ['Date'])
    df = normalize_text(df, ['Corporate Entity'])
    # enbridge processing
    df = df.drop(df[(df['Corporate Entity'] == 'Enbridge Pipelines Inc.') & (df['Key Point'].isin(['ex-Gretna', 'Into-Sarnia']))].index)
    df = df.drop(df[(df['Corporate Entity'] == 'Enbridge Pipelines Inc.') & (df['Date'].dt.year < 2016)].index)
    # cochin processing
    df = df.drop(df[(df['Corporate Entity'] == 'PKM Cochin ULC') & (df['Key Point'] != 'Ft. Saskatchewan')].index)
    df = df[~df['Pipeline Name'].isin(["Southern Lights Pipeline",
                                       "Westpur Pipeline",
                                       "Trans-Northern"])].reset_index(drop=True)

    df['Key Point'] = df['Key Point'].replace("All", "system")
    df = addIds(df)
    del df['Pipeline Name']
    df = df[df['Key Point'] != "- - -"]
    df = df.rename(columns={x: x.split("(")[0].strip() for x in df.columns})
    df = apportionmentIds(df)
    numCols = ['Available Capacity', 'Original Nominations', 'Accepted Nominations', 'Apportionment Percentage']
    df = normalize_numeric(df, numCols, 2)
    df = conversion(df, "oil", numCols[:-1], 2, False)

    df['Apportionment Percentage'] = df['Apportionment Percentage'].round(2)

    company_files = ['NOVA Gas Transmission Ltd.',
                     'Westcoast Energy Inc.',
                     'TransCanada PipeLines Limited',
                     'Alliance Pipeline Ltd.',
                     'Trans Quebec and Maritimes Pipeline Inc.',
                     'Maritimes & Northeast Pipeline Management Ltd.',
                     'Many Islands Pipe Lines (Canada) Limited',
                     'Emera Brunswick Pipeline Company Ltd.',
                     'Foothills Pipe Lines Ltd.',
                     'Enbridge Pipelines Inc.',
                     'TransCanada Keystone Pipeline GP Ltd.',
                     'Trans Mountain Pipeline ULC',
                     'PKM Cochin ULC',
                     'Trans-Northern Pipelines Inc.',
                     'Enbridge Pipelines (NW) Inc.',
                     'Enbridge Southern Lights GP Inc.',
                     'Kingston Midstream Westspur Limited',
                     'Vector Pipeline Limited Partnership',
                     'Many Islands Pipe Lines (Canada) Limited',
                     'Plains Midstream Canada ULC',
                     'Enbridge Bakken Pipeline Company Inc.',
                     'Express Pipeline Ltd.',
                     'Genesis Pipeline Canada Ltd.',
                     'Montreal Pipe Line Limited',
                     'Aurora Pipeline Company Ltd',
                     'Kingston Midstream Westspur Limited',
                     'Enbridge Southern Lights GP Inc.',
                     'Emera Brunswick Pipeline Company Ltd.']

    if companies:
        company_files = companies

    for company in company_files:
        thisCompanyData = {}
        folder_name = company.replace(' ', '').replace('.', '')
        df_c = df[df['Corporate Entity'] == company].copy().reset_index(drop=True)
        if not df_c.empty:
            thisCompanyData['build'] = True
            df_c = df_c.drop_duplicates(subset=['Date', 'Key Point'])
            minDate = min(df_c['Date']) - dateutil.relativedelta.relativedelta(months=1)
            thisCompanyData["company"] = company
            pointSeries = []
            series = []
            series.append({"name": "date",
                           "min": [minDate.year, minDate.month-1, minDate.day]})

            yAxis = 1
            for kp in df_c["Key Point"].unique():
                lineData, areaData, pctData = [], [], []
                df_p = df_c[df_c["Key Point"] == kp].copy().reset_index(drop=True)
                df_p = df_p.sort_values(by='Date')
                if kp not in enbridgePoints.values():
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
    df = process_apportionment(sql=False, save=True) #, companies=["Enbridge Pipelines Inc."])
