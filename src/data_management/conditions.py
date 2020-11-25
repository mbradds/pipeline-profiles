import pandas as pd
import json
import os
from util import saveJson
#%%

def readCsv(link):
    conditions_path = os.path.join(os.getcwd(),'conditions_data/','conditions.csv')
    print('downloading remote file')
    df = pd.read_csv(link,sep='\t',lineterminator='\r',encoding="UTF-16",error_bad_lines=False)
    dates = ['Effective Date','Issuance Date','Sunset Date']
    for date in dates:
        df[date] = pd.to_datetime(df[date])
    delete_cols = ['Project Name','Location']
    for delete in delete_cols:
        del df[delete]
    for r in ['\n','"']:    
        df['Company'] = df['Company'].replace(r,'', regex=True)
    
    df = df[df['Short Project Name']!="SAM/COM"]
    #df.to_csv("../conditions/conditions_data/conditions.csv",index=False,encoding="UTF-16")
    
    company_files = ['NOVA Gas Transmission Ltd.']
    for company in company_files:
        write_path = os.path.join('../conditions/conditions_data/',company.replace('.','')+'.json')
        df_c = df[df['Company']==company].copy()
        saveJson(df_c,write_path)
    return df

def company_names(df):
    company_list = list(set(list(df['Company'])))
    return company_list

def summary_measures(df):
    companies = df['Company'].unique()
    projects = df['Short Project Name'].unique()
    print('Companies: '+str(len(companies)))
    print('Projects: '+str(len(projects)))


if __name__ == "__main__":
    link = 'http://www.cer-rec.gc.ca/open/conditions/conditions.csv'
    df = readCsv(link)
    print(df.dtypes)
    company = company_names(df)
    #summary_measures(df)

#%%





