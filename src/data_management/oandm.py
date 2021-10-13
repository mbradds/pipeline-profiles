import ssl
import json
from datetime import datetime
import pandas as pd
from util import company_rename, most_common, strip_cols, idify, get_company_list, apply_system_id
ssl._create_default_https_context = ssl._create_unverified_context


def listify(series):
    series = series.fillna(value=0)
    series = [int(x) for x in series]
    series = list(series)
    return series


def optimize_json(df):
    delete_after_meta = ['Event Number',
                         'Company Name',
                         'Dig Count',
                         'Activity Unplanned',
                         'Activity Acquiring New Land In Agreement With Landowner',
                         'Nearest Populated Centre',
                         'New Land Area Needed',
                         'Length Of Replacement Pipe']

    for delete in delete_after_meta:
        del df[delete]

    df['year'] = df['Commencement Date'].dt.year
    for col in df.columns:
        if "date" in col.lower():
            del df[col]

    # turn column names into id's
    df = df.rename(columns={"Integrity Dig": "id",
                            "Province/Territory": "p",
                            "Fish Present": "fp",
                            "In Stream Work Required": "is",
                            "Species At Risk Present": "sr"})
    # group data here
    series = {}
    for col in df.columns:
        if col != "year":
            df_series = df[['year', col]].copy()
            df_series[col] = df_series[col].fillna(value=0)
            df_series['value'] = 1
            df_series = df_series.groupby(by=['year', col]).count()
            df_series = df_series.reset_index()
            df_series = pd.pivot_table(df_series,
                                      values="value",
                                      index=['year'],
                                      columns=[col])
            df_series = df_series.reset_index()
            df_series = df_series.sort_values(by="year")
            this_series = {}
            this_data = []
            for s_name in df_series.columns:
                if s_name != 'year':
                    this_data.append({"id": s_name,
                                     "data": listify(df_series[s_name])})
                else:
                    this_series[s_name] = listify(df_series[s_name])
            this_series["data"] = this_data
            series[col] = this_series
    return series


def metadata(df, company):
    def filter_near(city):
        if len(city) <= 2:
            return False
        else:
            return True

    this_company_meta = {}
    this_company_meta["totalEvents"] = int(len(list(set(df['Event Number']))))
    this_company_meta["totalDigs"] = int(df['Dig Count'].sum())

    # nearby in the last year
    df['Nearest Populated Centre'] = [str(x) for x in df['Nearest Populated Centre']]
    df['Nearest Populated Centre'] = [x.split(",")[0].strip() for x in df['Nearest Populated Centre']]

    df_near = df.copy()
    filter_list = ['various',
                   'various locations as per the attached documents.',
                   'as per the attached documents',
                   'as per the attached document',
                   'business']

    df_near = df_near[~df_near['Nearest Populated Centre'].str.lower().isin(filter_list)]
    # oneYearAgo = datetime.today() - relativedelta(years=1)
    last_full_year = datetime.today().year - 1
    df_near = df_near[df_near['Commencement Date'].dt.year == last_full_year]
    if not df_near.empty:
        # deal with mnp
        city = []
        for city_string in df_near["Nearest Populated Centre"]:
            if "The project is located" in city_string:
                city.append(city_string.split("of")[-1].strip())
            else:
                city.append(city_string)
        df_near["Nearest Populated Centre"] = city
        for split_char in [",", "("]:
            df_near['Nearest Populated Centre'] = [x.split(split_char)[0].strip() for x in df_near['Nearest Populated Centre']]
        near_list = list(df_near['Nearest Populated Centre']+" "+df_near['Province/Territory'].str.upper())
        near_list = [x.replace("Jasper BC", "Jasper AB") for x in near_list]
        near_list = filter(filter_near, near_list)

        df_near = pd.DataFrame(near_list)
        most_common(df_near,
                    this_company_meta,
                    0,
                    "nearby",
                    3,
                    "list",
                    False,
                    False)
        this_company_meta["nearbyYear"] = last_full_year
    else:
        this_company_meta["nearby"] = None

    this_company_meta["atRisk"] = sum([1 if x == "y" else 0 for x in df['Species At Risk Present']])
    # RLG didnt want the land statistic
    # new_land = df['New Land Area Needed'].sum()
    # this_company_meta["landRequired"] = int(new_land)
    # this_company_meta["iceRinks"] = int(round((new_land*2.471)/0.375, 0))
    this_company_meta["company"] = company
    return this_company_meta


def column_insights(df):
    df = idify(df, "Province/Territory", "region")
    return df


