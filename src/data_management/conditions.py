from util import execute_sql
import pandas as pd
import json
import os
from util import normalize_text, get_company_names, company_rename, get_company_list, prepareIds, applySystemId
import geopandas as gpd
from datetime import date
import numpy as np
import ssl
ssl._create_default_https_context = ssl._create_unverified_context
script_dir = os.path.dirname(__file__)


def getSql(sql=False, query='projects_regdocs.sql'):
    csvName = query.replace(".sql", ".csv")
    if sql:
        print('reading sql '+query)
        df = execute_sql(os.path.join(script_dir, "queries"), query)
        df.to_csv('raw_data/'+csvName, index=False)
    else:
        print('reading local csv '+csvName)
        df = pd.read_csv('raw_data/'+csvName)
    return df


def import_simplified(replace, name='economic_regions.json'):
    read_path = os.path.join(script_dir, "../data_output/conditions/base_maps/", name)
    df = gpd.read_file(read_path)
    df = df.set_geometry('geometry')
    fr_cols = ['PRNAME', 'ERNAME']
    for splitcols in fr_cols:
        df[splitcols] = [x.split('/') for x in df[splitcols]]
        df[splitcols+'_en'] = [x[0].strip() for x in df[splitcols]]
        df[splitcols+'_fr'] = [x[0].strip() if len(x) == 1 else x[-1].strip() for x in df[splitcols]]

    for delete in ['PRNAME', 'ERNAME', 'PRUID', 'ERUID', 'PRNAME_fr', 'ERNAME_fr']:
        del df[delete]

    df['region_id'] = [er.strip()+'/'+pr.strip() for er, pr in zip(df['ERNAME_en'],
                                                                   df['PRNAME_en'])]

    df['region_id'] = df['region_id'].replace(replace)
    df = df[df['region_id'].isin(replace.values())]
    del df['ERNAME_en']
    del df['PRNAME_en']
    return df


def export_files(df, folder, name):
    write_path = os.path.join(script_dir, folder, name)
    df.to_file(write_path, driver='GeoJSON')
    print(folder+' done ', 'CRS: '+str(df.crs))


def conditions_on_map(df, shp, folder_name):
    shp = pd.merge(shp,
                   df,
                   how='inner',
                   left_on=['region_id'],
                   right_on=['id'])

    del shp['region_id']
    shp = shp[~shp.geometry.is_empty]
    shp = shp[shp.geometry.notna()]
    for numericCol in ['In Progress', 'Closed']:
        if numericCol in shp.columns:
            shp[numericCol] = shp[numericCol].fillna(0)

    # df becomes map metadata
    df = df.fillna(0)
    for cols in [["Closed", "c"], ["In Progress", "i"]]:
        if cols[0] in df:
            # df = df.rename(columns={cols[0]: cols[1]})
            df[cols[0]] = [int(x) for x in df[cols[0]]]
    return shp, df


