import { generalTheme, frenchTheme } from "../modules/themes";
// conditions
import { mainConditions } from "../conditions/conditionsDashboard";
// incidents
import { mainIncidents } from "../incidents/incidentsDashboard";
// language;
import { frenchDashboard } from "../modules/langFrench";
// traffic
import { mainTraffic } from "../traffic/trafficDashboard";
// apportionment
import { mainApportion } from "../apportionment/apportionmentDashboard";
// operations and maintenance activities
import { mainOandM } from "../oandm/oandmDashboard";
// contaminated sites and remediation
import { mainRemediation } from "../remediation/remediationDashboard";

require("../css/main.css");
// console.time(`first content loading`);

generalTheme();
frenchTheme();

export async function loadAllCharts(data, plains = false) {
  const arrayOfCharts = [
    mainTraffic(
      data.trafficData.traffic,
      data.trafficData.meta,
      frenchDashboard.traffic
    ),
    mainApportion(data.apportionData, frenchDashboard.apportion),
    mainConditions(
      JSON.parse(data.conditionsData.regions),
      data.canadaMap,
      data.conditionsData.mapMeta,
      data.conditionsData.meta,
      frenchDashboard.conditions
    ),
    mainIncidents(
      data.incidentData.events,
      data.incidentData.meta,
      frenchDashboard.incidents
    ),
    mainOandM(data.oandmData, frenchDashboard.oandm),
    mainRemediation(data.remediationData, frenchDashboard.remediation),
  ];

  function plainsMidstreamProfile(lang, div) {
    [...document.querySelectorAll(`.${div}`)].forEach((warn) => {
      const plainsDiv = warn;
      plainsDiv.innerHTML = `<section class="alert alert-warning" style="margin-bottom: 0px"><h4>${lang.plains}</h4></section>`;
    });
  }
  if (plains) {
    plainsMidstreamProfile(frenchDashboard, "plains_disclaimer");
  }

  return Promise.allSettled(arrayOfCharts).then(() => {
    // console.timeEnd(`first content loading`);
  });
}
