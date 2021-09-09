import pandas as pd
from util import normalize_text, normalize_dates, get_company_list, get_data
import os
import json
script_dir = os.path.dirname(__file__)


def getTollsData(sql=True):
    df = get_data(script_dir, "tolls.sql", db="PipelineInformation", sql=sql)
    return df


def companyFilter(df, company):
    pathFilter = [False]
    splitDefault = False
    selectedPaths = []
    selectedServices = False
    if len(list(set(df["Path"]))) == 1:
        pathFilter = [False]
        selectedPaths = list(set(df["Path"]))
    if company == "Alliance":
        pathFilter = [True, "checkbox"]
        df = df[df["Service"].isin(["FT, Demand",
                                    "Firm Full Path Service, except Seasonal, 1Yr Demand Charge",
                                    "Firm Full Path Service, except Seasonal, 3Yr Demand Charge",
                                    "Firm Full Path Service, except Seasonal, 5Yr Demand Charge"])]
        selectedPaths = ['System-CA/US border', 'Zone 2-CA/US border']
    elif company == "Cochin":
        cochinPaths = ["Cochin Terminal in Kankakee County, Illinois-Facilities in Fort Saskatchewan, Alberta",
                       "International Boundary near Alameda, Saskatchewan-Facilities in Fort Saskatchewan, Alberta",
                       "Clinton, Iowa-Facilities in Fort Saskatchewan, Alberta",
                       "Maxbass, North Dakota-Facilities in Fort Saskatchewan, Alberta"]
        df = df[df["Path"].isin(cochinPaths)]
        df["split"] = ["Cochin local" if s == "Local tariff" else "Cochin IJT" for s in df["Service"]]
        splitDefault = "Cochin IJT"
    elif company == "EnbridgeMainline":
        # df = df[df["Value"] >= 0].copy().reset_index(drop=True)
        df["Service"] = [x.replace("2ND", "2nd") for x in df["Service"]]
        pathFilter = [True, "radio"]
        df = df.where(pd.notnull(df), None)
        enbridgePaths = {"EnbridgeLocal": ["Edmonton Terminal, Alberta-International Boundary near Gretna, Manitoba",
                                           "Edmonton Terminal, Alberta-Hardisty Terminal, Alberta"],
                         "EnbridgeMainline": ["Edmonton Terminal, Alberta-Clearbrook, Minnesota",
                                              "Edmonton Terminal, Alberta-Flanagan, Illinois",
                                              "Edmonton Terminal, Alberta-Nanticoke, Ontario",
                                              "Edmonton Terminal, Alberta-Superior, Wisconsin"],
                         "EnbridgeFSP": ["Cromer, Manitoba-ALL",
                                         "Edmonton, Alberta-ALL",
                                         "Hardisty, Alberta-ALL",
                                         "Kerrobert, Saskatchewan-ALL",
                                         "Regina, Saskatchewan-ALL"]}
        
        filtered_list = []
        for section, paths in enbridgePaths.items():
            filtered_list.append(df[(df["PipelineID"]==section) & (df["Path"].isin(paths))].copy())
        df = pd.concat(filtered_list, ignore_index=True)
        selectedPaths = {"Enbridge Local": ["Edmonton Terminal, Alberta-International Boundary near Gretna, Manitoba"],
                         "Enbridge Mainline": ["Edmonton Terminal, Alberta-Clearbrook, Minnesota"],
                         "Enbridge FSP": ["Cromer, Manitoba-ALL"]}
        df["split"] = df["PipelineID"]
        df["split"] = df["split"].replace({"EnbridgeMainline": "Enbridge Mainline",
                                           "EnbridgeLocal": "Enbridge Local",
                                           "EnbridgeFSP": "Enbridge FSP"})
        splitDefault = "Enbridge Local"
    elif company == "Keystone":
        df = df[df["Path"] != "All-All"]
        selectedPaths = list(set(df["Path"]))
        selectedServices = "Uncommitted"
    elif company == "NGTL":
        df["split"] = ["FT-D (Delivery Services)" if "FT-D" in x else "FT-R (Receipt Services)" for x in df["Service"]]
        selectedPaths = {"FT-D (Delivery Services)": ["System-Group 1",
                                                      "System-Group 2",
                                                      "System-Group 3"],
                         "FT-R (Receipt Services)": ["Receipt-System"]}
        splitDefault = "FT-D (Delivery Services)"
    elif company == "TCPL":
        selectedPaths = ["Empress-Emerson 2",
                         "Empress-Enbridge CDA",
                         "Empress-Energir EDA",
                         "Empress-GMIT EDA",
                         "Empress-Iroquois",
                         "Empress-Union SWDA",
                         "Union Parkway Belt-Emerson 2",
                         "Union Parkway Belt-Enbridge CDA",
                         "Union Parkway Belt-Energir EDA",
                         "Union Parkway Belt-GMIT EDA",
                         "Union Parkway Belt-Iroquois",
                         "Union Parkway Belt-Union SWDA"]
        df = df[df["Path"].isin(selectedPaths)].copy()
        df = df[df["Service"] == "Daily FT Toll"].copy()
    elif company == "Express":
        selectedPaths = ["Hardisty, Alberta-International Boundary near Wild Horse, Alberta"]
        df = df[df["Path"].isin(selectedPaths)].copy()
    elif company == "Foothills":
        df = df[df["Service"] == "FT, Demand Rate"].copy()
        df = df[df["Path"] != "All Zones-All Zones"].copy()
        selectedPaths = list(set(df["Path"]))
    elif company == "MNP":
        df = df[df["Service"] == "Usage Charge Outside Tolerances"].copy()
        selectedPaths = list(set(df["Path"]))
    elif company in ["Genesis", "ManyIslands", "MilkRiver", "NormanWells"]:
        selectedPaths = list(set(df["Path"]))
    elif company == "TransMountain":
        df = df[df["Service"] == "Tank Metered, Net Toll"].copy()
        pathFilter = [True, "radio"]
        selectedPaths = ["Edmonton-Westridge"]
    elif company == "TQM":
        tqmPaths = ["System-System"]
        df = df[df["Path"].isin(tqmPaths)].copy()
        df = df[df["Service"] == "T-1"].copy()
        selectedPaths = tqmPaths
    elif company == "TransNorthern":
        selectedPaths = ["Montreal, East Quebec-Kingston, Ontario",
                         "Montreal, East Quebec-North Toronto, Ontario",
                         "Montreal, East Quebec-Ottawa, Ontario",
                         "Nanticoke, Ontario-North Toronto, Ontario"]
        df = df[df["Path"].isin(selectedPaths)].copy()
    elif company == "SouthernLights":
        selectedPaths = ["International Boundary near Gretna, Manitoba-Edmonton, Alberta; Hardisty, Alberta; Kerrobert, Saskatchewan"]
        df = df[df["Path"].isin(selectedPaths)].copy()
    elif company == "Westcoast":
        selectedPaths = list(set(df["Path"]))
        selectedServices = "1 year"
    elif company == "Westspur":
        df = df[df["Service"] == "Toll"].copy()
        selectedPaths = list(set(df["Path"]))

    df = df.copy().reset_index(drop=True)
    df = df.sort_values(by=["Path", "Service", "Effective Start"])
    return df, selectedPaths, selectedServices, pathFilter, splitDefault


