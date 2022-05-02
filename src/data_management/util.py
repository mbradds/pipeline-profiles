import io
import os
import pandas as pd
import numpy as np
from connection import cer_connection
from errors import IdError, IdLengthError


def set_cwd_to_script():
    dname = os.path.dirname(os.path.abspath(__file__))
    os.chdir(dname)
    

set_cwd_to_script()


def get_pipeline_ids(sql=True):
    if sql:
        df = execute_sql(path=os.path.join(os.getcwd(), "queries"),
                         query_name="systemId.sql",
                         db="PipelineInformation")
        df.to_csv("./raw_data/systemId.csv", index=False)
    else:
        df = pd.read_csv("./raw_data/systemId.csv")
    for col in df:
        df[col] = [str(x).strip() for x in df[col]]
    return df


def apply_system_id(df, col):
    ids = get_pipeline_ids(False)
    id_look = {k: v for k, v in zip(ids["companyEng"], ids["PipelineID"])}
    df[col] = df[col].replace(id_look)
    return df


def get_company_list(commodity="all"):
    ids = get_pipeline_ids(False)
    company_list = [[c1, c2] for c1, c2 in zip(ids["PipelineID"], ids["Commodity"])]
    if commodity == "all":
        return [x[0] for x in company_list]
    elif commodity in ["Gas", "Liquid"]:
        return [x[0] for x in company_list if x[1] == commodity]
    else:
        return []


def company_rename():
    names = {'Westcoast Energy Inc., carrying on business as Spectra Energy Transmission': 'Westcoast Energy Inc.',
             'Kingston Midstream Limited': 'Kingston Midstream Westspur Limited',
             'Enbridge Pipelines (Westspur) Inc.': 'Kingston Midstream Westspur Limited',
             'Imperial Oil Resources N.W.T. Limited': 'Enbridge Pipelines (NW) Inc.',
             'TransCanada Energy Ltd.': 'TransCanada PipeLines Limited',
             "Trans Quebec and Maritimes Pipeline Inc.": "Trans Québec and Maritimes Pipeline Inc.",
             'Trans QuÃ©bec and Maritimes Pipeline Inc.': 'Trans Québec and Maritimes Pipeline Inc.',
             'Enbridge Southern Lights GP Inc.': 'Enbridge Southern Lights GP Inc. on behalf of Enbridge Southern Lights LP',
             'Alliance Pipeline Ltd as General Partner of Alliance Pipeline Limited Partnership': 'Alliance Pipeline Ltd.',
             'Trans Mountain Pipeline Inc.': 'Trans Mountain Pipeline ULC',
             'Kinder Morgan Cochin ULC': 'PKM Cochin ULC',
             'TEML Westspur Pipelines Limited': 'Kingston Midstream Westspur Limited',
             'Tundra Energy Marketing Limited': 'Kingston Midstream Westspur Limited',
             'Plains Marketing Canada, L.P.': 'Plains Midstream Canada ULC',
             'Express Pipeline Ltd., as the general partner of Express Holdings (Canada) Limited Partnership': 'Express Pipeline Ltd.'}
    return names


def execute_sql(path, query_name, db='tsql23cap'):
    query_path = os.path.join(path, query_name)
    conn, engine = cer_connection(db=db)

    def utf_16_open(query_path):
        file = io.open(query_path, mode='r', encoding="utf-16", errors='ignore')
        query = file.read()
        file.close()
        return query

    def no_encoding_open(query_path):
        file = io.open(query_path, mode='r', errors='ignore')
        query = file.read()
        file.close()
        return query

    try:
        query = utf_16_open(query_path)
    except:
        query = no_encoding_open(query_path)

    df = pd.read_sql_query(query, con=conn)
    conn.close()
    return df


def most_common(df,
                meta,
                col_name,
                meta_key,
                top=1,
                dtype="dict",
                lower=True,
                join_ties=True):

    what_list = []
    for what in df[col_name]:
        what = str(what)
        if ',' in what:
            what_list.extend(what.split(','))
        else:
            what_list.append(what)
    what_list = [x.strip() for x in what_list]
    what_list = [x for x in what_list if x not in ['To be determined', '', "Other", "Not Specified", "Sans objet", "Autre"]]

    df_t = pd.DataFrame(what_list, columns=["entries"])
    df_t['records'] = 1
    df_t = df_t.groupby(by="entries").sum().reset_index()
    df_t = df_t.sort_values(by=['records', 'entries'], ascending=[False, True])
    if join_ties:
        df_t = df_t.groupby(by="records").agg({"entries": " & ".join}).reset_index()
        df_t = df_t.sort_values(by=['records'], ascending=False)
    df_t = df_t.head(top)

    counter = {}
    for name, count in zip(df_t['entries'], df_t['records']):
        counter[name] = count

    if lower:
        counter = {k.lower(): counter[k] for k in list(counter)}

    if dtype != "dict":
        counter = list(counter.keys())
    if top == 1:
        counter = list(counter.keys())[0]
    meta[meta_key] = counter
    return meta


