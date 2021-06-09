import canadaMap from "../../../conditions/base_maps/base_map.json";
import conditionsData from "../../../conditions/company_data/TransCanadaKeystonePipelineGPLtd.json";
import incidentData from "../../../incidents/company_data/TransCanadaKeystonePipelineGPLtd.json";
import trafficData from "../../../traffic/company_data/TransCanadaKeystonePipelineGPLtd.json";
import apportionData from "../../../apportionment/company_data/TransCanadaKeystonePipelineGPLtd.json";
import oandmData from "../../../oandm/company_data/TransCanadaKeystonePipelineGPLtd.json";
import remediationData from "../../../remediation/company_data/TransCanadaKeystonePipelineGPLtd.json";
import { loadAllCharts } from "../../loadDashboards_fr";

const data = {
  canadaMap,
  conditionsData,
  incidentData,
  trafficData,
  apportionData,
  oandmData,
  remediationData,
};

loadAllCharts(data);
