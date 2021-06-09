import canadaMap from "../../../conditions/base_maps/base_map.json";
import conditionsData from "../../../conditions/company_data/en/AlliancePipelineLtd.json";
import incidentData from "../../../incidents/company_data/AlliancePipelineLtd.json";
import trafficData from "../../../traffic/company_data/AlliancePipelineLtd.json";
import apportionData from "../../../apportionment/company_data/AlliancePipelineLtd.json";
// import oandmData from "../../../oandm/company_data/AlliancePipelineLtd.json";
// import remediationData from "../../../remediation/company_data/AlliancePipelineLtd.json";
import { loadAllCharts } from "../../loadDashboards_en";

const data = {
  canadaMap,
  conditionsData,
  incidentData,
  trafficData,
  apportionData,
  // oandmData,
  // remediationData,
};

loadAllCharts(data);
