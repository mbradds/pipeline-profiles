import os
import json
import re
import pandas as pd
from util import normalize_text, normalize_dates, get_company_list, get_data, set_cwd_to_script, replace_nulls_with_none, updated_month_year
set_cwd_to_script()


def get_tolls_data(sql=True):
    df = get_data(os.getcwd(),
                  "tolls_converted.sql",
                  db="PipelineInformation",
                  sql=sql)

    path = []
    for r, d in zip(df["Receipt Point"], df["Delivery Point"]):
        if r != d:
            path.append(str(r)+"-"+str(d))
        else:
            path.append(str(r))

    df["Path"] = path
    descriptions = get_data(os.getcwd(),
                            "tolls_description.sql",
                            db="PipelineInformation",
                            sql=sql)

    toll_nums = get_data(os.getcwd(),
                    "tolls_numbers.sql",
                    db="PipelineInformation",
                    sql=sql)
    
    for col in ["f", "d"]:
        toll_nums[col] = [x.split("/")[-1] for x in toll_nums[col]]

    translations = get_data(os.getcwd(),
                            "tolls_translation.sql",
                            db="PipelineInformation",
                            sql=sql)
    translations = normalize_text(translations, translations.columns)
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
        df = df[df["Service"].isin(["Uncommitted",
                                    "Committed, 20 yr A Term, Total Contract",
                                    "Committed, 20 yr B Term, Total Contract"])].copy()
        selected_paths = ["Hardisty, Alberta-Houston, Texas"]
        path_filter = [True, "radio"]
    elif company == "NGTL":
        df = df[df["Service"].isin(["Average FT-D", "Average Firm Service Receipt"])].copy()
        df["split"] = ["Average Firm Transportation - Delivery (FT-D)" if "FT-D" in x else "Average Firm Transportation - Receipt (FT-R)" for x in df["Service"]]
        df["Path"] = [x.replace("System-", "").strip() for x in df["Path"]]
        selected_paths = {"Average Firm Transportation - Delivery (FT-D)": ["Group 1",
                                                                            "Group 2",
                                                                            "Group 3"],
                         "Average Firm Transportation - Receipt (FT-R)": ["Receipt-System"]}
        split_default = "Average Firm Transportation - Delivery (FT-D)"
    elif company == "TCPL":
        selected_paths = ["Empress-Emerson 2",
                         "Empress-Enbridge CDA",
                         "Empress-Energir EDA",
                         "Empress-Eastern Zone",
                         "Empress-Iroquois",
                         "Empress-Énergir EDA (formerly called GMIT EDA)",
                         "Empress-Union SWDA",
                         "Union Parkway Belt-Emerson 2",
                         "Union Parkway Belt-Énergir EDA (formerly called GMIT EDA)",
                         "Union Parkway Belt-Enbridge CDA",
                         "Union Parkway Belt-Energir EDA",
                         "Union Parkway Belt-Iroquois",
                         "Union Parkway Belt-Union SWDA"]
        df = df[df["Path"].isin(selected_paths)].copy()
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
        df = df[df["Service"] == "Tank Metered"].copy()
        df = df[df["Path"] != "Edmonton"].copy()
        path_filter = [True, "radio"]
        selected_paths = ["Edmonton-Westridge"]
    elif company == "TQM":
        tqmPaths = ["System"]
        df = df[df["Path"].isin(tqmPaths)].copy()
        df = df[df["Service"] == "T-1"].copy()
        selected_paths = tqmPaths
    elif company == "TransNorthern":
        selected_paths = ["Montreal East, Quebec-Kingston, Ontario",
                         "Montreal East, Quebec-North Toronto, Ontario",
                         "Montreal East, Quebec-Ottawa, Ontario",
                         "Nanticoke, Ontario-North Toronto, Ontario"]
        df = df[df["Service"] != "Abandonment Surcharges"].copy()
        df = df[df["Path"].isin(selected_paths)].copy()
    elif company == "SouthernLights":
        selected_paths = ["International Boundary near Gretna, Manitoba-Edmonton, Alberta"]
        df = df[df["Path"].isin(selected_paths)].copy()
    elif company == "Westcoast":
        selected_paths = list(set(df["Path"]))
        selected_services = "1 year"
    elif company == "Westspur":
        # path_filter = [True, "checkbox"]
        selected_services = "TOLLS"
        selected_paths = list(set(df["Path"]))

    df = df.copy().reset_index(drop=True)
    df = df.sort_values(by=["Path", "Service", "Effective Start"])
    df = round_values(df)
    df = replace_nulls_with_none(df)
    shown_paths = len(list(set(df["Path"])))
    return df, selected_paths, selected_services, path_filter, split_default, [shown_paths, total_paths]


