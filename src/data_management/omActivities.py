import pandas as pd
from util import execute_sql
import os
script_dir = os.path.dirname(__file__)


def get_data(sql=False):
    if sql:
        df = execute_sql(path=script_dir, query_name='o_and_m.sql', db='dsql23cap')
        df.to_csv('raw_data/o_and_m.csv', index=False)
    else:
        df = pd.read_csv('raw_data/o_and_m.csv')
    return df


if __name__ == "__main__":
    print('starting o and m...')
    df = get_data(sql=True)
    print('completed o and m!')
