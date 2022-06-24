from util import get_pipeline_ids
from traffic import combined_traffic
from conditions import process_conditions
from incidents import process_incidents
from oandm import process_oandm
from apportionment import process_apportionment
from remediation import process_remediation
from tolls import process_tolls


if __name__ == "__main__":
    # get_pipeline_ids(sql=True)
    # combined_traffic(save=True, sql=True)
    # process_apportionment(sql=True, save=True)
    # process_conditions(remote=True, save=True, sql=True)
    # process_incidents(remote=True, test=False)
    # process_oandm(remote=True, test=False)
    # process_remediation(sql=True, remote=True, save=True, test=False)
    process_tolls(sql=True)
