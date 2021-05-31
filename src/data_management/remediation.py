import pandas as pd
from util import execute_sql
import os
script_dir = os.path.dirname(__file__)

'''
TODO:
    - create general purpose get_data() function and add to util.py

'''


def get_data(sql=False, query="remediation.sql"):
    csvName = query.split(".")[0]+".csv"
    if sql:
        print('reading SQL data')
        df = execute_sql(path=os.path.join(script_dir, "queries"), query_name=query, db='dsql23cap')
        df.to_csv('raw_data/'+csvName, index=False)
        
    else:
        print('reading local '+query.split(".")[0])
        df = pd.read_csv('raw_data/'+csvName, encoding='utf-8')
    
    return df



if __name__ == "__main__":
    df = get_data(False)

