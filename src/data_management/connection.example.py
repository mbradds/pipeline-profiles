import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy import MetaData
import sqlalchemy

def cer_connection(db='EnergyData'):
    if db == 'EnergyData':
        conn_str = 'ENTER CONNECTION STRING'
    elif db == 'tsql23cap':
        conn_str = 'ENTER CONNECTION STRING'
    elif db == 'dsql23cap':
        conn_str = 'ENTER CONNECTION STRING'
    else:
        print('enter a valid db')
        
    engine = create_engine(conn_str)
    conn = engine.connect()
    return(conn,engine)
    
if __name__ == "__main__":
    
    conn,engine = cer_connection()
    table_list = engine.table_names() 
    df = pd.DataFrame(table_list,columns=['Cersei Tables'])
    df['Total Number of Tables'] = len(table_list)
    df.to_csv('cersei_table.csv',index=False)
    conn.close()