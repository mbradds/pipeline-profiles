from util import execute_sql
import pandas as pd
import json
import os
from util import saveJson, normalize_text, get_company_names
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
    df = df[~df.geometry.is_empty]
    df = df[df.geometry.notna()]
    write_path = os.path.join(script_dir, folder, name)
    df.to_file(write_path, driver='GeoJSON')
    print('exported: '+name+' to geojson', 'with CRS: '+str(df.crs))


def conditions_on_map(df, shp, folder_name):
    shp = pd.merge(shp,
                   df,
                   how='inner',
                   left_on=['PRNAME', 'ERNAME'],
                   right_on=['Flat Province', 'id'])
    for delete in ['PRUID', 'ERUID', 'ERNAME', 'PRNAME']:
        del shp[delete]

    # shp = shp[shp['id'] == 'Calgary']
    export_files(shp, folder="../conditions/"+folder_name, name='economicRegions.json')
    saveJson(df, os.path.join('../conditions/'+folder_name, 'mapMetadata.json'))
    return shp


def metadata(df, folder_name):

    def convert_to_int(df):
        df = df.replace({np.nan: 0})
        for col in ['In Progress', 'Closed']:
            try:
                df[col] = [int(x) for x in df[col]]
            except:
                None
        return df
    # df contains the condition data for the spcecific company
    meta = {}

    # get the summary stats for the boxes above the map
    status = df[['condition id', 'Condition Status']].copy()
    status = status.drop_duplicates(subset=['condition id'])
    status = status.groupby(['Condition Status']).size().reset_index()
    status = pd.pivot_table(status, values=0, columns="Condition Status")
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
    df = df[df['Location'] != "nan"]

    # get the unique project names sorted by number of open conditions
    project = df[['condition id', 'Short Project Name', 'id', 'Condition Status', 'Regdocs']].copy()
    project = project.groupby(['Short Project Name', 'id', 'Condition Status', 'Regdocs']).size().reset_index()
    project = pd.pivot_table(project,
                             values=0,
                             index=['Short Project Name', 'id', 'Regdocs'],
                             columns='Condition Status').reset_index()

    project = project.sort_values(by=['In Progress', 'id'], ascending=False)
    project['In Progress'] = pd.to_numeric(project['In Progress'])
    # TOOD: replace nan with zero's in metadata, and cast all as int. This should reduce file size
    project = convert_to_int(project)
    project = project.to_dict(orient='records')
    meta['projects'] = project

    # get the unique project themes sorted by number of open conditions
    theme = df[['condition id', 'Theme(s)', 'id', 'Condition Status']].copy()
    theme = theme.groupby(['Theme(s)', 'id', 'Condition Status']).size().reset_index()
    theme = pd.pivot_table(theme,
                           values=0,
                           index=['Theme(s)', 'id'],
                           columns='Condition Status').reset_index()

    theme = theme.sort_values(by=['In Progress', 'id'], ascending=False)
    # theme = theme.replace({np.nan: None})
    theme = convert_to_int(theme)
    theme = theme.to_dict(orient='records')
    meta['themes'] = theme
    # save the metadata
    with open('../conditions/'+folder_name+'/summaryMetadata.json', 'w') as fp:
        json.dump(meta, fp)

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

    return df_all


def process_conditions(remote=False, nonStandard=True, company_names=False):

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
        print('downloading remote file')
        df = pd.read_csv(link,
                         sep='\t',
                         lineterminator='\r',
                         encoding="UTF-16",
                         error_bad_lines=False)
    else:
        print('reading local file')
        df = pd.read_csv("./raw_data/conditions.csv",
                         sep='\t',
                         lineterminator='\r',
                         encoding="UTF-16",
                         error_bad_lines=False)

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

    df = df[df['Short Project Name'] != "SAM/COM"]
    df['Theme(s)'] = df['Theme(s)'].replace({"nan":
                                             "No theme specified"})

    regions_map = import_simplified()
    links = orca_regdocs_links()
    if company_names:
        print(get_company_names(df['Company']))

    company_files = ['NOVA Gas Transmission Ltd.',
                     'TransCanada PipeLines Limited',
                     'Enbridge Pipelines Inc.']

    for company in company_files:
        folder_name = company.replace(' ', '').replace('.', '')
        if not os.path.exists("../conditions/"+folder_name):
            os.makedirs("../conditions/"+folder_name)

        df_c = df[df['Company'] == company].copy()
        df_c = add_links(df_c, links)
        df_c['condition id'] = [str(ins)+'_'+str(cond) for ins, cond in zip(df_c['Instrument Number'], df_c['Condition Number'])]
        expanded_locations = []
        for unique in df_c['condition id']:
            row = df_c[df_c['condition id'] == unique].copy()
            locations = [x.split(',') for x in row['Location']]
            for region in locations[0]:
                regionProvince = region.strip().split('/')
                row['id'] = regionProvince[0].strip()
                row['Flat Province'] = regionProvince[-1].strip()
                expanded_locations.append(row.copy())
        df_all = pd.concat(expanded_locations, axis=0, sort=False, ignore_index=True)
        # calculate metadata here
        meta = metadata(df_all, folder_name)
        shp = conditions_on_map(meta, regions_map, folder_name)

    return shp, meta


if __name__ == "__main__":
    print('starting conditions...')
    df, meta = process_conditions(remote=False, company_names=False)
    print('completed conditions!')