def processPath(df, seriesCol, productFilter):
    pathSeries = sorted(list(set(df[seriesCol])))
    series = []
    for ps in pathSeries:
        dfs = df[df[seriesCol] == ps].copy().reset_index()
        for product in list(set(dfs["Product"])):
            dfp = dfs[dfs["Product"] == product].copy().reset_index(drop=True)
            for service in list(set(list(dfp["Service"]))):
                dfs2 = dfp[dfp["Service"] == service].copy().reset_index(drop=True)
                thisSeries = {"id": ps}
                thisSeries["product"] = product
                thisSeries["service"] = service
                thisSeries["units"] = list(dfs2["Units"])[0]
                data = []
                for s, e, value in zip(dfs2["Effective Start"], dfs2["Effective End"], dfs2["Value"]):
                    data.append([[s.year, s.month-1, s.day], [e.year, e.month-1, e.day], value])
                thisSeries["data"] = data
                series.append(thisSeries)
    return series


def processTollsData(sql=True, companies=False, save=True, completed = []):
    
    def generatePathSeries(df, paths, seriesCol, productFilter):
        pathSeries = []
        for path in paths:
                df_p = df[df["Path"] == path].copy().reset_index(drop=True)
                if not df_p.empty:
                    pathSeries.append({"pathName": path,
                                       "series": processPath(df_p, seriesCol, productFilter)})
        return pathSeries
    
    def findSeriesCol(df, company):
        products = sorted(list(set(df["Product"])))
        services = sorted(list(set(df["Service"])))
        productFilter = False
        if len(products) > 1 and len(services) <= 1 :
            seriesCol = "Product"
        elif len(services) > 1 and len(products) <= 1:
            seriesCol = "Service"
        elif len(services) <= 1 and len(products) <= 1:
            seriesCol = "Path"
        elif len(products) > 1 and len(services) > 1:
            seriesCol = "Service"
            productFilter = list(set(df["Product"]))
            productFilter = [[x, True] if x == "heavy crude" else [x, False] for x in productFilter]
        else:
            seriesCol = "Service"
            print("error! Need to filter on two columns")
        # override series col if needed
        if company == "Keystone" or company == "Westcoast":
            seriesCol = "Path"
        
        return seriesCol, productFilter
    
    df = getTollsData(sql)
    df = normalize_text(df, ['Product', 'Path', 'Service', 'Units'])
    df = normalize_dates(df, ["Effective Start", "Effective End"])
    df = df[~df["Effective Start"].isnull()].copy().reset_index(drop=True)
    company_files = get_company_list()

    if companies:
        company_files = companies
    
    for company in company_files:
        thisCompanyData = {}
        if company == "EnbridgeMainline":
            df_c = df[df["PipelineID"].isin(["EnbridgeMainline", "EnbridgeFSP", "EnbridgeLocal"])].copy().reset_index(drop=True)
        else:
            df_c = df[df["PipelineID"] == company].copy().reset_index(drop=True)
        df_c, selectedPaths, selectedService, pathFilter, splitDefault = companyFilter(df_c, company)
        meta = {"companyName": company}
        # build a series for product/service in each Paths
        if not df_c.empty and company in completed:
            meta["build"] = True
            paths = sorted(list(set(df_c["Path"])))
            services = sorted(list(set(df_c["Service"])))
            units = list(set(df_c["Units"]))
            meta["pathFilter"] = pathFilter
            meta["split"] = {"default": splitDefault}
            if splitDefault:
                meta["split"]["buttons"] = list(set(df_c["split"]))
                pathSeries = {}
                meta["paths"] = {}
                meta["seriesCol"] = {}
                meta["products"] = {}
                meta["services"] = {}
                meta["units"] = {}
                for split in list(set(df_c["split"])):
                    df_split = df_c[df_c["split"] == split].copy().reset_index(drop=True)
                    paths = sorted(list(set(df_split["Path"])))
                    # services = sorted(list(set(df_c["Service"])))
                    units = list(set(df_split["Units"]))
                    seriesCol, productFilter = findSeriesCol(df_split, company)
                    if len(selectedPaths) > 0:
                        meta["paths"][split] = [[p, True] if p in selectedPaths[split] else [p, False] for p in paths]
                    else:
                        meta["paths"][split] = [[p, True] for p in paths]
                    meta["products"][split] = productFilter
                    meta["seriesCol"][split] = seriesCol
                    meta["services"][split] = selectedService
                    meta["units"][split] = units
                    pathSeries[split] = generatePathSeries(df_split, paths, seriesCol, productFilter)
            else:
                seriesCol, productFilter = findSeriesCol(df_c, company)
                meta["products"] = productFilter
                meta["seriesCol"] = seriesCol
                meta["paths"] = [[p, True] if p in selectedPaths else [p, False] for p in paths]
                meta["services"] = [[s, True] if s == selectedService else [s, False] for s in services]
                meta["units"] = units
                pathSeries = generatePathSeries(df_c, paths, seriesCol, productFilter)
            
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
    completed = ["Alliance",
                 "Cochin",
                 "Aurora",
                 "EnbridgeBakken",
                 "EnbridgeMainline",
                 "Keystone",
                 "NGTL",
                 "Brunswick",
                 "TCPL",
                 "Express",
                 "Foothills",
                 "Genesis",
                 "ManyIslands",
                 "MNP",
                 "Montreal",
                 "MilkRiver",
                 "NormanWells",
                 "TransMountain",
                 "TQM",
                 "TransNorthern",
                 "SouthernLights",
                 "Vector",
                 "Westcoast",
                 "Westspur",
                 "Wascana"]
    df, thisCompanyData = processTollsData(sql=False, companies=completed, completed=completed)
    print("done tolls")
