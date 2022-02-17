import pandas as pd
import numpy as np
import os
import json
import datetime
from util import set_cwd_to_script, get_data, normalize_dates
set_cwd_to_script()


def date_converter(o):
    if isinstance(o, datetime.datetime):
        return o.__str__()
    
def format_it_st(df):
    df = normalize_dates(df, ["Date"])
    df = df[~df["Total Contracted Quantity (GJ)"].isnull()]
    df = df.sort_values(by=["Path", "Date"]).reset_index(drop=True)
    df = df.rename(columns={"Date": "d",
                            "Path": "p",
                            "Total Contracted Quantity (GJ)": "v",
                            "Folder Link": "f",
                            "Download Link": "l"})
    return df
    
def get_revenue_data(sql):
    df_disc = get_data(os.getcwd(), "tcpl_discretionary.sql", "PipelineInformation", sql)
    df_itbf = get_data(os.getcwd(), "tcpl_it_bidfloor.sql", "PipelineInformation", sql)
    df_stft = get_data(os.getcwd(), "tcpl_stft_bidfloor.sql", "PipelineInformation", sql)
    return df_disc, df_itbf, df_stft


def process_revenues(sql, save):
    df_disc, df_itbf, df_stft = get_revenue_data(sql)
    
    # format discretionary revenue
    df_disc = df_disc[df_disc["Particulars"] != "Total"]
    df_disc = df_disc[~df_disc["Revenue ($000s)"].isnull()]
    df_disc = normalize_dates(df_disc, ["Date"])
    df_disc = df_disc.sort_values(by=["Particulars", "Date"]).reset_index(drop=True)
    df_disc = df_disc.rename(columns={"Date": "d",
                                      "Revenue ($000s)": "v",
                                      "Particulars": "p",
                                      "Download Link": "l"})
    # format it
    df_itbf = format_it_st(df_itbf)
    
    # foramt st
    df_stft = format_it_st(df_stft)
    
    if save:
        with open('../data_output/tcpl_revenues/discretionary.json', 'w') as fp:
            json.dump(df_disc.to_dict(orient="records"), fp, default=date_converter)
        with open('../data_output/tcpl_revenues/it.json', 'w') as fp:
            json.dump(df_itbf.to_dict(orient="records"), fp, default=date_converter)
        with open('../data_output/tcpl_revenues/st.json', 'w') as fp:
                json.dump(df_stft.to_dict(orient="records"), fp, default=date_converter)
        
    return df_disc, df_itbf, df_stft
    


if __name__ == "__main__":
    df_disc, df_itbf, df_stft = process_revenues(sql=False, save=True)