# def normalize_bool(df, cols, normType="Y/N"):
#     for col in cols:
#         df[col] = [str(x).strip() for x in df[col]]
#         if normType == "T/F":
#             df[col] = df[col].replace({"True": "T",
#                                        "False": "F"})
#         elif normType == "Y/N":
#             df[col] = df[col].replace({"True": "Yes",
#                                        "False": "No"})
#     return df


def normalize_dates(df, date_list, short_date=False, errors="raise"):
    for date_col in date_list:
        df[date_col] = pd.to_datetime(df[date_col], errors=errors)
        if short_date:
            df[date_col] = df[date_col].dt.date
    return df


def normalize_text(df, text_list):
    for text_col in text_list:
        df[text_col] = df[text_col].astype(object)
        df[text_col] = [str(x).strip() for x in df[text_col]]
    return df


def normalize_numeric(df, num_list, decimals, errors="coerce"):
    for num_col in num_list:
        df[num_col] = pd.to_numeric(df[num_col], errors=errors)
        df[num_col] = df[num_col].round(decimals)
    return df


def pipeline_names():
    read_path = os.path.join(os.getcwd(), 'raw_data/','NEB_DM_PROD - 1271412 - Pipeline Naming Conventions.XLSX')
    df = pd.read_excel(read_path, sheet_name='Pipeline Naming Conventions')
    df = df.rename(columns={x: x.strip() for x in df.columns})
    df['old name'] = [x.strip() for x in df['Company List maintained by Tammy Walker https://www.cer-rec.gc.ca/bts/whwr/cmpnsrgltdbnb-eng.html']]
    df['new name'] = [x.strip() for x in df['Suggested Pipeline Name for ALL Future External Publications']]
    return {old_name: new_name for old_name, new_name in zip(df['old name'],
                                                             df['new name'])}


# def days_in_year(year):
#     d1 = date(year, 1, 1)
#     d2 = date(year + 1, 1, 1)
#     return (d2 - d1).days


# def save_json(df, write_path, precision=2):
#     df.to_json(write_path,
#                orient='records',
#                double_precision=precision,
#                compression='infer')


def get_company_names(col):
    return sorted(list(set(col)))


def conversion(df, commodity, data_cols, rounding=False, fillna=False):
    if commodity in ["gas", "Gas"]:
        conv = 28316.85
    elif commodity in ["oil", "Oil", "Liquid"]:
        conv = 6.2898
    for col in data_cols:
        if fillna:
            df[col] = df[col].fillna(fillna)
        if commodity in ["oil", "Oil", "Liquid"]:
            df[col] = [x*conv if not pd.isnull(x) else x for x in df[col]]
        else:
            df[col] = [x/conv if not pd.isnull(x) else x for x in df[col]]
        if rounding:
            df[col] = df[col].round(rounding)
    return df


def strip_cols(df):
    new_cols = {x: x.strip() for x in df.columns}
    df = df.rename(columns=new_cols)
    return df


def idify(df, col, key, lcase=True):

    region = {"alberta": "ab",
              "british columbia": "bc",
              "saskatchewan": "sk",
              "manitoba": "mb",
              "ontario": "on",
              "quebec": "qc",
              "québec": "qc",
              "new brunswick": "nb",
              "nova scotia": "ns",
              "northwest territories": "nt",
              "prince edward island": "pe",
              "nunavut": "nu",
              "yukon": "yt"}

    if key == "region":
        r = region
    else:
        r = key

    if lcase:
        df[col] = [x.lower() for x in df[col]]
    df[col] = df[col].replace(r)

    # check if column has non id's
    # maxColLength = max([len(str(x)) for x in df[col]])
    max_id_length = max([len(str(x)) for x in r.values()])
    doesnt_count = [np.nan, "nan", None, "none"]
    for value in df[col]:
        if value not in r.values() and value not in doesnt_count:
            raise IdError(value)
        if len(str(value)) > max_id_length and value not in doesnt_count:
            raise IdLengthError(value)

    return df


def get_data(script_loc, query, db="", sql=False, csv_encoding="utf-8"):
    csv_name = query.split(".")[0]+".csv"
    if sql:
        print('reading SQL '+query.split(".")[0])
        df = execute_sql(path=os.path.join(script_loc, "queries"), query_name=query, db=db)
        df.to_csv('raw_data/'+csv_name, index=False)
    else:
        print('reading local '+query.split(".")[0])
        df = pd.read_csv('raw_data/'+csv_name, encoding=csv_encoding)
    return df


def prepare_ids(df):
    id_save = {}
    for key, e, f in zip(df.id, df.e, df.f):
        id_save[key] = {"e": e, "f": f}
    return id_save
