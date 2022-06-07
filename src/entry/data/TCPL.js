import canadaMap from "../../data_output/conditions/base_maps/base_map.json";
import conditionsData from "../../data_output/conditions/TCPL.json";
import incidentData from "../../data_output/incidents/TCPL.json";
import trafficData from "../../data_output/traffic/TCPL.json";
import apportionData from "../../data_output/apportionment/TCPL.json";
import tollsData from "../../data_output/tolls/TCPL.json";
import oandmData from "../../data_output/oandm/TCPL.json";
import remediationData from "../../data_output/remediation/TCPL.json";
import discRevenue from "../../data_output/tcpl_revenues/discretionary.json";
import itQuantity from "../../data_output/tcpl_revenues/it.json";
import stQuantity from "../../data_output/tcpl_revenues/st.json";
import uaData from "../../data_output/unauthorized_activities/TCPL.json";

export const data = {
  canadaMap,
  conditionsData,
  incidentData,
  trafficData,
  apportionData,
  tollsData,
  oandmData,
  remediationData,
  tcplRevenues: { discRevenue, itQuantity, stQuantity },
  uaData,
};
