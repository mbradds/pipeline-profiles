import pandas as pd
from util import normalize_text, normalize_dates, get_company_list, get_data
import os
import json
script_dir = os.path.dirname(__file__)


def getTollsData(sql=True):
    df = get_data(script_dir, "tolls.sql", db="PipelineInformation", sql=sql)
    return df


def companyFilter(df, company):
    if company == "Alliance":
        df = df[df["Service"].isin(["FT, Demand",
                                    "Firm Full Path Service, except Seasonal, 1Yr Demand Charge",
                                    "Firm Full Path Service, except Seasonal, 3Yr Demand Charge",
                                    "Firm Full Path Service, except Seasonal, 5Yr Demand Charge"])]
    elif company == "Cochin":
        df = df[df["Path"].isin(["Cochin Terminal in Kankakee County, Illinois-Facilities in Fort Saskatchewan, Alberta",
                                 "International Boundary near Alameda, Saskatchewan-Facilities in Fort Saskatchewan, Alberta"])]
        
    df = df.copy().reset_index(drop=True)
    df = df.sort_values(by=["Path", "Service", "Effective Start"])
    return df


def processPath(df, seriesCol):
    pathSeries = sorted(list(set(df[seriesCol])))
    series = []
    for ps in pathSeries:
        dfs = df[df[seriesCol] == ps].copy().reset_index()
        thisSeries = {"id": ps}
        thisSeries["product"] = list(dfs["Product"])[0]
        thisSeries["units"] = list(dfs["Units"])[0]
        data = []
        for s, e, value in zip(dfs["Effective Start"], dfs["Effective End"], dfs["Value"]):
            data.append([[s.year, s.month, s.day], [e.year, e.month, e.day], value])
        thisSeries["data"] = data
        series.append(thisSeries)
    return series


def processTollsData(sql=True, companies=False, save=True):
    df = getTollsData(sql)
    df = normalize_text(df, ['Product', 'Path', 'Service', 'Units'])
    df = normalize_dates(df, ["Effective Start", "Effective End"])
    company_files = get_company_list()

    if companies:
        company_files = companies
    
    for company in company_files:
        thisCompanyData = {}
        df_c = df[df["PipelineID"] == company].copy().reset_index(drop=True)
        df_c = companyFilter(df_c, company)
        meta = {"companyName": company}
        # build a series for product/service in each Paths
        if not df_c.empty:
            meta["build"] = True
            paths = sorted(list(set(df_c["Path"])))
            products = sorted(list(set(df_c["Product"])))
            services = sorted(list(set(df_c["Service"])))
            if len(products) >= 1 and len(services) <= 1 :
                seriesCol = "Product"
            elif len(services) >= 1 and len(products) <= 1:
                seriesCol = "Service"
            elif len(services) <= 1 and len(products) <= 1:
                seriesCol = "Path"
            else:
                print("error! Need to filter on two columns")
            meta["paths"] = paths
            pathSeries = {}
            for path in paths:
                df_p = df_c[df_c["Path"] == path].copy().reset_index(drop=True)
                pathSeries[path] = processPath(df_p, seriesCol)
            
            thisCompanyData["meta"] = meta
            thisCompanyData["tolls"] = pathSeries
        else:
            meta["build"] = False
            thisCompanyData["meta"] = meta
        
        if save:
            with open('../data_output/tolls/'+company+'.json', 'w') as fp:
                json.dump(thisCompanyData, fp, default=str)
    
    return df_c, thisCompanyData


if __name__ == "__main__":
    print("starting tolls...")
    completed = ["Alliance", "Cochin"]
    df, thisCompanyData = processTollsData(sql=False, companies=completed)
    print("done tolls")
