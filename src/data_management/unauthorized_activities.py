import pandas as pd
from util import company_rename, get_company_list, apply_system_id, set_cwd_to_script, normalize_numeric, normalize_dates, normalize_text, replace_nulls_with_none
import json
set_cwd_to_script()


def count_events(df, col):
    event_count = 0
    for x in df[col]:
        if x == "Yes":
            event_count = event_count + 1
    return event_count


def ua_meta_data(df, meta_data):
    # count number of ground disturbances
    meta_data["ground_disturbance_count"] = count_events(df, "Was there a ground disturbance")
    # count number of pipe damages
    meta_data["damage_count"] = count_events(df, "Was Pipe Damaged")
    
    # immediate concern events
    dfi = df[df["Is There Immediate Concern For Safety Of Pipeline Employee Or General Public"] == "Yes"].copy()
    if not dfi.empty:
        meta_data["concern_events"] = list(dfi["Event Number"])
    else:
        meta_data["concern_events"] = None
    return meta_data


def optimize_json(df):
    df = replace_nulls_with_none(df)
    df = df.rename(columns={"Event Number": "id",
                            "Event Type": "et",
                            "Was Pipe Damaged": "wpd",
                            "Was there a ground disturbance": "wgd",
                            "Method Of Discovery": "mod",
                            "Written Consent Issued": "wci",
                            "Is There Immediate Concern For Safety Of Pipeline Employee Or General Public": "ic",
                            "Year": "y"})
    df["loc"] = [[lat, long] for lat, long in zip(df['Latitude'], df['Longitude'])]
    df = df.sort_values(by=['y'])
    for delete in ['Latitude', 'Longitude']:
        del df[delete]
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
    df = df[df["Year"] >= 2015].copy()
    df = normalize_text(df, ["Company Name"])
    df["Company Name"] = df["Company Name"].replace(company_rename())
    df = apply_system_id(df, "Company Name")
    df["Was there a ground disturbance"] = ["Yes" if "Ground Disturbance" in x else "No" for x in df["Event Type"]]
    event_list = []
    for event in df["Event Type"]:
        event = event.split(";")
        event = [x.strip() for x in event]
        event_list.append(event)
    df["Event Type"] = event_list

    df = df[["Event Number",
              "Event Type",
              "Company Name",
              "Was Pipe Damaged",
              "Was there a ground disturbance",
              "Date Event Occurred",
              "Latitude",
              "Longitude",
              "Year",
              "Written Consent Issued",
              "Is There Immediate Concern For Safety Of Pipeline Employee Or General Public",
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
    return df_c

if __name__ == '__main__':
    print('starting unauthorized activities...')
    df_ = process_ua(remote=False, save=True)
    print('completed unauthorized activities!')