import os
import json
import re
import pandas as pd
from util import normalize_text, normalize_dates, get_company_list, get_data
script_dir = os.path.dirname(__file__)


def get_tolls_data(sql=True):
    df = get_data(script_dir, "tolls.sql", db="PipelineInformation", sql=sql)
    descriptions = get_data(script_dir,
                            "tolls_description.sql",
                            db="PipelineInformation",
                            sql=sql)
    return df, descriptions


def company_filter(df, company):
    path_filter = [False]
    split_default = False
    selected_paths = []
    selected_services = False
    total_paths = len(list(set(df["Path"])))
    df = df.where(pd.notnull(df), None)
    if len(list(set(df["Path"]))) == 1:
        path_filter = [False]
        selected_paths = list(set(df["Path"]))
    if company == "Alliance":
        path_filter = [True, "checkbox"]
        df = df[df["Service"].isin(["FT, Demand",
                                    "Firm Full Path Service, except Seasonal, 1Yr Demand Charge",
                                    "Firm Full Path Service, except Seasonal, 3Yr Demand Charge",
                                    "Firm Full Path Service, except Seasonal, 5Yr Demand Charge"])]
        selected_paths = ['System-CA/US border', 'Zone 2-CA/US border']
    elif company == "Cochin":
        cochin_paths = ["Cochin Terminal in Kankakee County, Illinois-Facilities in Fort Saskatchewan, Alberta",
                        "International Boundary near Alameda, Saskatchewan-Facilities in Fort Saskatchewan, Alberta",
                        "Clinton, Iowa-Facilities in Fort Saskatchewan, Alberta",
                        "Maxbass, North Dakota-Facilities in Fort Saskatchewan, Alberta"]
        df = df[df["Path"].isin(cochin_paths)]
        df["split"] = ["Cochin local" if s == "Local tariff" else "Cochin IJT" for s in df["Service"]]
        split_default = "Cochin IJT"
    elif company == "EnbridgeMainline":
        df["Service"] = [x.replace("2ND", "2nd") for x in df["Service"]]
        path_filter = [True, "radio"]
        # df = df.where(pd.notnull(df), None)
        enbridge_paths = {"EnbridgeLocal": ["Edmonton Terminal, Alberta-International Boundary near Gretna, Manitoba",
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
        for section, paths in enbridge_paths.items():
            filtered_list.append(df[(df["PipelineID"]==section) & (df["Path"].isin(paths))].copy())
        df = pd.concat(filtered_list, ignore_index=True)
        selected_paths = {"Enbridge Local": ["Edmonton Terminal, Alberta-International Boundary near Gretna, Manitoba"],
                         "Enbridge Mainline": ["Edmonton Terminal, Alberta-Clearbrook, Minnesota"],
                         "Enbridge FSP": ["Cromer, Manitoba-ALL"]}
        df["split"] = df["PipelineID"]
        df["split"] = df["split"].replace({"EnbridgeMainline": "Enbridge Mainline",
                                           "EnbridgeLocal": "Enbridge Local",
                                           "EnbridgeFSP": "Enbridge FSP"})
        split_default = "Enbridge Local"
    elif company == "Keystone":
        df = df[df["Path"] != "All-All"]
        selected_paths = list(set(df["Path"]))
        selected_services = "Uncommitted"
    elif company == "NGTL":
        df = df[df["Service"].isin(["Average FT-D Demand", "Average Firm Service Receipt"])]
        df["split"] = ["Average FT-D Demand" if "FT-D" in x else "Average Firm Service Receipt" for x in df["Service"]]
        selected_paths = {"Average FT-D Demand": ["System-Group 1",
                                                  "System-Group 2",
                                                  "System-Group 3"],
                         "Average Firm Service Receipt": ["Receipt-System"]}
        split_default = "Average FT-D Demand"
    elif company == "TCPL":
        selected_paths = ["Empress-Emerson 2",
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
        df = df[df["Path"].isin(selected_paths)].copy()
        df = df[df["Service"] == "Daily FT Toll"].copy()
    elif company == "Express":
        selected_paths = ["Hardisty, Alberta-International Boundary near Wild Horse, Alberta"]
        df = df[df["Path"].isin(selected_paths)].copy()
    elif company == "Foothills":
        df = df[df["Service"] == "FT, Demand Rate"].copy()
        df = df[df["Path"] != "All Zones-All Zones"].copy()
        selected_paths = list(set(df["Path"]))
    elif company == "MNP":
        df = df[df["Service"] == "Usage Charge Outside Tolerances"].copy()
        selected_paths = list(set(df["Path"]))
    elif company in ["Genesis", "ManyIslands", "MilkRiver", "NormanWells"]:
        selected_paths = list(set(df["Path"]))
    elif company == "TransMountain":
        df = df[df["Service"] == "Tank Metered, Net Toll"].copy()
        path_filter = [True, "radio"]
        selected_paths = ["Edmonton-Westridge"]
    elif company == "TQM":
        tqmPaths = ["System-System"]
        df = df[df["Path"].isin(tqmPaths)].copy()
        df = df[df["Service"] == "T-1"].copy()
        selected_paths = tqmPaths
    elif company == "TransNorthern":
        selected_paths = ["Montreal, East Quebec-Kingston, Ontario",
                         "Montreal, East Quebec-North Toronto, Ontario",
                         "Montreal, East Quebec-Ottawa, Ontario",
                         "Nanticoke, Ontario-North Toronto, Ontario"]
        df = df[df["Path"].isin(selected_paths)].copy()
    elif company == "SouthernLights":
        selected_paths = ["International Boundary near Gretna, Manitoba-Edmonton, Alberta; Hardisty, Alberta; Kerrobert, Saskatchewan"]
        df = df[df["Path"].isin(selected_paths)].copy()
    elif company == "Westcoast":
        selected_paths = list(set(df["Path"]))
        selected_services = "1 year"
    elif company == "Westspur":
        df = df[df["Service"] == "Toll"].copy()
        selected_paths = list(set(df["Path"]))

    df = df.copy().reset_index(drop=True)
    df = df.sort_values(by=["Path", "Service", "Effective Start"])
    shown_paths = len(list(set(df["Path"])))
    return df, selected_paths, selected_services, path_filter, split_default, [shown_paths, total_paths]


def process_path(df, series_col):
    path_series = sorted(list(set(df[series_col])))
    series = []
    for ps in path_series:
        df_s = df[df[series_col] == ps].copy().reset_index()
        for product in list(set(df_s["Product"])):
            df_p = df_s[df_s["Product"] == product].copy().reset_index(drop=True)
            for service in list(set(list(df_p["Service"]))):
                df_s2 = df_p[df_p["Service"] == service].copy().reset_index(drop=True)
                thisSeries = {"id": ps}
                thisSeries["product"] = product
                thisSeries["service"] = service
                thisSeries["units"] = list(df_s2["Units"])[0]
                data = []
                for s, e, value in zip(df_s2["Effective Start"], df_s2["Effective End"], df_s2["Value"]):
                    data.append([[s.year, s.month-1, s.day], [e.year, e.month-1, e.day], value])
                thisSeries["data"] = data
                series.append(thisSeries)
    return series


def round_values(df):
    avg_toll = df["Value"].mean()
    if avg_toll >= 1:
        df["Value"] = df["Value"].round(2)
        decimals = False
    else:
        df["Value"] = df["Value"].round(2)
        decimals = True
    return df, decimals


def process_description(desc, save):
    
    description_lookup = {}
    for company in list(desc["PipelineID"]):
        d_text = str(list(desc[desc["PipelineID"] == company]["Toll Description"])[0])
        if d_text != "nan":
            d_text = d_text.splitlines()
            paragraphs = ""
            for p in d_text:
                if len(p) > 0:
                    p = p.replace("&", "&amp;")
                    regdocs = re.findall("\[(.*?)\]", p)
                    if len(regdocs) > 0:
                        for link_text in regdocs:
                            p = p.replace(link_text,
                                          '<a href="'+
                                          'https://apps.cer-rec.gc.ca/REGDOCS/Item/View/'+link_text.split(' ')[-1]+'">'+link_text+'</a>')
                    # print(result)
                    p = "<p>"+p+"</p>"
                    paragraphs = paragraphs + p
            description_lookup[company] = {"en": paragraphs, "fr": paragraphs}
        else:
            description_lookup[company] = {"en": None, "fr": None}
    if save:
        with open('../data_output/tolls/descriptions.json', 'w') as fp:
            json.dump(description_lookup, fp, default=str)
    return None


def process_tolls_data(sql=True, companies=False, save=True, completed=[]):

    def generate_path_series(df, paths, series_col):
        path_series = []
        for path in paths:
            df_p = df[df["Path"] == path].copy().reset_index(drop=True)
            if not df_p.empty:
                path_series.append({"pathName": path,
                                   "series": process_path(df_p, series_col)})
        return path_series

    def find_series_col(df, company):
        products = sorted(list(set(df["Product"])))
        services = sorted(list(set(df["Service"])))
        product_filter = False
        if len(products) > 1 and len(services) <= 1 :
            series_col = "Product"
        elif len(services) > 1 and len(products) <= 1:
            series_col = "Service"
        elif len(services) <= 1 and len(products) <= 1:
            series_col = "Path"
        elif len(products) > 1 and len(services) > 1:
            series_col = "Service"
            product_filter = list(set(df["Product"]))
            product_filter = [[x, True] if x == "heavy crude" else [x, False] for x in product_filter]
        else:
            series_col = "Service"
            print("error! Need to filter on two columns")
        # override series col if needed
        if company in ["Keystone", "Westcoast"]:
            series_col = "Path"

        return series_col, product_filter

    df, descriptions = get_tolls_data(sql)
    df = normalize_text(df, ['Product', 'Path', 'Service', 'Units'])
    df = normalize_dates(df, ["Effective Start", "Effective End"])
    df = df[~df["Effective Start"].isnull()].copy().reset_index(drop=True)
    company_files = get_company_list()
    process_description(descriptions, save)

    if companies:
        company_files = companies
    for company in company_files:
        this_company_data = {}
        if company == "EnbridgeMainline":
            df_c = df[df["PipelineID"].isin(["EnbridgeMainline", "EnbridgeFSP", "EnbridgeLocal"])].copy().reset_index(drop=True)
        else:
            df_c = df[df["PipelineID"] == company].copy().reset_index(drop=True)

        df_c, decimals = round_values(df_c)
        df_c, selected_paths, selectedService, path_filter, split_default, path_totals = company_filter(df_c, company)
        meta = {"companyName": company}
        # build a series for product/service in each Paths
        if not df_c.empty and company in completed:
            meta["build"] = True
            meta["pathTotals"] = path_totals
            meta["decimals"] = decimals
            paths = sorted(list(set(df_c["Path"])))
            services = sorted(list(set(df_c["Service"])))
            units = list(set(df_c["Units"]))
            meta["pathFilter"] = path_filter
            meta["split"] = {"default": split_default}
            if split_default:
                meta["split"]["buttons"] = list(set(df_c["split"]))
                path_series = {}
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
                    series_col, product_filter = find_series_col(df_split, company)
                    if len(selected_paths) > 0:
                        meta["paths"][split] = [[p, True] if p in selected_paths[split] else [p, False] for p in paths]
                    else:
                        meta["paths"][split] = [[p, True] for p in paths]
                    meta["products"][split] = product_filter
                    meta["seriesCol"][split] = series_col
                    meta["services"][split] = selectedService
                    meta["units"][split] = units
                    path_series[split] = generate_path_series(df_split, paths, series_col)
            else:
                series_col, product_filter = find_series_col(df_c, company)
                meta["products"] = product_filter
                meta["seriesCol"] = series_col
                meta["paths"] = [[p, True] if p in selected_paths else [p, False] for p in paths]
                meta["services"] = [[s, True] if s == selectedService else [s, False] for s in services]
                meta["units"] = units
                path_series = generate_path_series(df_c, paths, series_col)

            this_company_data["meta"] = meta
            this_company_data["tolls"] = path_series
        else:
            meta["build"] = False
            this_company_data["meta"] = meta

        if save:
            with open('../data_output/tolls/'+company+'.json', 'w') as fp:
                json.dump(this_company_data, fp, default=str)

    return df_c, this_company_data


if __name__ == "__main__":
    print("starting tolls...")
    completed_ = ["Alliance",
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
    # completed_ = ["NGTL"]
    df_, this_company_data_ = process_tolls_data(sql=False,
                                                 companies=completed_,
                                                 completed=completed_)
    print("done tolls")
