import pandas as pd
import os
from util import set_cwd_to_script, get_data
set_cwd_to_script()


def get_revenue_data(sql):
    df_disc = get_data(os.getcwd(), "tcpl_discretionary.sql", "PipelineInformation", sql)
    df_itbf = get_data(os.getcwd(), "tcpl_it_bidfloor.sql", "PipelineInformation", sql)
    df_stft = get_data(os.getcwd(), "tcpl_stft_bidfloor.sql", "PipelineInformation", sql)
    return df_disc, df_itbf, df_stft


if __name__ == "__main__":
    df_disc, df_itbf, df_stft = get_revenue_data(False)