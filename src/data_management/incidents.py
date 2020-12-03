import pandas as pd
import os
from util import normalize_dates,pipeline_names,saveJson,normalize_numeric
import ssl
ssl._create_default_https_context = ssl._create_unverified_context

def save_path(company,ext):
    return os.path.join('../incidents/incidents_data/',company.replace('.','')+ext)
    
def cer_incidents():
    link = 'https://www.cer-rec.gc.ca/en/safety-environment/industry-performance/interactive-pipeline/map/2020-09-30-incident-data.csv'
    df = pd.read_csv(link,encoding="UTF-16",skiprows=1)
    company_files = ['NOVA Gas Transmission Ltd.']
    df = normalize_dates(df,['Reported Date'])
    df = normalize_numeric(df,['Approximate Volume Released (m³)'],4)
    for company in company_files:
        json_path,csv_path,max_csv_path = save_path(company,'.json'),save_path(company,'.csv'),save_path(company+'_max','.csv')
        largest_csv_path = save_path(company+'_largest_spill','.csv')
        df_c = df[df['Company']==company].copy()
        df_max = df_c[df_c['Reported Date']==max(df_c['Reported Date'])].copy()
        df_spill = df_c[df_c['Approximate Volume Released (m³)']==df_c['Approximate Volume Released (m³)'].max()]
        df_spill.to_csv(largest_csv_path,index=False)
        df_max.to_csv(max_csv_path,index=False)
        df_c.to_csv(csv_path,index=False)
        saveJson(df_c, json_path)        
    return df_spill

if __name__ == '__main__':
    df = cer_incidents()