def process_path(df, series_col, minimize=True):
    path_series = list(set(df[series_col]))
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
        df[value_col] = df[value_col].round(3)
    return df


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


def prepare_translation_lookup(df_t):
    del df_t["Table"]
    df_t = df_t.reset_index()
    df_t["index"] = [str(x) for x in df_t["index"]]
    cols = list(set(df_t["Column"]))
    lookup = {}
    for col in cols:
        dfc = df_t[df_t["Column"] == col].copy()
        col_lookup = {}
        for index, e, f in zip(dfc["index"], dfc["English"], dfc["French"]):
            e = str(e).strip()
            f = str(f).strip()
            if e != f:
                col_lookup[e] = f
        lookup[col] = col_lookup
    return lookup


def translate(df, lookup):
    this_company = {}
    def apply_to_col(df_e, look, df_col, look_col):
        for eng_value in df_e[df_col]:
            if eng_value:
                found = False
                for key, value in look[look_col].items():
                    if eng_value == key:
                        this_company[key] = value
                        found = True
                    if found:
                        break

    apply_to_col(df, lookup, "Delivery Point", "Delivery Point")
    apply_to_col(df, lookup, "Receipt Point", "Receipt Point")
    apply_to_col(df, lookup, "Service", "Service")
    apply_to_col(df, lookup, "Product", "Product")
    apply_to_col(df, lookup, "Original Toll Unit", "Units")
    apply_to_col(df, lookup, "Converted Toll Unit", "Units")
    return this_company


