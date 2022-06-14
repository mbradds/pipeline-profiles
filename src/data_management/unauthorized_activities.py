import pandas as pd
from util import company_rename, get_company_list, apply_system_id, set_cwd_to_script, normalize_numeric, normalize_dates, normalize_text, replace_nulls_with_none
import json
set_cwd_to_script()


def ua_meta_data(df, company):
    return {}


def optimize_json(df):
    df = replace_nulls_with_none(df)
    df = df.rename(columns={"Event Number": "id",
                            "Event Type": "et",
                            "Equipment Type": "eqt",
                            "Was Pipe Contacted": "wpc",
                            "Method Of Discovery": "mod",
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
    df = normalize_text(df, ["Company Name"])
    df["Company Name"] = df["Company Name"].replace(company_rename())
    df = apply_system_id(df, "Company Name")
    df = df[["Event Number",
              "Event Type",
              "Company Name",
              "Equipment Type",
              "Was Pipe Contacted",
              "Date Event Occurred",
              "Latitude",
              "Longitude",
              "Year",
              "Method Of Discovery"]].copy()

    if companies:
        company_files = companies
    else:
        company_files = get_company_list("all")
        
    print(sorted(list(set(df["Was Pipe Contacted"].astype(str)))))

    for company in company_files:
        try:
            folder_name = company.replace(' ', '').replace('.', '')
            df_c = df[df['Company Name'] == company].copy().reset_index(drop=True)
            this_company_data = {}
            this_company_data["meta"] = {}
            this_company_data["meta"]["companyName"] = company
            if not df_c.empty:
                # this_company_data["meta"] = ua_meta_data(df_c)
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