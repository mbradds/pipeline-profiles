import time
import json
import os
import dateutil.relativedelta
import pandas as pd
from util import normalize_dates, conversion, normalize_numeric, normalize_text, get_company_list, get_data
from traffic import get_traffic_data
from errors import ApportionSeriesCombinationError
script_dir = os.path.dirname(__file__)


def get_enbridge_points(sql=True):
    points = get_traffic_data(sql, 'key_points.sql')
    points = points.fillna("")
    points = points[points["Pipeline Name"] == "EnbridgeMainline"]
    return [pId for pId, desc in zip(points["KeyPointID"], points["Description"]) if desc == ""]


def has_data(df, col):
    return bool(df[col].sum() > 0)


def has_not_null(df, col):
    for x in df[col]:
        if not pd.isnull(x):
            return True
    return False


def apportion_line(df_p,
                  company,
                  pct_data,
                  line_data,
                  area_data,
                  series):

    has_pct = has_not_null(df_p, "Apportionment Percentage")
    has_cap = has_data(df_p, "Available Capacity")
    has_orig_nom = has_data(df_p, "Original Nominations")
    has_accep_nom = has_data(df_p, "Accepted Nominations")

    for cap, o_nom, a_nom, a_pct in zip(df_p['Available Capacity'],
                                        df_p['Original Nominations'],
                                        df_p['Accepted Nominations'],
                                        df_p['Apportionment Percentage']):

        if has_cap and has_orig_nom:
            line_point = cap
            area_point = o_nom
            area_name = "on"  # Original Nominations
            line_name = "ac"  # Available Capacity
        elif has_orig_nom and has_accep_nom:
            line_point = a_nom
            area_point = o_nom
            area_name = "on"
            line_name = "an"
        else:
            raise ApportionSeriesCombinationError(company)

        pct_data.append(a_pct)
        line_data.append(line_point)
        area_data.append(area_point)

    series.append({"id": line_name,
                   "data": line_data,
                   "y_axis": 0,
                   "type": "line"})
    series.append({"id": area_name,
                   "data": area_data,
                   "y_axis": 0,
                   "type": "area"})
    if has_pct:
        series.append({"id": "ap",  # Apportionment Percent
                       "data": pct_data,
                       "y_axis": 1,
                       "type": "line",
                       "visible": False,
                      })
    return series


def apportion_point(df_p, series, kp):
    data = df_p[['Date', 'Apportionment Percentage']]
    data = data.rename(columns={"Date": "x", "Apportionment Percentage": "y"})
    data = [[int(time.mktime(x.timetuple()))*1000, y] for x, y in zip(data['x'], data['y'])]
    series.append({
        "id": kp,
        "data": data,
        })
    return series


def sort_by_points(df):
    order = {"KP0051": 0,
             "KP0052": 1,
             "KP0053": 2,
             "KP0054": 3,
             "KP0055": 4,
             "KP0056": 5,
             "KP0057": 6,
             "KP0058": 7,
             "KP0059": 8,
             "KP0048": 9,
             "KP0049": 10,
             "KP0050": 11,
             "KP0047": 12,
             "KP0060": 13,
             "KP0061": 14}

    order_col = []
    for kp in df["KeyPointID"]:
        if kp in order:
            order_col.append(order[kp])
        else:
            order_col.append(999)

    df["order_col"] = order_col
    df = df.sort_values(by=["Pipeline Name", "order_col", "Date"], ascending=[True, True, True])
    del df["order_col"]
    return df


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
    num_cols = ['Available Capacity',
               'Original Nominations',
               'Accepted Nominations',
               'Apportionment Percentage']
    df = normalize_numeric(df, num_cols, 2)
    df = conversion(df, "oil", num_cols[:-1], 2, False)
    df['Apportionment Percentage'] = df['Apportionment Percentage'].round(2)
    company_files = get_company_list("all")

    if companies:
        company_files = companies

    enbridge_points = get_enbridge_points(sql)
    df = sort_by_points(df)

    for company in company_files:
        this_company_data = {}
        folder_name = company.replace(' ', '').replace('.', '')
        df_c = df[df['Pipeline Name'] == company].copy().reset_index(drop=True)
        df_c = df_c.where(pd.notnull(df_c), None)
        if not df_c.empty:
            this_company_data['build'] = True
            df_c = df_c.drop_duplicates(subset=['Date', 'KeyPointID'])
            min_date = min(df_c['Date']) - dateutil.relativedelta.relativedelta(months=1)
            this_company_data["company"] = company
            point_series = []
            series = []
            series.append({"name": "date",
                           "min": [min_date.year, min_date.month-1, min_date.day]})

            y_axis = 1
            for kp in df_c["KeyPointID"].unique():
                line_data, area_data, pct_data = [], [], []
                df_p = df_c[df_c["KeyPointID"] == kp].copy().reset_index(drop=True)
                df_p = df_p.sort_values(by='Date')
                if kp not in enbridge_points:
                    series = apportion_line(df_p, company, pct_data, line_data, area_data, series)
                    this_company_data["keyPoint"] = kp
                else:
                    # enbridge apportionment by line
                    point_series = apportion_point(df_p, point_series, kp)
                    y_axis = y_axis + 1
                    this_company_data["keyPoint"] = False

            this_company_data["series"] = series
            this_company_data["pointSeries"] = point_series
        else:
            this_company_data["build"] = False

        if save:
            with open('../data_output/apportionment/'+folder_name+'.json', 'w') as fp:
                json.dump(this_company_data, fp, default=str)

    return df


if __name__ == "__main__":
    print('starting apportionment...')
    df_ = process_apportionment(sql=False, save=True)
    print('completed apportionment!')
