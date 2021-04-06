import canadaMap from "../../../conditions/base_maps/base_map.json";
import conditionsData from "../../../conditions/company_data/fr/Maritimes&NortheastPipelineManagementLtd.json";
import incidentData from "../../../incidents/company_data/fr/Maritimes&NortheastPipelineManagementLtd.json";
import trafficData from "../../../traffic/company_data/Maritimes&NortheastPipelineManagementLtd.json";
import { loadAllCharts } from "../../loadDashboards_fr.js";

const data = {
  canadaMap: canadaMap,
  conditionsData: conditionsData,
  incidentData: incidentData,
  trafficData: trafficData,
};

loadAllCharts(data);
