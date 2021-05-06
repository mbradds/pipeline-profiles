import pandas as pd
from util import normalize_dates, conversion, normalize_numeric
from errors import ApportionSeriesCombinationError
import dateutil.relativedelta
from traffic import get_data, addIds
import json


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


def process_apportionment(test=False, sql=False, companies=False):

    if sql:
        df = get_data(False, True, "apportionment.sql")
    elif test:
        print('no tests for apportionment data!')
    else:
        print('reading local apportionment csv...')
        df = pd.read_csv("./raw_data/apportionment.csv")

    df = normalize_dates(df, ['Date'])
    # enbridge processing
    df = df.drop(df[(df['Corporate Entity'] == 'Enbridge Pipelines Inc.') & (df['Key Point'] != 'system')].index)
    df = df.drop(df[(df['Corporate Entity'] == 'Enbridge Pipelines Inc.') & (df['Date'].dt.year < 2016)].index)
    # cochin processing
    df = df.drop(df[(df['Corporate Entity'] == 'PKM Cochin ULC') & (df['Key Point'] != 'Ft. Saskatchewan')].index)
    df = df[~df['Pipeline Name'].isin(["Southern Lights Pipeline",
                                       "Westpur Pipeline",
                                       "Trans-Northern"])].reset_index(drop=True)

    df['Key Point'] = df['Key Point'].replace("All", "system")
    df = addIds(df)
    del df['Pipeline Name']
    df = df.rename(columns={x: x.split("(")[0].strip() for x in df.columns})
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

    # for company in list(set(df['Corporate Entity'])):
    # for company in ['Enbridge Pipelines Inc.']:
    for company in company_files:
        thisCompanyData = {}
        folder_name = company.replace(' ', '').replace('.', '')
        df_c = df[df['Corporate Entity'] == company].copy().reset_index(drop=True)
        if not df_c.empty:
            thisCompanyData['build'] = True
            df_c = df_c.drop_duplicates(subset=['Date'])
            df_c = df_c.sort_values(by='Date')
            minDate = min(df_c['Date']) - dateutil.relativedelta.relativedelta(months=1)
            thisCompanyData["keyPoint"] = list(df_c['Key Point'])[0]
            thisCompanyData["company"] = company
            hasCap = hasData(df_c, "Available Capacity")
            hasOrigNom = hasData(df_c, "Original Nominations")
            hasAccepNom = hasData(df_c, "Accepted Nominations")
            hasPct = hasNotNull(df_c, "Apportionment Percentage")
            lineData, areaData, pctData = [], [], []
            series = []
            series.append({"name": "date",
                           "min": [minDate.year, minDate.month-1, minDate.day]})
            for cap, oNom, aNom, aPct in zip(df_c['Available Capacity'],
                                             df_c['Original Nominations'],
                                             df_c['Accepted Nominations'],
                                             df_c['Apportionment Percentage']):

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

            series.append({"name": lineName,
                           "data": lineData,
                           "yAxis": 0,
                           "type": "line"})
            series.append({"name": areaName,
                           "data": areaData,
                           "yAxis": 0,
                           "type": "area"})
            if hasPct:
                series.append({"name": "ap",  # Apportionment Percent
                               "data": pctData,
                               "yAxis": 1,
                               "type": "line",
                               "visible": False,
                               # "showInLegend": False
                               })

            thisCompanyData["series"] = series

        else:
            thisCompanyData["build"] = False

        if not test:
            with open('../apportionment/company_data/'+folder_name+'.json', 'w') as fp:
                json.dump(thisCompanyData, fp, default=str)

    return df


if __name__ == "__main__":
    df = process_apportionment()