def process_oandm(remote=False, companies=False, test=False):

    lang = "en"
    if remote:
        link = "https://can01.safelinks.protection.outlook.com/?url=https%3A%2F%2Fwww.cer-rec.gc.ca%2Fopen%2Foperations%2Foperation-and-maintenance-activity.csv&data=04%7C01%7CMichelle.Shabits%40cer-rec.gc.ca%7Cbbc3fece7b3a439e253908d8f9ec4eab%7C56e9b8d38a3549abbdfc27de59608f01%7C0%7C0%7C637534140608125634%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C1000&sdata=HvG6KtuvEzJiNy4CZ4OyplKnfx2Zk5sPjUNNutoohic%3D&reserved=0"

        print('downloading remote oandm file')
        df = pd.read_csv(link,
                         skiprows=0,
                         encoding="latin-1",
                         engine="python",
                         error_bad_lines=False)

        df.to_csv("./raw_data/oandm_"+lang+".csv", index=False)
    elif test:
        print('reading test oandm file')
        path = "./raw_data/test_data/oandm_en.csv"
        df = pd.read_csv(path,
                         skiprows=0,
                         encoding="utf-8",
                         error_bad_lines=False)

    else:
        print('reading local oandm file')
        if lang == 'en':
            path = "./raw_data/oandm_en.csv"
            encoding = "utf-8"

        df = pd.read_csv(path,
                         skiprows=0,
                         encoding=encoding,
                         error_bad_lines=False)

    df = strip_cols(df)
    df = df.rename(columns={x: x.replace("\xa0", " ") for x in df.columns})
    df = df.replace({"Yes": "y", "No": "n"})
    # Event Number and nearest populated center should be deleted later
    # New Land Area Needed is probably the total land
    for delete in ['Company City',
                   'Company Postal Code',
                   'Company Province/Territory',
                   'Circumstance(s)',
                   'Result Of A Class Location Change',
                   'Distance To Closest Building',
                   'Event Creation Date',
                   'Submission Date',
                   'Pipeline Name',
                   'Pipeline Outside Diameter',
                   'Pipeline Length',
                   'Commodity Carried',
                   'Facility Name',
                   'Facility Type',
                   'New Permanent Land Needed',
                   'Activity Acquiring New Private Land',
                   'Activity Acquiring New Land Under Compliance',
                   'Land Within Critical Habitat',
                   'Activity Crossing Water Body',
                   'New Temporary Land Needed',
                   'Vehicle Crossing Count',
                   'Provincial and federal authorities been consulted',
                   'Activity Using Navigable Water',
                   'Activity Following DFO Fish Measures For In Stream Work',
                   'Navigable Water Frozen Or Dry',
                   'Activity Following DFO Fish Measures For Crossing',
                   'Ground Disturbance Near Water Required',
                   'Navigable Water Activity Meeting Transport Canada Minor Works And Waters Order']:
        del df[delete]

    for date_col in df.columns:
        if "date" in date_col.lower():
            df[date_col] = pd.to_datetime(df[date_col])

    df['Company Name'] = df['Company Name'].replace(company_rename())
    df = apply_system_id(df, "Company Name")
    df = column_insights(df)
    df = df.rename(columns={"Species At Risk Present At Activity Site": "Species At Risk Present"})
    df = df[df['Commencement Date'].dt.year >= 2015].reset_index(drop=True)
    if companies:
        company_files = companies
    else:
        company_files = get_company_list("all")

    for company in company_files:
        folder_name = company.replace(' ', '').replace('.', '')
        df_c = df[df['Company Name'] == company].copy().reset_index(drop=True)
        df_c = df_c.drop_duplicates(subset=['Event Number'])
        this_company_data = {}
        if not df_c.empty:
            this_company_data["meta"] = metadata(df_c, company)
            this_company_data["build"] = True
            this_company_data["data"] = optimize_json(df_c)
            if not test:
                with open('../data_output/oandm/'+folder_name+'.json', 'w') as fp:
                    json.dump(this_company_data, fp)
        else:
            # there are no o and m events
            this_company_data['data'] = df_c.to_dict(orient='records')
            this_company_data['meta'] = {"companyName": company}
            this_company_data["build"] = False
            if not test:
                with open('../data_output/oandm/'+folder_name+'.json', 'w') as fp:
                    json.dump(this_company_data, fp)
    return this_company_data


if __name__ == '__main__':
    print('starting oandm...')
    df_ = process_oandm(remote=True, test=False)
    print('completed oandm!')
