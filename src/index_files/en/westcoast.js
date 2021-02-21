console.time(`chart loading`);
import { generalTheme } from "../../modules/themes.js";
import ieWarn from "ie-gang";
// conditions
import econRegions from "../../conditions/WestcoastEnergyInc/economicRegions.json";
import canadaMap from "../../conditions/base_maps/base_map.json";
import mapMetaData from "../../conditions/WestcoastEnergyInc/mapMetadata.json";
import metaConditions from "../../conditions/WestcoastEnergyInc/summaryMetadata.json";
import { mainConditions } from "../../conditions/conditionsDashboard.js";
// incidents
import incidentData from "../../incidents/WestcoastEnergyInc/incidents_map.json";
import metaIncidents from "../../incidents/WestcoastEnergyInc/summaryMetadata.json";
import { mainIncidents } from "../../incidents/incidentsDashboard.js";
// language
import { englishDashboard } from "../../modules/langEnglish.js";
// load dashboards
import { loadAllCharts } from "../loadDashboards.js";

let warningParams = {
  message:
    "We noticed you are using Internet Explorer. Please consider using a different browser for a better experience on this page.",
  type: "alert",
  title: "Old Browser Warning",
  applyIE: false,
};

ieWarn(warningParams);
generalTheme();

const arrayOfCharts = [
  mainConditions(
    econRegions,
    canadaMap,
    mapMetaData,
    metaConditions,
    englishDashboard.conditions
  ),
  mainIncidents(incidentData, metaIncidents, englishDashboard.incidents),
];

loadAllCharts(arrayOfCharts);
