import pandas as pd
from util import company_rename, get_company_list, apply_system_id, set_cwd_to_script, normalize_numeric, normalize_dates, normalize_text, replace_nulls_with_none, updated_month_year, replace_what_why
import json
from datetime import datetime
set_cwd_to_script()


def filter_last_five_years(df):
    current_year = datetime.now().year
    first_year = current_year - 5
    df = df[df["Year"] >= first_year].copy()
    return df, current_year, first_year


def count_events(df, col):
    event_count = 0
    for x in df[col]:
        if x == "Yes":
            event_count = event_count + 1
    return event_count


def ua_meta_data(df, meta_data):
    # total events
    meta_data["total_events"] = len(df)
    # count number of ground disturbances
    meta_data["ground_disturbance_count"] = count_events(df, "Was there a ground disturbance")
    # count number of pipe damages
    meta_data["damage_count"] = count_events(df, "Was Pipe Damaged")
    # further action required by the company
    meta_data["further_action_required"] = count_events(df, "Further Action Required")
    return meta_data


def optimize_json(df):
    df = replace_nulls_with_none(df)
    for yes_no in ["Was Pipe Damaged", "Was there a ground disturbance"]:
        df[yes_no] = df[yes_no].replace({"Yes":"y", "No": "n"})

    df["Who Discovered The Event"] = df["Who Discovered The Event"].replace({"1st party (regulated company)": "1",
                                                                             "2nd party (contractor working for the regulated company)": "2",
                                                                             "3rd party (no connection to the regulated company)": "3"})
    
    df["Method Of Discovery"] = df["Method Of Discovery"].replace({"Aerial patrol": "a",
                                                                   "Ground patrol": "g",
                                                                   "Site visit": "s",
                                                                   "Other": "o"})

    df = df.rename(columns={"Event Number": "id",
                            "Event Type": "et",
                            "Was Pipe Damaged": "wpd",
                            "Was there a ground disturbance": "wgd",
                            "Method Of Discovery": "mod",
                            "Basic Causes": "bc",
                            "Who Discovered The Event": "wdi",
                            "Year": "y"})
    df["loc"] = [[lat, long] for lat, long in zip(df['Latitude'], df['Longitude'])]
    df = df.sort_values(by=['y'])
    for delete in ['Latitude', 'Longitude', 'Further Action Required']:
        del df[delete]
    return df


def apply_not_specified(df, col):
    df[col] = df[col].fillna("ns")
    df[col] = df[col].replace({"Not Specified": "ns"})
    return df


def process_ua(companies=False, remote=True, test=False, save=True):

    if test:
        print("No tests yet for unauthorized activities")
        return
    elif remote:
        print("reading remote UA data")
        df = pd.read_csv("https://www.cer-rec.gc.ca/open/operations/damage-prevention-regulation-contravention-reports.csv",
                         encoding="latin-1",
                         engine="python")
        df.to_csv("./raw_data/unauthorized_activities.csv")
    else:
        print("reading local UA file")
        df = pd.read_csv("./raw_data/unauthorized_activities.csv")

    df = normalize_numeric(df, ["Latitude", "Longitude"], 2)
    date_col = "Final Submission Date"
    df = normalize_dates(df, [date_col], False, "coerce")
    df["Year"] = df[date_col].dt.year
    df, current_year, first_year = filter_last_five_years(df)
    df = normalize_text(df, ["Company Name"])
    df["Company Name"] = df["Company Name"].replace(company_rename())
    df = apply_system_id(df, "Company Name")
    df["Was there a ground disturbance"] = ["Yes" if "Ground Disturbance" in x else "No" for x in df["Event Type"]]

    cause_list = []
    for cause in df["Basic Causes"]:
        cause = str(cause).split("-")
        cause = [x.strip() for x in cause]
        cause_list.append(cause)
    df["Basic Causes"] = cause_list


    event_types = {"Vehicle Crossing": "v",
                   "Ground Disturbance": "g",
                   "Construction of a Facility": "c",
                   "Damage to Pipe": "d"}
    df = replace_what_why(df, "Event Type", event_types, ";")

    df = apply_not_specified(df, "Was Pipe Damaged")
    df = apply_not_specified(df, "Who Discovered The Event")
    df = apply_not_specified(df, "Method Of Discovery")

    df = df[["Event Number",
              "Event Type",
              "Company Name",
              "Was Pipe Damaged",
              "Was there a ground disturbance",
              "Date Event Occurred",
              "Further Action Required",
              "Latitude",
              "Longitude",
              "Year",
              "Basic Causes",
              "Who Discovered The Event",
              "Method Of Discovery"]].copy()

    if companies:
        company_files = companies
    else:
        company_files = get_company_list("all")

    for company in company_files:
        try:
            folder_name = company.replace(' ', '').replace('.', '')
            df_c = df[df['Company Name'] == company].copy().reset_index(drop=True)
            this_company_data = {}
            this_company_data["meta"] = {}
            this_company_data["meta"]["companyName"] = company
            this_company_data["meta"]["first_year"] = first_year
            this_company_data["meta"]["current_year"] = current_year
            if not df_c.empty:
                this_company_data["meta"] = ua_meta_data(df_c, this_company_data["meta"])
                this_company_data["meta"]["build"] = True
                for delete in ["Date Event Occurred", "Company Name"]:
                    del df_c[delete]
                df_c = optimize_json(df_c)
                this_company_data['events'] = df_c.to_dict(orient='records')
            else:
                this_company_data["meta"]["build"] = False
                this_company_data["events"] = None

            with open('../data_output/unauthorized_activities/'+folder_name+'.json', 'w') as fp:
                json.dump(this_company_data, fp)
        except:
            raise
    updated_month_year("ua")
    return df_c

if __name__ == '__main__':
    print('starting unauthorized activities...')
    df_ = process_ua(remote=False, save=True)
    print('completed unauthorized activities!')