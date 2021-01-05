import pandas as pd
import json
import os
from util import saveJson,normalize_text
import geopandas as gpd
from datetime import date
#%%

script_dir = os.path.dirname(__file__) 

def import_simplified(name='economic_regions.json'):
    read_path = os.path.join(script_dir,"../conditions/base_maps/",name)
    df = gpd.read_file(read_path)
    df = df.set_geometry('geometry')
    fr_cols = ['PRNAME','ERNAME']
    for splitcols in fr_cols:    
        df[splitcols] = [x.split('/')[0].strip() for x in df[splitcols]]
    return df

def export_files(df,folder,name):
    df = df[~df.geometry.is_empty]
    df = df[df.geometry.notna()]
    write_path = os.path.join(script_dir,folder,name)
    df.to_file(write_path, driver='GeoJSON')
    print('exported: '+name+' to geojson','with CRS: '+str(df.crs))


def conditions_on_map(df,shp,folder_name):
    shp = pd.merge(shp,df,how='inner',left_on=['PRNAME','ERNAME'],right_on=['Flat Province','id'])
    for delete in ['PRUID','ERUID','ERNAME','PRNAME']:
        del shp[delete]
    export_files(shp,folder="../conditions/"+folder_name,name='economicRegions.json')
    saveJson(df,os.path.join('../conditions/'+folder_name,'mapMetadata.json'))
    return shp

def metadata(df,folder_name):
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
    
    #get the date the data was pulled
    status['updated'] = date.today().strftime("%b %d, %Y")
    meta['summary'] = status
    
    #once the status summary is calculated, blank locations and null locations can be removed
    df = df[df['Location']!="nan"]
    #TODO: remove this filter, and group all metadata by condition status. All metadata should have an "In Progress" and "Closed" column
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
    theme = theme.rename(columns={0:"In Progress"})
    theme = theme.to_dict(orient='records')
    meta['themes'] = theme
    
    #save the metadata
    with open('../conditions/'+folder_name+'/summaryMetadata.json', 'w') as fp:
        json.dump(meta, fp)
    
    df_all = df.copy()
    del df_all['Location']
    df_all = df_all.groupby(['Flat Province','id']).agg({'condition id':'count',
                                                             'Short Project Name':lambda x: list(x),
                                                             'Theme(s)':lambda t: list(t)})
    
    for delete in ['Short Project Name','Theme(s)']:
        del df_all[delete]
        
    df_all = df_all.reset_index()
    df_all = df_all.rename(columns={'condition id':'value'})

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
        folder_name = company.replace(' ','').replace('.','')
        if not os.path.exists("../conditions/"+folder_name):
            os.makedirs("../conditions/"+folder_name)
        
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
        meta = metadata(df_all,folder_name)
        return meta
        shp = conditions_on_map(meta, regions_map, folder_name)
    
    return shp


def company_names(df):
    company_list = list(set(list(df['Company'])))
    return company_list


if __name__ == "__main__":
    shp = readCsv()

#%%



