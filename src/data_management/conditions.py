import pandas as pd
import json
import os
from util import saveJson
import geopandas as gpd

def readCsv(link='http://www.cer-rec.gc.ca/open/conditions/conditions.csv'):
    conditions_path = os.path.join(os.getcwd(),'conditions_data/','conditions.csv')
    print('downloading remote file')
    df = pd.read_csv(link,sep='\t',lineterminator='\r',encoding="UTF-16",error_bad_lines=False)
    dates = ['Effective Date','Issuance Date','Sunset Date']
    for date in dates:
        df[date] = pd.to_datetime(df[date])
    delete_cols = ['Project Name','Condition','Condition Phase','Instrument Activity','Condition Type','Condition Filing']
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
        df_c = df_c[df_c['Condition Status']=="In Progress"]
        df_c['id'] = [str(ins)+'_'+str(cond) for ins,cond in zip(df_c['Instrument Number'],df_c['Condition Number'])]
        saveJson(df_c,write_path)
    
    print(df.dtypes)
    return df_c

def company_names(df):
    company_list = list(set(list(df['Company'])))
    return company_list

def export_files(df,folder="../conditions/conditions_data/",name="economic_regions.geojson"):
    df = df[~df.geometry.is_empty]
    df = df[df.geometry.notna()]
    write_path = os.path.join(os.getcwd(),folder,name)
    df.to_file(write_path, driver='GeoJSON')
    print('exported: '+name+' to geojson','with CRS: '+str(df.crs))

def import_statsCan_files(name='ler_000b16a_e.shp'):
    read_path = os.path.join(os.getcwd(),'raw_data/ler_000b16a_e/',name)
    df = gpd.read_file(read_path)
    df = df.set_geometry('geometry')
    export_files(df)
    return df

def import_simplified(name='economic_regions.json'):
    read_path = os.path.join(os.getcwd(),"../conditions/conditions_data/",name)
    df = gpd.read_file(read_path)
    df = df.set_geometry('geometry')
    return df
    


if __name__ == "__main__":
    df = readCsv()
    #shp = import_statsCan_files()
    #shp = import_simplified()
    #company = company_names(df)






