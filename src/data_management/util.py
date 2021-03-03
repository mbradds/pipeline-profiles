from connection import cer_connection
import pandas as pd
import os
from datetime import date
import io


def execute_sql(path, query_name, db='tsql23cap'):
    query_path = os.path.join(path, query_name)
    conn, engine = cer_connection(db=db)

    def utf16open(query_path):
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
        query = utf16open(query_path)
    except:
        query = no_encoding_open(query_path)

    df = pd.read_sql_query(query, con=conn)
    conn.close()
    return df


def most_common(df, meta, col_name, meta_key, top=1, dtype="dict", lower=True):
    what_list = []
    for what in df[col_name]:
        what = str(what)
        if ',' in what:
            what_list.extend(what.split(','))
        else:
            what_list.append(what)
    what_list = [x.strip() for x in what_list]
    what_list = [x for x in what_list if x not in ['To be determined', '', "Other", "Not Specified"]]
    if top == 1:
        meta[meta_key] = max(set(what_list), key=what_list.count).lower()
    else:
        counter = {}
        for e in what_list:
            if e in counter:
                counter[e] = counter[e] + 1
            else:
                counter[e] = 1
        counter = dict(sorted(counter.items(), key=lambda item: item[1], reverse=True))
        if lower:
            counter = {k.lower(): counter[k] for k in list(counter)[:top]}
        else:
            counter = {k: counter[k] for k in list(counter)[:top]}

        if dtype != "dict":
            counter = list(counter.keys())
        meta[meta_key] = counter
    return meta


def normalizeBool(df, cols, normType="Y/N"):
    for col in cols:
        df[col] = [str(x).strip() for x in df[col]]
        if normType == "T/F":
            df[col] = df[col].replace({"True": "T",
                                       "False": "F"})
        elif normType == "Y/N":
            df[col] = df[col].replace({"True": "Yes",
                                       "False": "No"})

    return df


def normalize_dates(df, date_list, short_date=False):
    for date_col in date_list:
        df[date_col] = pd.to_datetime(df[date_col], errors='raise')
        if short_date:
            df[date_col] = df[date_col].dt.date
    return df


def normalize_text(df, text_list):
    for text_col in text_list:
        df[text_col] = df[text_col].astype(object)
        df[text_col] = [str(x).strip() for x in df[text_col]]
    return df


def normalize_numeric(df, num_list, decimals):
    for num_col in num_list:
        df[num_col] = pd.to_numeric(df[num_col], errors='coerce')
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


def daysInYear(year):
    d1 = date(year, 1, 1)
    d2 = date(year + 1, 1, 1)
    return (d2 - d1).days


def saveJson(df, write_path, precision=2):
    df.to_json(write_path,
               orient='records',
               double_precision=precision,
               compression='infer')


def get_company_names(col):
    return sorted(list(set(col)))


def company_rename():
    names = {'Westcoast Energy Inc., carrying on business as Spectra Energy Transmission': 'Westcoast Energy Inc.',
             'Kingston Midstream Limited': 'Kingston Midstream Westspur Limited',
             'Trans Québec and Maritimes Pipeline Inc.': 'Trans Quebec and Maritimes Pipeline Inc.',
             'Enbridge Southern Lights GP Inc. on behalf of Enbridge Southern Lights LP': 'Southern Lights Pipeline',
             'Alliance Pipeline Ltd as General Partner of Alliance Pipeline Limited Partnership': 'Alliance Pipeline Ltd.',
             'Trans Mountain Pipeline Inc.': 'Trans Mountain Pipeline ULC',
             'Kinder Morgan Cochin ULC': 'PKM Cochin ULC',
             'Enbridge Bakken Pipeline Company Inc., on behalf of Enbridge Bakken Pipeline Limited Partnership': 'Enbridge Bakken Pipeline Company Inc.',
             'TEML Westspur Pipelines Limited': 'Kingston Midstream Westspur Limited',
             'Plains Marketing Canada, L.P.': 'Plains Midstream Canada ULC'}
    return names


if __name__ == "__main__":
    None


