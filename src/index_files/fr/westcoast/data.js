import canadaMap from "../../../conditions/base_maps/base_map.json";
import conditionsData from "../../../conditions/company_data/fr/WestcoastEnergyInc.json";
import incidentData from "../../../incidents/company_data/WestcoastEnergyInc.json";
import trafficData from "../../../traffic/company_data/WestcoastEnergyInc.json";
import apportionData from "../../../apportionment/company_data/WestcoastEnergyInc.json";
import oandmData from "../../../oandm/company_data/WestcoastEnergyInc.json";
import { loadAllCharts } from "../../loadDashboards_fr";

const data = {
  canadaMap,
  conditionsData,
  incidentData,
  trafficData,
  apportionData,
  oandmData,
};

loadAllCharts(data);
