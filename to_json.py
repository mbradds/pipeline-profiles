import pandas as pd
import json
import os

def readCsv(link):
    if os.path.isfile(link.split('/')[-1]):
        print('reading local file')
        df = pd.read_csv(link.split('/')[-1],sep='\t',lineterminator='\r')
    else:
        print('downloading remote file')
        df = pd.read_csv(link,engine='c',encoding='latin')
        df.to_csv(link.split('/')[-1],index=False)
    #df.to_json(link.split('.')[0]+'.json',orient='records')
    return df

def readExcel(name):

    df = pd.read_excel(name)
    df['Condition Number'] = df['Condition Number'].astype('object')
    df['Condition Number'] = [str(x) for x in df['Condition Number']]
    df.to_json(name.split('.')[0]+'.json',orient='records')
    return df


#link = 'http://www.cer-rec.gc.ca/open/conditions/conditions.csv'
#df = readCsv(link)
df = readExcel('conditions.xlsx')


#%%





