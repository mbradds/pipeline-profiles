import pandas as pd
from util import normalize_text, normalize_numeric, conversion, get_company_list, get_data
import os
import json
import dateutil.relativedelta
script_dir = os.path.dirname(__file__)


def saveTollsData(sql=True):
    df = get_data(script_dir, "tolls.sql", db="PipelineInformation", sql=sql)
    return df


if __name__ == "__main__":
    print("starting tolls...")
    df = saveTollsData(True)
    print("done tolls")
