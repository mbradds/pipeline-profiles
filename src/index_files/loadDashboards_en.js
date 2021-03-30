console.time(`first content loading`);
import { generalTheme } from "../modules/themes.js";
// conditions
import { mainConditions } from "../conditions/conditionsDashboard.js";
//incidents
import { mainIncidents } from "../incidents/incidentsDashboard.js";
//language;
import { englishDashboard } from "../modules/langEnglish.js";
//traffic
import { mainTraffic } from "../traffic/trafficDashboard.js";
generalTheme();

export async function loadAllCharts(data, plains = false) {
  const arrayOfCharts = [
    mainTraffic(
      data.trafficData.traffic,
      data.trafficData.meta,
      englishDashboard.traffic
    ),
    mainConditions(
      JSON.parse(data.conditionsData.regions),
      data.canadaMap,
      data.conditionsData.mapMeta,
      data.conditionsData.meta,
      englishDashboard.conditions
    ),
    mainIncidents(
      data.incidentData.events,
      data.incidentData.meta,
      englishDashboard.incidents
    ),
  ];

  if (plains) {
    function plains_midstream_profile(lang, div) {
      [...document.querySelectorAll(`.${div}`)].map((warn) => {
        warn.innerHTML = `<section class="alert alert-warning" style="margin-bottom: 0px"><h4>${lang.plains}</h4></section>`;
      });
    }
    plains_midstream_profile(englishDashboard, "plains_disclaimer");
  }

  return Promise.allSettled(arrayOfCharts).then((value) => {
    console.timeEnd(`first content loading`);
  });
}
