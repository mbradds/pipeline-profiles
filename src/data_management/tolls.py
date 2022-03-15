import os
import json
import re
import numpy as np
import pandas as pd
from util import normalize_text, normalize_dates, get_company_list, get_data, set_cwd_to_script
set_cwd_to_script()


def get_tolls_data(sql=True):
    df = get_data(os.getcwd(),
                  "tolls_converted.sql",
                  db="PipelineInformation",
                  sql=sql)
    df["Path"] = [str(r)+"-"+str(d) for r, d in zip(df["Receipt Point"], df["Delivery Point"])]
    del df["Receipt Point"]
    del df["Delivery Point"]

    descriptions = get_data(os.getcwd(),
                            "tolls_description.sql",
                            db="PipelineInformation",
                            sql=sql)

    toll_nums = get_data(os.getcwd(),
                    "tolls_numbers.sql",
                    db="PipelineInformation",
                    sql=sql)

    translations = get_data(os.getcwd(),
                            "tolls_translation.sql",
                            db="PipelineInformation",
                            sql=sql)
    return df, descriptions, toll_nums, translations


def company_filter(df, company):
    path_filter = [False]
    split_default = False
    selected_paths = []
    selected_services = False
    total_paths = len(list(set(df["Path"])))
    if len(list(set(df["Path"]))) == 1:
        path_filter = [False]
        selected_paths = list(set(df["Path"]))
    if company == "Alliance":
        path_filter = [True, "checkbox"]
        selected_paths = ['System-CA/US border', 'Zone 2-CA/US border']
    elif company == "Cochin":
        df["split"] = ["Cochin local" if s == "Local tariff" else "Cochin IJT" for s in df["Service"]]
        df = df[df["Service"] != "nan"]
        split_default = "Cochin IJT"
    elif company == "EnbridgeMainline":
        df["Service"] = [x.replace("2ND", "2nd") for x in df["Service"]]
        path_filter = [True, "radio"]
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
    elif company == "EnbridgeLine9":
        selected_paths = ["Hardisty Terminal, Alberta-MONTREAL, QUEBEC"]
        path_filter = [True, "radio"]
    elif company == "Keystone":
        df = df[df["Path"] != "All-All"].copy()
        df["split"] = ["Keystone International" if "International" in x else "Keystone Local Tolls" for x in df["Service"]]
        split_default = "Keystone Local Tolls"
        selected_paths = {"Keystone International": ["Hardisty, Alberta-Houston, Texas",
                                                      "Hardisty, Alberta-Port Arthur, Texas"],
                          "Keystone Local Tolls": ["Hardisty, Alberta-Cushing, Oklahoma",
                                                   "Hardisty, Alberta-Houston, Texas",
                                                   "Hardisty, Alberta-Port Arthur, Texas",
                                                   "Hardisty, Alberta-Wood River or Patoka, Illinois"]}

        selected_services = {"Keystone International": "International Joint Uncommitted Rates",
                             "Keystone Local Tolls": "Uncommitted"}
    elif company == "NGTL":
        df = df[df["Service"].isin(["Average FT-D Demand", "Average Firm Service Receipt"])].copy()
        df["split"] = ["Average Firm Transportation - Delivery (FT-D)" if "FT-D" in x else "Average Firm Transportation - Receipt (FT-R)" for x in df["Service"]]
        selected_paths = {"Average Firm Transportation - Delivery (FT-D)": ["System-Group 1",
                                                                            "System-Group 2",
                                                                            "System-Group 3"],
                         "Average Firm Transportation - Receipt (FT-R)": ["Receipt-System"]}
        split_default = "Average Firm Transportation - Delivery (FT-D)"
    elif company == "TCPL":
        selected_paths = ["Empress-Emerson 2",
                         "Empress-Enbridge CDA",
                         "Empress-Energir EDA",
                         "Empress-Iroquois",
                         "Empress-Union SWDA",
                         "Union Parkway Belt-Emerson 2",
                         "Union Parkway Belt-Enbridge CDA",
                         "Union Parkway Belt-Energir EDA",
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
    df, decimals = round_values(df)
    df = df.where(pd.notnull(df), None)
    df = df.replace({np.nan: None})
    shown_paths = len(list(set(df["Path"])))
    return df, selected_paths, selected_services, path_filter, split_default, [shown_paths, total_paths], decimals


def process_path(df, series_col, minimize=True):
    path_series = sorted(list(set(df[series_col])))
    series = []
    for ps in path_series:
        df_s = df[df[series_col] == ps].copy().reset_index()
        if len(list(set(df_s["Original Toll Unit"]))) > 1:
            print(list(df_s["PipelineID"])[0], "units error")
        for product in list(set(df_s["Product"])):
            df_p = df_s[df_s["Product"] == product].copy().reset_index(drop=True)
            for service in list(set(list(df_p["Service"]))):
                df_s2 = df_p[df_p["Service"] == service].copy().reset_index(drop=True)
                thisSeries = {"id": ps}
                thisSeries["p"] = product
                thisSeries["s"] = service
                thisSeries["u"] = list(df_s2["Original Toll Unit"])[0]
                data = []
                last_end = None
                for start, end, value, value_converted in zip(df_s2["Effective Start"],
                                                              df_s2["Effective End"],
                                                              df_s2["Original Toll Value"],
                                                              df_s2["Converted Toll Value"]):
                    # fix gaps in tolls series
                    if last_end:
                        diff = start-last_end
                        if diff.days > 1:
                            data.append([[last_end.year, last_end.month-1, last_end.day], [start.year, start.month-1, start.day], [None, None]])
                    if minimize:
                        if len(data) > 0:
                            last_toll = data[-1][-1]
                            rollover_days = (start - last_end).days
                            if last_toll == value and rollover_days <= 1:
                                data[-1][1] = [end.year, end.month-1, end.day]
                            else:
                                data.append([[start.year, start.month-1, start.day], [end.year, end.month-1, end.day], [value, value_converted]])
                        else:
                            data.append([[start.year, start.month-1, start.day], [end.year, end.month-1, end.day], [value, value_converted]])
                        last_end = end
                    else:
                        data.append([[start.year, start.month-1, start.day], [end.year, end.month-1, end.day], [value, value_converted]])

                thisSeries["data"] = data
                series.append(thisSeries)
    return series


def round_values(df):
    for value_col in ["Original Toll Value", "Converted Toll Value"]:
        avg_toll = df[value_col].mean()
        if avg_toll >= 1:
            df[value_col] = df[value_col].round(2)
            decimals = False
        else:
            df[value_col] = df[value_col].round(2)
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


def units_filter(df):
    non_null = df["Converted Toll Value"].count()
    if non_null > 0:
        uf = [[list(df["Original Toll Unit"])[0], True], [list(df["Converted Toll Unit"])[0], False]]
    else:
        uf = False
    return uf


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
        units = list(set(df["Original Toll Unit"]))
        if len(products) > 1:
            product_filter = list(set(df["Product"]))
            product_filter = [[x, True] if x == "heavy crude" else [x, False] for x in product_filter]
        else:
            product_filter = False

        if len(units) > 1:
            series_col = "Units"
            print("Multiple units for: "+company)
        elif len(products) > 1 and len(services) <= 1 :
            series_col = "Product"
        elif len(services) > 1 and len(products) <= 1:
            series_col = "Service"
        elif len(services) <= 1 and len(products) <= 1:
            series_col = "Path"
        elif len(products) > 1 and len(services) > 1:
            series_col = "Service"
        else:
            series_col = "Service"
            print("error! Need to filter on two columns")
        # override series col if needed
        if company in ["Westcoast", "Keystone"]:
            series_col = "Path"

        return series_col, product_filter

    df, descriptions, toll_nums, translations = get_tolls_data(sql)
    toll_nums = normalize_dates(toll_nums, ["s", "e"])
    df = normalize_text(df, ['Product', 'Path', 'Service', 'Original Toll Unit', 'Converted Toll Unit'])
    df = normalize_dates(df, ["Effective Start", "Effective End"])
    df = df[~df["Effective Start"].isnull()].copy().reset_index(drop=True)

    company_files = get_company_list()
    process_description(descriptions, save)

    if companies:
        company_files = companies
    for company in company_files:
        # print(company)
        this_company_data = {}
        if company == "EnbridgeMainline":
            df_c = df[df["PipelineID"].isin(["EnbridgeMainline", "EnbridgeFSP", "EnbridgeLocal"])].copy().reset_index(drop=True)
        else:
            df_c = df[df["PipelineID"] == company].copy().reset_index(drop=True)

        df_c, selected_paths, selectedService, path_filter, split_default, path_totals, decimals = company_filter(df_c, company)
        meta = {"companyName": company}
        if not df_c.empty and company in completed:
            meta["build"] = True
            meta["pathTotals"] = path_totals
            meta["decimals"] = decimals
            paths = sorted(list(set(df_c["Path"])))
            services = sorted(list(set(df_c["Service"])))
            units = list(set(df_c["Original Toll Unit"]))
            meta["pathFilter"] = path_filter
            meta["split"] = {"default": split_default}
            if split_default:
                meta["split"]["buttons"] = list(set(df_c["split"]))
                path_series = {}
                meta["paths"], meta["seriesCol"], meta["products"], meta["services"], meta["units"], meta["tollNum"], meta["unitsFilter"] = {}, {}, {}, {}, {}, {}, {}
                if company == "EnbridgeMainline":
                    meta["splitDescription"] = {}
                else:
                    meta["splitDescription"] = False

                for split in list(set(df_c["split"])):
                    df_split = df_c[df_c["split"] == split].copy().reset_index(drop=True)
                    # add toll numbers
                    this_nums = toll_nums[toll_nums["PipelineID"] == list(df_split["PipelineID"])[0]].copy()
                    del this_nums["PipelineID"]
                    meta["tollNum"][split] = this_nums.to_dict(orient="records")
                    # add enbridge descriptions
                    if meta["splitDescription"] != False and split != "Enbridge Mainline":
                        current_definition = descriptions[descriptions["PipelineID"] ==list(df_split["PipelineID"])[0]]
                        meta["splitDescription"][split] = list(current_definition["Toll Description"])[0]


                    paths = sorted(list(set(df_split["Path"])))
                    services = sorted(list(set(df_split["Service"])))
                    units = list(set(df_split["Original Toll Unit"]))
                    series_col, product_filter = find_series_col(df_split, company)
                    if len(selected_paths) > 0:
                        meta["paths"][split] = [[p, True] if p in selected_paths[split] else [p, False] for p in paths]
                    else:
                        meta["paths"][split] = [[p, True] for p in paths]
                    meta["products"][split] = product_filter
                    meta["seriesCol"][split] = series_col
                    meta["unitsFilter"][split] = units_filter(df_split)
                    if selectedService:
                        meta["services"][split] = [[s, True] if s == selectedService[split] else [s, False] for s in services]
                    else:
                        meta["services"][split] = selectedService
                    meta["units"][split] = units
                    path_series[split] = generate_path_series(df_split, paths, series_col)
            else:
                # add toll numbers
                this_nums = toll_nums[toll_nums["PipelineID"] == company].copy()
                del this_nums["PipelineID"]
                meta["tollNum"] = this_nums.to_dict(orient="records")
                series_col, product_filter = find_series_col(df_c, company)
                meta["products"] = product_filter
                meta["seriesCol"] = series_col
                meta["paths"] = [[p, True] if p in selected_paths else [p, False] for p in paths]
                meta["services"] = [[s, True] if s == selectedService else [s, False] for s in services]
                meta["units"] = units
                meta["unitsFilter"] = units_filter(df_c)
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
                  "EnbridgeLine9",
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

    df_, this_company_data_ = process_tolls_data(sql=False,
                                                 # companies = ["EnbridgeMainline"],
                                                 companies=completed_,
                                                 completed=completed_)
    print("done tolls")
