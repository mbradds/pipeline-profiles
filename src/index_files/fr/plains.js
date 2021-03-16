import { generalTheme } from "../../modules/themes.js";
// conditions
import canadaMap from "../../conditions/base_maps/base_map.json";
import conditionsData from "../../conditions/company_data/fr/PlainsMidstreamCanadaULC.json";
import { mainConditions } from "../../conditions/conditionsDashboard.js";
// incidents
import incidentData from "../../incidents/company_data/fr/PlainsMidstreamCanadaULC.json";
import { mainIncidents } from "../../incidents/incidentsDashboard.js";
// language
import { englishDashboard } from "../../modules/langEnglish.js";
// load dashboards
import { loadAllCharts } from "../loadDashboards.js";
generalTheme();
function plains_midstream_profile(lang, div) {
  [...document.querySelectorAll(`.${div}`)].map((warn) => {
    warn.innerHTML = `<section class="alert alert-warning" style="margin-bottom: 0px"><h4>${lang.plains}</h4></section>`;
  });
}
plains_midstream_profile(englishDashboard, "plains_disclaimer");

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
