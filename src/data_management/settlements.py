import pandas as pd
import numpy as np
import os
from util import normalize_dates, saveJson, pipeline_names, get_company_names


def negotiated_settlements(name='2020_Pipeline_System_Report_-_Negotiated_Settlements_and_Toll_Indicies.XLSX'):
    read_path = os.path.join(os.getcwd(), 'raw_data/', name)
    df = pd.read_excel(read_path, sheet_name='Settlements Data', skiprows=2)
    df = df[['Company',
             'Category',
             'Group',
             'Oil/Gas',
             'Settlement Name and/or Reference',
             'Original Settlement Approval',
             'Start Date',
             'End Date (specified, or effective)',
             'Toll Design, Revenue Requirment, or Both',
             'REGDOCS Link to Original Settlement Approval',
             'Notes']]
    df = df[~df['Start Date'].isnull()]
    for delete in ['Toll Design, Revenue Requirment, or Both', 'Notes']:
        del df[delete]
    df = df.rename(columns={'Settlement Name and/or Reference': 'Settlement Name',
                            'End Date (specified, or effective)': 'End Date',
                            'Oil/Gas': 'Commodity',
                            'REGDOCS Link to Original Settlement Approval': 'regdocs',
                            'Original Settlement Approval': 'Toll Order'})

    regdocs_col = []
    for link in df['regdocs']:
        link_str = str(link)
        if 'https' in link_str:
            regdocs_col.append(link_str)
        else:
            regdocs_col.append(None)

    df = df[df['Category'] == "settlement"]
    df['Toll Order'] = [None if x in ['???', np.nan] else x for x in df['Toll Order']]
    df['End Date'] = df['End Date'].replace('Not Fixed', np.nan)
    df = normalize_dates(df, ['Start Date', 'End Date'])
    df = df.sort_values(by=['Company', 'Start Date', 'End Date'])
    del df['Group']
    # df['Company'] = df['Company'].replace(pipeline_names())
    write_path = os.path.join('../settlements/settlements_data/', 'settlements.json')

    company_files = ['NOVA Gas Transmission Ltd.',
                     'TransCanada PipeLines Limited',
                     'Enbridge Pipelines Inc.']
    
    # company_files = list(set(list(df['Company'])))
    for company in company_files:
        folder_name = company.replace(' ', '').replace('.', '')
        if not os.path.exists("../settlements/"+folder_name):
            os.makedirs("../settlements/"+folder_name)
        write_path = os.path.join('../settlements/', folder_name, 'settlementsData.json')
        df_c = df[df['Company'] == company].copy()
        saveJson(df_c, write_path)
    return df


if __name__ == '__main__':
    print('starting settlements...')
    df = negotiated_settlements()
    print('completed settlements!')
