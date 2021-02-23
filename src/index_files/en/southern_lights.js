console.time(`chart loading`);
import { generalTheme } from "../../modules/themes.js";
// conditions
import canadaMap from "../../conditions/base_maps/base_map.json";
import conditionsData from "../../conditions/company_data/SouthernLightsPipeline.json";
import { mainConditions } from "../../conditions/conditionsDashboard.js";
// incidents
import incidentData from "../../incidents/company_data/SouthernLightsPipeline.json";
import { mainIncidents } from "../../incidents/incidentsDashboard.js";
// language
import { englishDashboard } from "../../modules/langEnglish.js";
// load dashboards
import { loadAllCharts } from "../loadDashboards.js";
generalTheme();

const arrayOfCharts = [
  mainConditions(
    JSON.parse(conditionsData.regions),
    canadaMap,
    conditionsData.mapMeta,
    conditionsData.meta,
    englishDashboard.conditions
  ),
  mainIncidents(
    incidentData.events,
    incidentData.meta,
    englishDashboard.incidents
  ),
];

loadAllCharts(arrayOfCharts);
