import pandas as pd
from util import company_rename, most_common, strip_cols, idify, get_company_list
import ssl
import json
from datetime import datetime
# from dateutil.relativedelta import relativedelta
ssl._create_default_https_context = ssl._create_unverified_context

'''
ideas:
    -total number of integrity digs highlighted
    -top 3 nearest populated centers highlighted
    -total land needed relative to something
    -group o and m categories by year before front end. Test the sizes!

'''


def listify(series):
    series = series.fillna(value=0)
    series = [int(x) for x in series]
    series = list(series)
    return series


def optimizeJson(df):
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
            dfSeries = df[['year', col]].copy()
            dfSeries[col] = dfSeries[col].fillna(value=0)
            dfSeries['value'] = 1
            dfSeries = dfSeries.groupby(by=['year', col]).count()
            dfSeries = dfSeries.reset_index()
            dfSeries = pd.pivot_table(dfSeries,
                                      values="value",
                                      index=['year'],
                                      columns=[col])
            dfSeries = dfSeries.reset_index()
            dfSeries = dfSeries.sort_values(by="year")
            thisSeries = {}
            thisData = []
            for sName in dfSeries.columns:
                if sName != 'year':
                    thisData.append({"id": sName,
                                     "data": listify(dfSeries[sName])})
                else:
                    thisSeries[sName] = listify(dfSeries[sName])
            thisSeries["data"] = thisData
            series[col] = thisSeries
    return series


def metadata(df, company):
    def filterNear(city):
        if len(city) <= 2:
            return False
        else:
            return True

    thisCompanyMeta = {}
    thisCompanyMeta["totalEvents"] = int(len(list(set(df['Event Number']))))
    thisCompanyMeta["totalDigs"] = int(df['Dig Count'].sum())

    # nearby in the last year
    df['Nearest Populated Centre'] = [x.split(",")[0].strip() for x in df['Nearest Populated Centre']]

    dfNear = df.copy()
    filterList = ['various',
                  'various locations as per the attached documents.',
                  'as per the attached documents',
                  'as per the attached document',
                  'business']

    dfNear = dfNear[~dfNear['Nearest Populated Centre'].str.lower().isin(filterList)]
    # oneYearAgo = datetime.today() - relativedelta(years=1)
    lastFullYear = datetime.today().year - 1
    dfNear = dfNear[dfNear['Commencement Date'].dt.year == lastFullYear]
    if not dfNear.empty:
        # deal with mnp
        city = []
        for cityString in dfNear["Nearest Populated Centre"]:
            if "The project is located" in cityString:
                city.append(cityString.split("of")[-1].strip())
            else:
                city.append(cityString)
        dfNear["Nearest Populated Centre"] = city
        for splitChar in [",", "("]:
            dfNear['Nearest Populated Centre'] = [x.split(splitChar)[0].strip() for x in dfNear['Nearest Populated Centre']]
        nearList = list(dfNear['Nearest Populated Centre']+" "+dfNear['Province/Territory'].str.upper())
        nearList = [x.replace("Jasper BC", "Jasper AB") for x in nearList]
        nearList = filter(filterNear, nearList)

        dfNear = pd.DataFrame(nearList)
        most_common(dfNear,
                    thisCompanyMeta,
                    0,
                    "nearby",
                    3,
                    "list",
                    False,
                    False)
        thisCompanyMeta["nearbyYear"] = lastFullYear
    else:
        thisCompanyMeta["nearby"] = None

    thisCompanyMeta["atRisk"] = sum([1 if x == "y" else 0 for x in df['Species At Risk Present']])
    thisCompanyMeta["landRequired"] = int(df['New Land Area Needed'].sum())
    thisCompanyMeta["iceRinks"] = int(round((thisCompanyMeta["landRequired"]*2.471)/0.375, 0))
    thisCompanyMeta["company"] = company
    return thisCompanyMeta


def column_insights(df):
    # df['event duration'] = [(t1-t0).days for t1, t0 in zip(df['Completion Date'], df['Commencement Date'])]
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
    for delete in ['Company Address',
                   'Company City',
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

    for dateCol in df.columns:
        if "date" in dateCol.lower():
            df[dateCol] = pd.to_datetime(df[dateCol])

    df['Company Name'] = df['Company Name'].replace(company_rename())
    df = column_insights(df)
    df = df.rename(columns={"Species At Risk Present At Activity Site": "Species At Risk Present"})
    if companies:
        company_files = companies
    else:
        company_files = get_company_list("all")

    for company in company_files:
        folder_name = company.replace(' ', '').replace('.', '')
        df_c = df[df['Company Name'] == company].copy().reset_index(drop=True)
        df_c = df_c.drop_duplicates(subset=['Event Number'])
        thisCompanyData = {}
        if not df_c.empty:
            thisCompanyData["meta"] = metadata(df_c, company)
            thisCompanyData["build"] = True
            thisCompanyData["data"] = optimizeJson(df_c)
            if not test:
                with open('../data_output/oandm/'+folder_name+'.json', 'w') as fp:
                    json.dump(thisCompanyData, fp)
        else:
            # there are no o and m events
            thisCompanyData['data'] = df_c.to_dict(orient='records')
            thisCompanyData['meta'] = {"companyName": company}
            thisCompanyData["build"] = False
            if not test:
                with open('../data_output/oandm/'+folder_name+'.json', 'w') as fp:
                    json.dump(thisCompanyData, fp)
    return df


if __name__ == '__main__':
    print('starting oandm...')
    df = process_oandm(remote=False, test=False)
    print('completed oandm!')