def conditionMetaData(df, folder_name, projectNames):

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
    status['loc'] = ['no' if '-1' in x else 'yes' for x in status['Location']]
    status = status[status['loc'] != 'no']
    del status['Location']
    del status['loc']
    status = status.drop_duplicates(subset=['condition id'])
    status = status.groupby(['Condition Status']).size().reset_index()
    status = pd.pivot_table(status, values=0, columns="Condition Status")
    status = addMissing(status)
    status = status.to_dict(orient='records')[0]
    df['Location'] = df['Location'].astype("object")
    notInMap = 0
    noLoc = {}
    for location, statusloc in zip(df['Location'], df['Condition Status']):
        if "-1" in location:
            notInMap = notInMap+1
            if statusloc in noLoc:
                noLoc[statusloc] = noLoc[statusloc]+1
            else:
                noLoc[statusloc] = 1

    status['notOnMap'] = {"total": notInMap,
                          "status": noLoc}

    # get the date the data was pulled
    today = date.today()
    status['updated'] = [today.year, today.month-1, today.day]
    # status['updated'] = [2021, 2, 19]  # override todays date with custom date

    # get the current company name
    status['companyName'] = list(df['Company'])[0]
    meta['summary'] = status

    # once the status summary is calculated, blank locations and null locations can be removed
    df = df[df['id'] != -1].copy().reset_index(drop=True)

    # get the unique project names sorted by number of open conditions
    project = df[['condition id', 'Short Project Name', 'id', 'Condition Status', 'Regdocs']].copy().reset_index(drop=True)
    # add the project name lookup to metadata
    thisCompanyProjects = list(set(project["Short Project Name"]))
    thisLookup = projectNames[projectNames['id'].isin(thisCompanyProjects)]
    meta['projectLookup'] = prepareIds(thisLookup)
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

    project = convert_to_int(project)
    project['Regdocs'] = [int(x) for x in project['Regdocs']]
    # optimize json size
    project = project.rename(columns={"Short Project Name": "n"})
    project['v'] = [[inProgress, closed, regdocs] for inProgress, closed, regdocs in zip(project['In Progress'],
                                                                                         project['Closed'],
                                                                                         project['Regdocs'])]
    for delete in ['In Progress', 'Closed', 'Regdocs']:
        del project[delete]
    project = project.to_dict(orient='records')
    meta['projects'] = project

    # get the unique project themes sorted by number of open conditions
    theme = df[['condition id', 'Theme(s)', 'id', 'Condition Status']].copy().reset_index(drop=True)
    theme['Theme(s)'] = [[str(i) for i in x] for x in theme['Theme(s)']]
    theme['Theme(s)'] = [', '.join(x) for x in theme['Theme(s)']]
    theme = theme.groupby(['Theme(s)', 'id', 'Condition Status']).size().reset_index()
    theme = pd.pivot_table(theme,
                           values=0,
                           index=['Theme(s)', 'id'],
                           columns='Condition Status').reset_index()
    theme = addMissing(theme)
    theme = theme.sort_values(by=['In Progress', 'id'], ascending=False)
    # optimize json size
    theme = convert_to_int(theme)
    theme = theme.rename(columns={"Theme(s)": "t"})
    # TODO: do the id's need to be strings?
    theme['t'] = [[str(i.strip()) for i in x.split(',')] for x in theme['t']]
    theme["v"] = [[inProgress, closed] for inProgress, closed in zip(theme['In Progress'],
                                                                     theme['Closed'])]
    for delete in ['In Progress', 'Closed']:
        del theme[delete]
    theme = theme.to_dict(orient='records')
    meta['themes'] = theme

    df_all = df.copy()
    del df_all['Location']
    df_all = df_all.groupby(['id',
                             'Condition Status']).agg({
                                 'condition id': 'count',
                                 'Short Project Name': lambda x: list(x),
                                 'Theme(s)': lambda t: list(t)})

    for delete in ['Short Project Name', 'Theme(s)']:
        del df_all[delete]

    df_all = df_all.reset_index()
    df_all = pd.pivot_table(df_all,
                            values='condition id',
                            index=['id'],
                            columns='Condition Status').reset_index()

    return df_all, meta


def add_links(df, sql):
    df_links = getSql(sql)
    l = {}
    for name, folder in zip(df_links['EnglishProjectName'], df_links['CS10FolderId']):
        l[name] = folder

    regdocs = []
    for proj in df['Project Name']:
        try:
            regdocs.append(l[proj])
        except KeyError:
            regdocs.append(np.nan)
    df['Regdocs'] = regdocs
    # calculate warning for number of projects with no regdocs link
    df_no_link = df[~df['Regdocs'].notnull()].copy().reset_index(drop=True)
    no_link_proj = df_no_link['Short Project Name'].nunique()
    all_proj = df['Short Project Name'].nunique()
    pct = round((no_link_proj/all_proj)*100, 1)
    print("There are "+str(no_link_proj) +" projects without a regdocs link (" +str(pct) +"% of all projects)")
    return df


def idify_conditions(df, sql):

    def listId(df, column, toReplace):
        newThemes = []
        for t in df[column]:
            if "," in t:
                t = [x.strip() for x in t.split(",")]
                t = [toReplace[x] for x in t]
                newThemes.append(t)
            else:
                try:
                    newThemes.append([toReplace[t.strip()]])
                except:
                    newThemes.append(["-1"])

        df[column] = newThemes
        return df

    projects = getSql(sql, "conditionProjects.sql")
    themes = getSql(sql, "conditionThemes.sql")
    regions = getSql(sql, "conditionRegions.sql")

    # fix the Northeast db error
    regions = regions.reset_index()
    del regions['id']
    regions = regions.rename(columns={"index": "id"})

    for ids in [projects, themes, regions]:
        ids['id'] = [str(x) for x in ids['id']]

    projectReplace = {value: key for key, value in zip(projects['id'],
                                                       projects['e'])}
    themeReplace = {value: key for key, value in zip(themes['id'],
                                                     themes['e'])}
    regionReplace = {value: key for key, value in zip(regions['id'],
                                                      regions['e'])}

    df['Short Project Name'] = df['Short Project Name'].replace(projectReplace)

    df = listId(df, "Theme(s)", themeReplace)
    df["Location"] = [x.replace(" /", "/").replace("/ ", "/") for x in df["Location"]]
    df = listId(df, "Location", regionReplace)

    # save themes and regions for import into front end
    files = [[themes, "themes"], [regions, "regions"]]
    for file in files:
        idSave = prepareIds(file[0])
        with open('../data_output/conditions/metadata/'+file[1]+'.json', 'w') as fp:
            json.dump(idSave, fp)

    return df, regionReplace, projects


