import pandas as pd
from util import company_rename, idify, get_company_list, apply_system_id, set_cwd_to_script, normalize_numeric, normalize_dates, normalize_text
import json
set_cwd_to_script()

def process_ua():
    path = "./raw_data/Damage Prevention Regulation Contravention Reports.xlsx"
    df = pd.read_excel(path, sheet_name="UA Data (Eng)", engine="openpyxl")
    df = normalize_numeric(df, ["Latitude", "Longitude"], 2)
    df = normalize_dates(df, ["Date Event Occurred"], False, "coerce")
    df = normalize_text(df, ["Company Name"])
    df["Company Name"] = df["Company Name"].replace(company_rename())
    # df = df[["Event Number",
    #          "Event Type",
    #          "Company Name",
    #          "Equipment Type",
    #          "Was Pipe Contacted",
    #          "Date Event Occured",
    #          "Method Of Discovery"]].copy()
    return df

if __name__ == '__main__':
    print('starting unauthorized activities...')
    df_ = process_ua()
    print('completed unauthorized activities!')