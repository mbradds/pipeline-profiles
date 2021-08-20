from traffic import process_throughput
from conditions import process_conditions
from incidents import process_incidents
from oandm import process_oandm
from apportionment import process_apportionment
from remediation import process_remediation


if __name__ == "__main__":
    process_throughput(save=True, sql=True, commodity='gas', frequency='m')
    process_throughput(save=True, sql=True, commodity='oil', frequency='m')
    process_apportionment(sql=True, save=True)
    process_conditions(remote=True, save=True, sql=True)
    process_incidents(remote=True, test=False)
    process_oandm(remote=True, test=False)
    process_remediation(sql=True)
