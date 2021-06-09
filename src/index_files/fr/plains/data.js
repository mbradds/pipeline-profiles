import canadaMap from "../../../conditions/base_maps/base_map.json";
import conditionsData from "../../../conditions/company_data/fr/PlainsMidstreamCanadaULC.json";
import incidentData from "../../../incidents/company_data/PlainsMidstreamCanadaULC.json";
import trafficData from "../../../traffic/company_data/PlainsMidstreamCanadaULC.json";
import apportionData from "../../../apportionment/company_data/PlainsMidstreamCanadaULC.json";
// import oandmData from "../../../oandm/company_data/PlainsMidstreamCanadaULC.json";
// import remediationData from "../../../remediation/company_data/PlainsMidstreamCanadaULC.json";
import { loadAllCharts } from "../../loadDashboards_fr";

const data = {
  canadaMap,
  conditionsData,
  incidentData,
  trafficData,
  apportionData,
  // oandmData,
  // remediationData,
};

loadAllCharts(data, true);
