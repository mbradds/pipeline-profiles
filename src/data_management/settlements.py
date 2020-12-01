import pandas as pd
import os
from util import normalize_dates,pipeline_names,saveJson

def negotiated_settlements(name='2020_Pipeline_System_Report_-_Negotiated_Settlements_and_Toll_Indicies.XLSX'):
    read_path = os.path.join(os.getcwd(),'raw_data/',name)
    df = pd.read_excel(read_path,sheet_name='Settlements Data',skiprows=2)
    df = df[['Company', 'Group', 'Oil/Gas',
       'Settlement Name and/or Reference', 'Original Settlement Approval',
       'Start Date', 'End Date (specified, or effective)',
       'Toll Design, Revenue Requirment, or Both', 'Notes']]
    df = df[~df['Start Date'].isnull()]
    for delete in ['Original Settlement Approval','Toll Design, Revenue Requirment, or Both','Notes']:
        del df[delete]
    df = df.rename(columns={'Settlement Name and/or Reference':'Settlement Name',
                            'End Date (specified, or effective)':'End Date',
                            'Oil/Gas':'Commodity'})
    
    df = normalize_dates(df, ['Start Date','End Date'])
    df = df.sort_values(by=['Company','Start Date','End Date'])
    del df['Group']
    #df['Company'] = df['Company'].replace(pipeline_names())
    write_path = os.path.join('../settlements/settlements_data/','settlements.json')
    
    company_files = ['NOVA Gas Transmission Ltd.']
    for company in company_files:
        write_path = os.path.join('../settlements/settlements_data/',company.replace('.','')+'.json')
        df_c = df[df['Company']==company].copy()
        saveJson(df_c, write_path)        
    return df

if __name__ == '__main__':
    df = negotiated_settlements()
