from util import execute_sql
import pandas as pd
import json
import os
from util import saveJson, normalize_text, get_company_names, company_rename
import geopandas as gpd
from datetime import date
import numpy as np
script_dir = os.path.dirname(__file__)


def orca_regdocs_links(sql=False):
    if sql:
        df = execute_sql(script_dir, 'projects_regdocs.sql')
        df.to_csv('raw_data/projects_regdocs.csv', index=False)
    else:
        df = pd.read_csv('raw_data/projects_regdocs.csv')
    return df


def import_simplified(name='economic_regions.json'):
    read_path = os.path.join(script_dir, "../conditions/base_maps/", name)
    df = gpd.read_file(read_path)
    df = df.set_geometry('geometry')
    fr_cols = ['PRNAME', 'ERNAME']
    for splitcols in fr_cols:
        df[splitcols] = [x.split('/')[0].strip() for x in df[splitcols]]
    return df


def export_files(df, folder, name):
    write_path = os.path.join(script_dir, folder, name)
    df.to_file(write_path, driver='GeoJSON')
    print(folder+' done ', 'CRS: '+str(df.crs))


def conditions_on_map(df, shp, folder_name):
    shp = pd.merge(shp,
                   df,
                   how='inner',
                   left_on=['PRNAME', 'ERNAME'],
                   right_on=['Flat Province', 'id'])
    for delete in ['PRUID', 'ERUID', 'ERNAME', 'PRNAME']:
        del shp[delete]

    shp = shp[~shp.geometry.is_empty]
    shp = shp[shp.geometry.notna()]
    for numericCol in ['In Progress', 'Closed']:
        if numericCol in shp.columns:
            shp[numericCol] = shp[numericCol].fillna(0)

    df = df.fillna(0)
    return shp, df


def conditionMetaData(df, folder_name):

    def convert_to_int(df):
        df = df.replace({np.nan: 0})
        for col in ['In Progress', 'Closed']:
            try:
                df[col] = [int(x) for x in df[col]]
            except:
                None
        return df

    def addMissing(df):
        if 'In Progress' not in df.columns:
            df['In Progress'] = 0
        if 'Closed' not in df.columns:
            df['Closed'] = 0
        return df

    # df contains the condition data for the spcecific company
    meta = {}

    # get the summary stats for the boxes above the map
    status = df[['condition id', 'Condition Status', 'Location']].copy().reset_index(drop=True)
    status = status[status['Location'] != 'nan']
    del status['Location']
    status = status.drop_duplicates(subset=['condition id'])
    status = status.groupby(['Condition Status']).size().reset_index()
    status = pd.pivot_table(status, values=0, columns="Condition Status")
    status = addMissing(status)
    status = status.to_dict(orient='records')[0]
    df['Location'] = df['Location'].astype("object")
    notInMap = 0
    noLoc = {}
    for location, statusloc in zip(df['Location'], df['Condition Status']):
        if location == "nan":
            notInMap = notInMap+1
            if statusloc in noLoc:
                noLoc[statusloc] = noLoc[statusloc]+1
            else:
                noLoc[statusloc] = 1

    status['notOnMap'] = {"total": notInMap,
                          "status": noLoc}

    # get the date the data was pulled
    status['updated'] = date.today().strftime("%b %d, %Y")

    # get the current company name
    status['companyName'] = list(df['Company'])[0]
    meta['summary'] = status

    # once the status summary is calculated, blank locations and null locations can be removed
    df = df[df['Location'] != "nan"].copy().reset_index(drop=True)

    # get the unique project names sorted by number of open conditions
    project = df[['condition id', 'Short Project Name', 'id', 'Condition Status', 'Regdocs']].copy().reset_index(drop=True)
    project['Regdocs'] = project['Regdocs'].astype('object')
    project['Regdocs'] = project['Regdocs'].fillna('noRegdocs')
    project = project.groupby(['Short Project Name', 'id', 'Condition Status', 'Regdocs']).size().reset_index()
    project = pd.pivot_table(project,
                             values=0,
                             index=['Short Project Name', 'id', 'Regdocs'],
                             columns='Condition Status').reset_index()

    project['Regdocs'] = project['Regdocs'].replace('noRegdocs', np.nan)
    project = addMissing(project)

    project = project.sort_values(by=['In Progress', 'id'], ascending=False)
    project['In Progress'] = pd.to_numeric(project['In Progress'])
    # TOOD: replace nan with zero's in metadata, and cast all as int. This should reduce file size
    project = convert_to_int(project)
    project = project.to_dict(orient='records')
    meta['projects'] = project

    # get the unique project themes sorted by number of open conditions
    theme = df[['condition id', 'Theme(s)', 'id', 'Condition Status']].copy().reset_index(drop=True)
    theme = theme.groupby(['Theme(s)', 'id', 'Condition Status']).size().reset_index()
    theme = pd.pivot_table(theme,
                           values=0,
                           index=['Theme(s)', 'id'],
                           columns='Condition Status').reset_index()
    theme = addMissing(theme)
    theme = theme.sort_values(by=['In Progress', 'id'], ascending=False)
    # theme = theme.replace({np.nan: None})
    theme = convert_to_int(theme)
    theme = theme.to_dict(orient='records')
    meta['themes'] = theme

    df_all = df.copy()
    del df_all['Location']
    df_all = df_all.groupby(['Flat Province',
                             'id',
                             'Condition Status']).agg({
                                 'condition id': 'count',
                                 'Short Project Name': lambda x: list(x),
                                 'Theme(s)': lambda t: list(t)})

    for delete in ['Short Project Name', 'Theme(s)']:
        del df_all[delete]

    df_all = df_all.reset_index()
    df_all = pd.pivot_table(df_all,
                            values='condition id',
                            index=['Flat Province', 'id'],
                            columns='Condition Status').reset_index()

    return df_all, meta