def process_conditions(remote=False,
                       sql=False,
                       nonStandard=True,
                       company_names=False,
                       companies=False,
                       test=False,
                       save=True):
    if remote:
        print('downloading remote conditions file')
        link = 'http://www.cer-rec.gc.ca/open/conditions/conditions.csv'
        df = pd.read_csv(link,
                         # sep='\t',
                         # lineterminator='\r',
                         encoding="latin-1",
                         error_bad_lines=True)
        df = normalize_text(df, ['Location', 'Short Project Name', 'Theme(s)'])

    elif test:
        print('reading test conditions data')
        df = pd.read_csv('./raw_data/test_data/conditions.csv', encoding="UTF-16", sep='\t')
        df = normalize_text(df, ['Location', 'Short Project Name', 'Theme(s)'])
    else:
        print('reading local conditions data')
        df = pd.read_csv('./raw_data/conditions_en.csv', encoding="UTF-16", sep='\t')
        df = normalize_text(df, ['Location', 'Short Project Name', 'Theme(s)'])

    for date_col in ['Effective Date', 'Issuance Date', 'Sunset Date']:
        df[date_col] = pd.to_datetime(df[date_col])

    if not nonStandard:
        # only include non-standard conditions
        df = df[df['Condition Type'] != 'Standard']

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
    df = applySystemId(df, "Company")

    df = df[df['Short Project Name'] != "SAM/COM"].copy().reset_index(drop=True)

    df = add_links(df, sql)
    if company_names:
        print(get_company_names(df['Company']))

    df, regionReplace, projectNames = idify_conditions(df, sql)
    regions_map = import_simplified(regionReplace)

    if companies:
        company_files = companies
    else:
        company_files = get_company_list("all")

    for company in company_files:
        thisCompanyData = {}
        folder_name = company.replace(' ', '').replace('.', '')
        df_c = df[df['Company'] == company].copy().reset_index(drop=True)
        if not df_c.empty:
            df_c['condition id'] = [str(ins)+'_'+str(cond) for ins, cond in zip(df_c['Instrument Number'], df_c['Condition Number'])]
            expanded_locations = []
            for unique in df_c['condition id']:
                row = df_c[df_c['condition id'] == unique].copy().reset_index(drop=True)
                for region in list(row['Location'])[0]:
                    row['id'] = region
                    expanded_locations.append(row.copy())

            df_all = pd.concat(expanded_locations, axis=0, sort=False, ignore_index=True)
            # calculate metadata here
            dfmeta, meta = conditionMetaData(df_all, folder_name, projectNames)
            meta["build"] = True
            thisCompanyData['meta'] = meta
            shp, mapMeta = conditions_on_map(dfmeta, regions_map, folder_name)

            thisCompanyData['regions'] = shp.to_json()
            thisCompanyData['mapMeta'] = mapMeta.to_dict(orient='records')
            if not test and save:
                with open('../data_output/conditions/'+folder_name+'.json', 'w') as fp:
                    json.dump(thisCompanyData, fp)
                print('completed+saved: '+company)
        else:
            meta = {"companyName": company}
            thisCompanyData = {'meta': {"companyName": company,
                                        "build": False},
                               'regions': "{}",
                               'mapMeta': []}

            if not test and save:
                with open('../data_output/conditions/'+folder_name+'.json', 'w') as fp:
                    json.dump(thisCompanyData, fp)
                print('completed+saved: '+company)

    return df_c, shp, dfmeta, meta


if __name__ == "__main__":
    print('starting conditions...')
    df, regions, mapMeta, meta = process_conditions(remote=True, save=True, sql=True)
    print('completed conditions!')
