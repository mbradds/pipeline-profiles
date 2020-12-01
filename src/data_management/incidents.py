import pandas as pd
import os
from util import normalize_dates,pipeline_names,saveJson,normalize_numeric
import ssl
ssl._create_default_https_context = ssl._create_unverified_context

def cer_incidents():
    link = 'https://www.cer-rec.gc.ca/en/safety-environment/industry-performance/interactive-pipeline/map/2020-09-30-incident-data.csv'
    df = pd.read_csv(link,encoding="UTF-16",skiprows=1)
    company_files = ['NOVA Gas Transmission Ltd.']
    df = normalize_dates(df,['Reported Date'])
    df = normalize_numeric(df,['Approximate Volume Released (m³)'],4)
    for company in company_files:
        write_path = os.path.join('../incidents/incidents_data/',company.replace('.','')+'.json')
        df_c = df[df['Company']==company].copy()
        saveJson(df_c, write_path)        
    return df

if __name__ == '__main__':
    df = cer_incidents()