def process_tolls(commodity, sql=True, companies=False, save=True):

    def generate_path_series(df, paths, series_col, selected_paths, split):
        path_series = []

        if split and len(selected_paths) > 0:
            check_paths = selected_paths[split]
        else:
            check_paths = selected_paths

        for path in paths:
            df_p = df[df["Path"] == path].copy().reset_index(drop=True)
            selected = False
            if path in check_paths:
                selected = True
            else:
                selected = False
            if not df_p.empty:
                receipt_point = list(df_p["Receipt Point"])[0]
                delivery_point = list(df_p["Delivery Point"])[0]
                path_series.append({"receiptPoint": receipt_point,
                                    "deliveryPoint": delivery_point,
                                    "selected": selected,
                                    "series": process_path(df_p, series_col)})
        return path_series


    def find_series_col(df, company):
        products = list(set(df["Product"]))
        services = list(set(df["Service"]))
        units = list(set(df["Original Toll Unit"]))
        if len(products) > 1:
            product_filter = list(set(df["Product"]))
            product_filter = [[value, True] if x == 0 else [value, False] for x, value in enumerate(product_filter)]
        else:
            product_filter = False

        # dynamically find the series column
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

        # hard code the series column
        if company in ["Westcoast",
                       "Aurora",
                       "NGTL",
                       "Brunswick",
                       "TCPL",
                       "Foothills",
                       "Genesis",
                       "ManyIslands",
                       "MNP",
                       "Montreal",
                       "NormanWells",
                       "TQM",
                       "TransNorthern",
                       "Vector",
                       "Westspur",
                       "Westcoast",
                       "Wascana"]:
            series_col = "Path"
        elif company in ["Alliance",
                         "Cochin",
                         "EnbridgeBakken",
                         "EnbridgeLine9",
                         "Express",
                         "Keystone",
                         "SouthernLights"]:
            series_col = "Service"
        elif company in ["TransMountain", "MilkRiver"]:
            series_col = "Product"
        else:
            print("Error! Series column not hard coded for: "+ company)

        if series_col == "Product":
            product_filter = False

        return series_col, product_filter

    df, descriptions, toll_nums, translations = get_tolls_data(sql)
    translation_lookup = prepare_translation_lookup(translations)
    toll_nums = normalize_dates(toll_nums, ["s", "e"])
    df = normalize_text(df, ['Product', 'Path', 'Service', 'Original Toll Unit', 'Converted Toll Unit'])
    df = normalize_dates(df, ["Effective Start", "Effective End"])
    df = df[~df["Effective Start"].isnull()].copy().reset_index(drop=True)

    company_files = get_company_list(commodity)
    process_description(descriptions, save)

    if companies:
        company_files = companies
    for company in company_files:
        this_company_data = {}
        if company == "EnbridgeMainline":
            df_c = df[df["PipelineID"].isin(["EnbridgeMainline", "EnbridgeFSP", "EnbridgeLocal"])].copy().reset_index(drop=True)
        else:
            df_c = df[df["PipelineID"] == company].copy().reset_index(drop=True)

        df_c, selected_paths, selectedService, path_filter, split_default, path_totals = company_filter(df_c, company)
        company_translations = translate(df_c.copy(), translation_lookup)
        meta = {"companyName": company}
        meta["translations"] = company_translations
        meta["commodity"] = commodity
        if not df_c.empty:
            meta["build"] = True
            meta["pathTotals"] = path_totals
            paths = sorted(list(set(df_c["Path"])))
            services = list(set(df_c["Service"]))
            units = list(set(df_c["Original Toll Unit"]))
            meta["pathFilter"] = path_filter
            meta["split"] = {"default": split_default}
            if split_default:
                meta["split"]["buttons"] = list(set(df_c["split"]))
                path_series = {}
                meta["seriesCol"], meta["products"], meta["services"], meta["units"], meta["tollNum"], meta["unitsFilter"] = {}, {}, {}, {}, {}, {}
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
                    services = list(set(df_split["Service"]))
                    units = list(set(df_split["Original Toll Unit"]))
                    series_col, product_filter = find_series_col(df_split, company)
                    meta["products"][split] = product_filter
                    meta["seriesCol"][split] = series_col
                    meta["unitsFilter"][split] = units_filter(df_split)
                    if selectedService:
                        meta["services"][split] = [[s, True] if s == selectedService[split] else [s, False] for s in services]
                    else:
                        meta["services"][split] = selectedService
                    meta["units"][split] = units[0]
                    path_series[split] = generate_path_series(df_split, paths, series_col, selected_paths, split)
            else:
                # add toll numbers
                this_nums = toll_nums[toll_nums["PipelineID"] == company].copy()
                del this_nums["PipelineID"]
                meta["tollNum"] = this_nums.to_dict(orient="records")
                series_col, product_filter = find_series_col(df_c, company)
                meta["products"] = product_filter
                meta["seriesCol"] = series_col
                meta["services"] = [[s, True] if s == selectedService else [s, False] for s in services]
                meta["units"] = units[0]
                meta["unitsFilter"] = units_filter(df_c)
                path_series = generate_path_series(df_c, paths, series_col, selected_paths, False)

            this_company_data["meta"] = meta
            this_company_data["tolls"] = path_series
        else:
            meta["build"] = False
            this_company_data["meta"] = meta

        if save:
            with open('../data_output/tolls/'+company+'.json', 'w') as fp:
                json.dump(this_company_data, fp, default=str)

    updated_month_year("tolls")
    return df_c, this_company_data


if __name__ == "__main__":
    print("starting tolls...")
    # df_, this_company_data_ = process_tolls("Liquid", sql=False)
    # df_, this_company_data_ = process_tolls("Gas", sql=False)
    df_, this_company_data_ = process_tolls("Liquid", sql=True)
    print("done tolls")
