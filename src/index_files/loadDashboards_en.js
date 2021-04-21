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

console.time(`first content loading`);

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
    mainApportion(data.apportionData, englishDashboard.apportion),
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
