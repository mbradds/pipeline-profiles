import { bindToWindow } from "./vendor";
import { generalTheme } from "../modules/themes";
// conditions
import { mainConditions } from "../conditions/conditionsDashboard";
// incidents
import { mainIncidents } from "../incidents/incidentsDashboard";
// language;
import { englishDashboard } from "../modules/langEnglish";
// traffic
import { mainTraffic } from "../traffic/trafficDashboard";
// apportionment
import { mainApportion } from "../apportionment/apportionmentDashboard";
// operations and maintenance activities
import { mainOandM } from "../oandm/oandmDashboard";

console.time(`first content loading`);
bindToWindow();

generalTheme();

export async function loadAllCharts(data, plains = false) {
  const arrayOfCharts = [
    mainTraffic(
      data.trafficData.traffic,
      data.trafficData.meta,
      englishDashboard.traffic
    ),
    mainApportion(data.apportionData, englishDashboard.apportion),
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
    mainOandM(data.oandmData),
  ];

  function plainsMidstreamProfile(lang, div) {
    [...document.querySelectorAll(`.${div}`)].forEach((warn) => {
      const plainsDiv = warn;
      plainsDiv.innerHTML = `<section class="alert alert-warning" style="margin-bottom: 0px"><h4>${lang.plains}</h4></section>`;
    });
  }

  if (plains) {
    plainsMidstreamProfile(englishDashboard, "plains_disclaimer");
  }

  return Promise.allSettled(arrayOfCharts).then(() => {
    // .then((value))
    console.timeEnd(`first content loading`);
  });
}
