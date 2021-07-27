import pandas as pd
from sqlalchemy import create_engine
import json


def getString(db):
    try:
        with open('connection_strings.json') as f:
            strings = json.load(f)
            return strings[db]
    except:
        return ""


def cer_connection(db='EnergyData'):
    conn_str = getString(db)
    engine = create_engine(conn_str)
    conn = engine.connect()
    return conn, engine


if __name__ == "__main__":

    conn, engine = cer_connection()
    table_list = engine.table_names()
    df = pd.DataFrame(table_list, columns=['Cersei Tables'])
    df['Total Number of Tables'] = len(table_list)
    # df.to_csv('cersei_table.csv', index=False)
    conn.close()
