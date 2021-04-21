import pandas as pd
from util import execute_sql, normalize_dates, get_company_names, normalize_text, normalize_numeric
from traffic import get_data
import os
import json





if __name__ == "__main__":
    app = get_data(False, True, "apportionment.sql")