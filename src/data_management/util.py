from connection import cer_connection
import pandas as pd
import os
from datetime import date
import io


def execute_sql(path,query_name):
    query_path = os.path.join(path, query_name)
    conn, engine = cer_connection(db='tsql23cap')

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

def normalize_dates(df,date_list):
    for date_col in date_list:
        df[date_col] = pd.to_datetime(df[date_col])
        df[date_col] = df[date_col].dt.date
    return df

def normalize_text(df,text_list):
    for text_col in text_list:
        df[text_col] = df[text_col].astype(str)
        df[text_col] = [x.strip() for x in df[text_col]]
    return df

def normalize_numeric(df,num_list,decimals):
    for num_col in num_list:
        df[num_col] = pd.to_numeric(df[num_col],errors='coerce')
        df[num_col] = df[num_col].round(decimals)
    return df

def pipeline_names():
    read_path = os.path.join(os.getcwd(),'raw_data/','NEB_DM_PROD - 1271412 - Pipeline Naming Conventions.XLSX')
    df = pd.read_excel(read_path,sheet_name='Pipeline Naming Conventions')
    df = df.rename(columns={x:x.strip() for x in df.columns})
    df['old name'] = [x.strip() for x in df['Company List maintained by Tammy Walker https://www.cer-rec.gc.ca/bts/whwr/cmpnsrgltdbnb-eng.html']]
    df['new name'] = [x.strip() for x in df['Suggested Pipeline Name for ALL Future External Publications']]
    return {old_name:new_name for old_name,new_name in zip(df['old name'],
                                                           df['new name'])}
def daysInYear(year):
    d1 = date(year, 1, 1)
    d2 = date(year + 1, 1, 1)
    return (d2 - d1).days

def saveJson(df,write_path,precision=2):
    df.to_json(write_path,orient='records',double_precision=precision,compression='infer')