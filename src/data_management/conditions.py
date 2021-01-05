import pandas as pd
import json
import os
from util import saveJson,normalize_text
import geopandas as gpd
import time
#%%

script_dir = os.path.dirname(__file__) 

def import_stats_can(name='ler_000b16a_e.shp'):
    read_path = os.path.join(script_dir, 'raw_data/ler_000b16a_e/',name)
    df = gpd.read_file(read_path)
    df = df.set_geometry('geometry')
    print(df.crs)
    return df
    

def import_simplified(name='economic_regions.json'):
    read_path = os.path.join(script_dir,"../conditions/conditions_data/",name)
    df = gpd.read_file(read_path)
    df = df.set_geometry('geometry')
    fr_cols = ['PRNAME','ERNAME']
    for splitcols in fr_cols:    
        df[splitcols] = [x.split('/')[0].strip() for x in df[splitcols]]
    #df = df.rename(columns={'ERNAME':'id'})
    return df

def export_files(df,folder="../conditions/conditions_data/",name="economic_regions.geojson"):
    df = df[~df.geometry.is_empty]
    df = df[df.geometry.notna()]
    write_path = os.path.join(script_dir,folder,name)
    df.to_file(write_path, driver='GeoJSON')
    print('exported: '+name+' to geojson','with CRS: '+str(df.crs))


def conditions_on_map(df,shp,company):
    shp = pd.merge(shp,df,how='inner',left_on=['PRNAME','ERNAME'],right_on=['Flat Province','id'])
    for delete in ['Short Project Name','Flat Province','Themes']:
        del shp[delete]
    export_files(shp,folder="../conditions/conditions_map",name=company.replace('.','')+'.json')
    saveJson(df,os.path.join('../conditions/conditions_map/',company.replace('.','')+'meta'+'.json'))
    return shp

def metadata(df):
    #df contains the condition data for the spcecific company
    
    meta = {}
    #get the summary stats for the boxes above the map
    status = df[['condition id','Condition Status']].copy()
    status = status.groupby(['Condition Status']).size().reset_index()
    status = pd.pivot_table(status,values=0,columns="Condition Status")
    status = status.to_dict(orient='records')[0]
    df['Location'] = df['Location'].astype("object")
    notInMap = 0
    for l in df['Location']:
        if l == "nan":
            notInMap = notInMap+1
    status['notOnMap'] = notInMap
    status['updated'] = time.time()
    meta['summary'] = status
    
    #once the status summary is calculated, blank locations and null locations can be removed
    df = df[df['Location']!="nan"]
    df = df[df['Condition Status']=="In Progress"]       
    
    #get the unique project names sorted by number of open conditions
    project = df[['condition id','Short Project Name','id']]
    project = project.groupby(['Short Project Name','id']).size().reset_index()
    project = project.sort_values(by=['id',0],ascending=False)
    project = project.rename(columns={0:"In Progress"})
    project = project.to_dict(orient='records')
    meta['projects'] = project
    
    #get the unique project themes sorted by number of open conditions
    theme = df[['condition id','Theme(s)','id']]
    theme = theme.groupby(['Theme(s)','id']).size().reset_index()
    theme = theme.sort_values(by=['id',0],ascending=False)
    theme = theme.rename(columns={0:"Themes"})
    theme = theme.to_dict(orient='records')
    meta['themes'] = theme
    
    #save the metadata
    with open('../conditions/conditions_map/meta.json', 'w') as fp:
        json.dump(meta, fp)
    
    df_all = df.copy()
    del df_all['Location']
    df_all = df_all.groupby(['Flat Province','id']).agg({'condition id':'count',
                                                             'Short Project Name':lambda x: list(x),
                                                             'Theme(s)':lambda t: list(t)})
        
    for list_field in ['Short Project Name','Theme(s)']:
        joined_values = []
        for list_row in df_all[list_field]:
            if list_field == 'Theme(s)':
                concat_themes = []
                for theme in list_row:
                    concat_themes.extend(theme.split(','))
                list_row = [x.strip() for x in concat_themes]
            joined_values.append(' - '.join(list(set(list_row))))
        df_all[list_field] = joined_values
        
    df_all = df_all.reset_index()
    df_all = df_all.rename(columns={'condition id':'value','Theme(s)':'Themes'})
    return df_all


def readCsv(remote=False):
    if remote:
        link='http://www.cer-rec.gc.ca/open/conditions/conditions.csv'
        conditions_path = os.path.join(script_dir,'conditions_data/','conditions.csv')
        print('downloading remote file')
        df = pd.read_csv(link,sep='\t',lineterminator='\r',encoding="UTF-16",error_bad_lines=False)
    else:
        print('reading local file')
        df = pd.read_csv("./raw_data/conditions.csv",sep='\t',lineterminator='\r',encoding="UTF-16",error_bad_lines=False)
    
    dates = ['Effective Date','Issuance Date','Sunset Date']
    for date in dates:
        df[date] = pd.to_datetime(df[date])
        
    df = normalize_text(df,['Location','Short Project Name','Theme(s)'])
    delete_cols = ['Project Name','Condition','Condition Phase','Instrument Activity','Condition Type','Condition Filing']
    for delete in delete_cols:
        del df[delete]
    for r in ['\n','"']:    
        df['Company'] = df['Company'].replace(r,'', regex=True)
    
    df = df[df['Short Project Name']!="SAM/COM"]
    
    company_files = ['NOVA Gas Transmission Ltd.']
    regions_map = import_simplified()
    
    for company in company_files:
        # write_path = os.path.join('../conditions/conditions_data/',company.replace('.','')+'.json')
        df_c = df[df['Company']==company].copy()
        df_c['condition id'] = [str(ins)+'_'+str(cond) for ins,cond in zip(df_c['Instrument Number'],df_c['Condition Number'])]
        
        expanded_locations = []
        for unique in df_c['condition id']:
            row = df_c[df_c['condition id']==unique].copy()
            locations =  [x.split(',') for x in row['Location']]
            for region in locations[0]:
                regionProvince = region.strip().split('/')
                row['id'] = regionProvince[0].strip()
                row['Flat Province'] = regionProvince[-1].strip()
                expanded_locations.append(row)
        df_all = pd.concat(expanded_locations,axis=0,sort=False,ignore_index=True)
        #calculate metadata here
        meta = metadata(df_all)
        shp = conditions_on_map(meta, regions_map,company)
    
    return shp


def company_names(df):
    company_list = list(set(list(df['Company'])))
    return company_list


if __name__ == "__main__":
    shp = readCsv()
    #shp = import_stats_can()

#%%