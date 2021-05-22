import canadaMap from "../../../conditions/base_maps/base_map.json";
import conditionsData from "../../../conditions/company_data/en/NOVAGasTransmissionLtd.json";
import incidentData from "../../../incidents/company_data/NOVAGasTransmissionLtd.json";
import trafficData from "../../../traffic/company_data/NOVAGasTransmissionLtd.json";
import apportionData from "../../../apportionment/company_data/NOVAGasTransmissionLtd.json";
import oandmData from "../../../oandm/company_data/NOVAGasTransmissionLtd.json";
import { loadAllCharts } from "../../loadDashboards_en";

const data = {
  canadaMap,
  conditionsData,
  incidentData,
  trafficData,
  apportionData,
  oandmData,
};

loadAllCharts(data);
