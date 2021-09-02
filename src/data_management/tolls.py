import pandas as pd
from util import normalize_text, normalize_dates, get_company_list, get_data
import os
import json
script_dir = os.path.dirname(__file__)


def getTollsData(sql=True):
    df = get_data(script_dir, "tolls.sql", db="PipelineInformation", sql=sql)
    return df


def companyFilter(df, company):
    pathFilter = True
    splitDefault = False
    if company == "Alliance":
        df = df[df["Service"].isin(["FT, Demand",
                                    "Firm Full Path Service, except Seasonal, 1Yr Demand Charge",
                                    "Firm Full Path Service, except Seasonal, 3Yr Demand Charge",
                                    "Firm Full Path Service, except Seasonal, 5Yr Demand Charge"])]
        selectedPaths = ['System-CA/US border', 'Zone 2-CA/US border']
    elif company == "Cochin":
        pathFilter = False
        cochinPaths = ["Cochin Terminal in Kankakee County, Illinois-Facilities in Fort Saskatchewan, Alberta",
                       "International Boundary near Alameda, Saskatchewan-Facilities in Fort Saskatchewan, Alberta",
                       "Clinton, Iowa-Facilities in Fort Saskatchewan, Alberta",
                       "Maxbass, North Dakota-Facilities in Fort Saskatchewan, Alberta"]
        df = df[df["Path"].isin(cochinPaths)]
        df["split"] = ["Cochin local" if s == "Local tariff" else "Cochin IJT" for s in df["Service"]]
        splitDefault = "Cochin IJT"
        selectedPaths = cochinPaths
        
    df = df.copy().reset_index(drop=True)
    df = df.sort_values(by=["Path", "Service", "Effective Start"])
    return df, selectedPaths, pathFilter, splitDefault


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
            data.append([[s.year, s.month-1, s.day], [e.year, e.month-1, e.day], value])
        thisSeries["data"] = data
        series.append(thisSeries)
    return series


def processTollsData(sql=True, companies=False, save=True):
    
    def generatePathSeries(df, paths, seriesCol, split):
        pathSeries = []
        for path in paths:
                df_p = df[df["Path"] == path].copy().reset_index(drop=True)
                if not df_p.empty:
                    pathSeries.append({"pathName": path,
                                       "series": processPath(df_p, seriesCol),
                                       "split": split})
        return pathSeries
    
    df = getTollsData(sql)
    df = normalize_text(df, ['Product', 'Path', 'Service', 'Units'])
    df = normalize_dates(df, ["Effective Start", "Effective End"])
    df = df[~df["Effective Start"].isnull()].copy().reset_index(drop=True)
    company_files = get_company_list()

    if companies:
        company_files = companies
    
    for company in company_files:
        thisCompanyData = {}
        df_c = df[df["PipelineID"] == company].copy().reset_index(drop=True)
        df_c, selectedPaths, pathFilter, splitDefault = companyFilter(df_c, company)
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
            meta["seriesCol"] = seriesCol
            meta["paths"] = [[p, True] if p in selectedPaths else [p, False] for p in paths]
            meta["pathFilter"] = pathFilter
            meta["split"] = {"default": splitDefault}
            if splitDefault:
                meta["split"]["buttons"] = list(set(df_c["split"]))
                pathSeries = []
                for split in list(set(df_c["split"])):
                    df_split = df_c[df_c["split"] == split].copy().reset_index(drop=True)
                    pathSeries.extend(generatePathSeries(df_split, paths, seriesCol, split))
            else:
                pathSeries = generatePathSeries(df_c, paths, seriesCol, splitDefault)
            
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
