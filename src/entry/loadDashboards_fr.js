import { generalTheme, frenchTheme } from "../modules/themes.js";
// conditions
import { mainConditions } from "../dashboards/conditionsDashboard.js";
// incidents
import { mainIncidents } from "../dashboards/incidentsDashboard.js";
// language;
import { frenchDashboard } from "../modules/langFrench.js";
// traffic
import { mainTraffic } from "../dashboards/trafficDashboard.js";
// apportionment
import { mainApportion } from "../dashboards/apportionmentDashboard.js";
// operations and maintenance activities
import { mainOandM } from "../dashboards/oandmDashboard.js";
// contaminated sites and remediation
import { mainRemediation } from "../dashboards/remediationDashboard.js";
// plains disclaimers
import { plainsMidstreamProfile } from "../modules/util.js";

import "../css/main.css";
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

  return Promise.allSettled(arrayOfCharts).then(() => {
    // console.timeEnd(`first content loading`);
    if (plains) {
      plainsMidstreamProfile(frenchDashboard, "plains_disclaimer");
    }
  });
}
