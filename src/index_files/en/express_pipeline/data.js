import canadaMap from "../../../conditions/base_maps/base_map.json";
import conditionsData from "../../../conditions/company_data/en/ExpressPipelineLtd.json";
import incidentData from "../../../incidents/company_data/en/ExpressPipelineLtd.json";
import trafficData from "../../../traffic/company_data/ExpressPipelineLtd.json";
import apportionData from "../../../apportionment/company_data/ExpressPipelineLtd.json";
import { loadAllCharts } from "../../loadDashboards_en";

const data = {
  canadaMap,
  conditionsData,
  incidentData,
  trafficData,
  apportionData,
};

loadAllCharts(data);
