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


def summary_measures(df):
    companies = df['Company'].unique()
    projects = df['Short Project Name'].unique()
    print('Companies: '+str(len(companies)))
    print('Projects: '+str(len(projects)))

def test_filter(df):
    df = df[df['Company']=='NOVA Gas Transmission Ltd.'].copy()
    df = df[df['Short Project Name']=='Construct North Montney']
    return df

#link = 'http://www.cer-rec.gc.ca/open/conditions/conditions.csv'
#df = readCsv(link)
df = readExcel('conditions.xlsx')
summary_measures(df)
nova = test_filter(df)
print(nova['Theme(s)'].unique())

#%%





