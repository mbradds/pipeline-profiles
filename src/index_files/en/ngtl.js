console.time(`first content loading`);
import { generalTheme } from "../../modules/themes.js";
// conditions
import canadaMap from "../../conditions/base_maps/base_map.json";
import conditionsData from "../../conditions/company_data/NOVAGasTransmissionLtd.json";
import { mainConditions } from "../../conditions/conditionsDashboard.js";
// incidents
import incidentData from "../../incidents/company_data/NOVAGasTransmissionLtd.json";
import { mainIncidents } from "../../incidents/incidentsDashboard.js";
// operations and maintenance
import opsData from "../../operationsAndMaintenance/company_data/NOVAGasTransmissionLtd.json";
import { mainOandM } from "../../operationsAndMaintenance/oandmDashboard.js";
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
  mainOandM(opsData.events, opsData.meta, englishDashboard.o_and_m),
];

loadAllCharts(arrayOfCharts).then((value) => {
  console.timeEnd(`first content loading`);
});
