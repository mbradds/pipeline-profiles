console.time(`first content loading`);
import { generalTheme } from "../../modules/themes.js";
// conditions
import canadaMap from "../../conditions/base_maps/base_map.json";
import conditionsData from "../../conditions/company_data/fr/EnbridgePipelinesInc.json";
import { mainConditions } from "../../conditions/conditionsDashboard.js";
// incidents
import incidentData from "../../incidents/company_data/fr/EnbridgePipelinesInc.json";
import { mainIncidents } from "../../incidents/incidentsDashboard.js";
// language
import { frenchDashboard } from "../../modules/langFrench.js";
// load dashboards
import { loadAllCharts } from "../loadDashboards.js";
generalTheme();

const arrayOfCharts = [
  mainConditions(
    JSON.parse(conditionsData.regions),
    canadaMap,
    conditionsData.mapMeta,
    conditionsData.meta,
    frenchDashboard.conditions
  ),
  mainIncidents(
    incidentData.events,
    incidentData.meta,
    frenchDashboard.incidents
  ),
];

loadAllCharts(arrayOfCharts).then((value) => {
  console.timeEnd("first content loading");
});