def process_conditions(remote=False, nonStandard=True, company_names=False, companies=False, test=False):

    def add_links(df_c, df_links):
        l = {}
        for name, folder in zip(df_links['EnglishProjectName'], df_links['CS10FolderId']):
            l[name] = folder

        regdocs = []
        for proj in df_c['Project Name']:
            try:
                regdocs.append(l[proj])
            except KeyError:
                regdocs.append(np.nan)
        df_c['Regdocs'] = regdocs
        return df_c

    if remote:
        link = 'http://www.cer-rec.gc.ca/open/conditions/conditions.csv'
        print('downloading remote conditions file')
        df = pd.read_csv(link,
                         sep='\t',
                         lineterminator='\r',
                         encoding="UTF-16",
                         error_bad_lines=False)

    elif test:
        print('reading test conditions data')
        df = pd.read_csv('./raw_data/test_data/conditions.csv', encoding="UTF-16", sep='\t')
    else:
        print('reading local conditions data')
        # df = pd.read_csv("./raw_data/conditions.csv",
        #                  sep='\t',
        #                  lineterminator='\r',
        #                  encoding="UTF-16",
        #                  error_bad_lines=False)
        df = pd.read_csv('./raw_data/conditions.csv', encoding="UTF-16", sep='\t')

    for date_col in ['Effective Date', 'Issuance Date', 'Sunset Date']:
        df[date_col] = pd.to_datetime(df[date_col])

    if not nonStandard:
        # only include non-standard conditions
        df = df[df['Condition Type'] != 'Standard']

    df = normalize_text(df, ['Location', 'Short Project Name', 'Theme(s)'])
    delete_cols = ['Condition',
                   'Condition Phase',
                   'Instrument Activity',
                   'Condition Type',
                   'Condition Filing']

    for delete in delete_cols:
        del df[delete]

    for r in ['\n', '"']:
        df['Company'] = df['Company'].replace(r, '', regex=True)
    df['Company'] = [x.strip() for x in df['Company']]
    df['Condition Status'] = df['Condition Status'].astype('object')
    df['Condition Status'] = [str(x).strip() for x in df['Condition Status']]
    # preliminary processing
    df['Company'] = df['Company'].replace(company_rename())

    df = df[df['Short Project Name'] != "SAM/COM"].copy().reset_index(drop=True)
    df['Theme(s)'] = df['Theme(s)'].replace({"nan":
                                             "No theme specified"})

    regions_map = import_simplified()
    links = orca_regdocs_links()
    if company_names:
        print(get_company_names(df['Company']))

    if companies:  # used to set one company for testing
        company_files = companies
    else:
        company_files = ['NOVA Gas Transmission Ltd.',
                         'TransCanada PipeLines Limited',
                         'Enbridge Pipelines Inc.',
                         'Enbridge Pipelines (NW) Inc.',
                         'Express Pipeline Ltd.',
                         'Trans Mountain Pipeline ULC',
                         'Trans Quebec and Maritimes Pipeline Inc.',
                         'Trans-Northern Pipelines Inc.',
                         'TransCanada Keystone Pipeline GP Ltd.',
                         'Westcoast Energy Inc.',
                         'Alliance Pipeline Ltd.',
                         'PKM Cochin ULC',
                         'Foothills Pipe Lines Ltd.',
                         'Southern Lights Pipeline',
                         'Emera Brunswick Pipeline Company Ltd.',
                         'Many Islands Pipe Lines (Canada) Limited',
                         'Maritimes & Northeast Pipeline Management Ltd.',
                         'Vector Pipeline Limited Partnership',
                         'Plains Midstream Canada ULC',
                         'Enbridge Bakken Pipeline Company Inc.',
                         'Genesis Pipeline Canada Ltd.',
                         'Montreal Pipe Line Limited',
                         'Kingston Midstream Westspur Limited']

    for company in company_files:
        thisCompanyData = {}
        folder_name = company.replace(' ', '').replace('.', '')

        df_c = df[df['Company'] == company].copy().reset_index(drop=True)
        if not df_c.empty:
            df_c = add_links(df_c, links)
            df_c['condition id'] = [str(ins)+'_'+str(cond) for ins, cond in zip(df_c['Instrument Number'], df_c['Condition Number'])]
            expanded_locations = []
            for unique in df_c['condition id']:
                row = df_c[df_c['condition id'] == unique].copy().reset_index(drop=True)
                locations = [x.split(',') for x in row['Location']]
                for region in locations[0]:
                    regionProvince = region.strip().split('/')
                    row['id'] = regionProvince[0].strip()
                    row['Flat Province'] = regionProvince[-1].strip()
                    expanded_locations.append(row.copy())

            df_all = pd.concat(expanded_locations, axis=0, sort=False, ignore_index=True)
            # calculate metadata here
            dfmeta, meta = conditionMetaData(df_all, folder_name)
            thisCompanyData['meta'] = meta
            shp, mapMeta = conditions_on_map(dfmeta, regions_map, folder_name)

            thisCompanyData['regions'] = shp.to_json()
            thisCompanyData['mapMeta'] = mapMeta.to_dict(orient='records')
            if not test:
                with open('../conditions/company_data/'+folder_name+'.json', 'w') as fp:
                    json.dump(thisCompanyData, fp)
        else:
            meta = {"companyName": company}
            thisCompanyData = {'meta': {"companyName": company},
                               'regions': "{}",
                               'mapMeta': []}

            if not test:
                with open('../conditions/company_data/'+folder_name+'.json', 'w') as fp:
                    json.dump(thisCompanyData, fp)
        print('completed conditions: '+company)

    return df_c, shp, dfmeta, meta


if __name__ == "__main__":
    print('starting conditions...')
    # df = process_conditions(remote=False, companies=['NOVA Gas Transmission Ltd.'])
    df, regions, mapMeta, meta = process_conditions(remote=False)
    print('completed conditions!')

#%%
