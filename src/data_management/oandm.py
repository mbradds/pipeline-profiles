import pandas as pd
from util import get_company_names, company_rename, most_common, strip_cols
import ssl
import json
ssl._create_default_https_context = ssl._create_unverified_context

'''
ideas:
    -number of days aggregated between start and end date highlighted
    -total number of integrity digs highlighted
    -top 3 nearest populated centers highlighted
    -total land needed relative to something

'''


def process_oandm(remote=False, companies=False, test=False, lang='en'):

    if remote:
        if lang == 'en':
            link = "https://can01.safelinks.protection.outlook.com/?url=https%3A%2F%2Fwww.cer-rec.gc.ca%2Fopen%2Foperations%2Foperation-and-maintenance-activity.csv&data=04%7C01%7CMichelle.Shabits%40cer-rec.gc.ca%7Cbbc3fece7b3a439e253908d8f9ec4eab%7C56e9b8d38a3549abbdfc27de59608f01%7C0%7C0%7C637534140608125634%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C1000&sdata=HvG6KtuvEzJiNy4CZ4OyplKnfx2Zk5sPjUNNutoohic%3D&reserved=0"
        else:
            link = "https://can01.safelinks.protection.outlook.com/?url=https%3A%2F%2Fwww.cer-rec.gc.ca%2Fouvert%2Foperations%2Factivites-d-exploitation-et-d-entretien.csv&data=04%7C01%7CMichelle.Shabits%40cer-rec.gc.ca%7Cbbc3fece7b3a439e253908d8f9ec4eab%7C56e9b8d38a3549abbdfc27de59608f01%7C0%7C0%7C637534140608175607%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C1000&sdata=0NRT6o0XbRNw7ipBj3wjIyCujF4NjZF8HQHqfBBF%2B0M%3D&reserved=0"

        print('downloading remote oandm file')
        df = pd.read_csv(link,
                         skiprows=0,
                         encoding="latin-1",
                         engine="python",
                         error_bad_lines=False)

        df.to_csv("./raw_data/oandm_"+lang+".csv", index=False)
    elif test:
        print('reading test oandm file')
        if lang == 'en':
            path = "./raw_data/test_data/oandm_en.csv"

        else:
            path = "./raw_data/test_data/oandm_fr.csv"

        df = pd.read_csv(path,
                         skiprows=0,
                         encoding="utf-8",
                         error_bad_lines=False)

    else:
        print('reading local oandm file')
        if lang == 'en':
            path = "./raw_data/oandm_en.csv"

            encoding = "utf-8"
        else:
            print('starting french incidents...')
            path = "./raw_data/oandm_fr.csv"
            encoding = "utf-8-sig"

        df = pd.read_csv(path,
                         skiprows=0,
                         encoding=encoding,
                         error_bad_lines=False)

    df = strip_cols(df)

    df = df.rename(columns={x: x.replace("\xa0", " ") for x in df.columns})
    # Event Number and nearest populated center should be deleted later
    # New Land Area Needed is probably the total land
    for delete in ['Company Address',
                   'Company City',
                   'Company Postal Code',
                   'Circumstance(s)',
                   'Result Of A Class Location Change',
                   'Distance To Closest Building',
                   'Event Creation Date',
                   'Submission Date',
                   'Pipeline Name',
                   'Pipeline Outside Diameter',
                   'Pipeline Length',
                   'Commodity Carried',
                   'Facility Name',
                   'Facility Type',
                   'New Permanent Land Needed',
                   'Activity Acquiring New Private Land',
                   'Activity Acquiring New Land Under Compliance',
                   'Land Within Critical Habitat',
                   'New Temporary Land Needed',
                   'Provincial and federal authorities been consulted',
                   'Activity Using Navigable Water',
                   'Activity Following DFO Fish Measures For In Stream Work',
                   'Navigable Water Frozen Or Dry',
                   'Navigable Water Activity Meeting Transport Canada Minor Works And Waters Order']:
        del df[delete]

        # deal with dates
        for dateCol in df.columns:
            if "date" in dateCol.lower():
                df[dateCol] = pd.to_datetime(df[dateCol])
    print(df.dtypes)
    return df


if __name__ == '__main__':
    print('starting oandm...')
    df = process_oandm(remote=False, test=False, lang='en')
    # df = process_oandm(remote=False, test=False, lang='fr')
    print('completed oandm!')