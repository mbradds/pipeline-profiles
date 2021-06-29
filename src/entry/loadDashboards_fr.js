import { generalTheme, frenchTheme } from "../modules/themes";
// conditions
import { mainConditions } from "../dashboards/conditionsDashboard";
// incidents
import { mainIncidents } from "../dashboards/incidentsDashboard";
// language;
import { frenchDashboard } from "../modules/langFrench";
// traffic
import { mainTraffic } from "../dashboards/trafficDashboard";
// apportionment
import { mainApportion } from "../dashboards/apportionmentDashboard";
// operations and maintenance activities
import { mainOandM } from "../dashboards/oandmDashboard";
// contaminated sites and remediation
import { mainRemediation } from "../dashboards/remediationDashboard";
// plains disclaimers
import { plainsMidstreamProfile } from "../modules/util";

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

  return Promise.allSettled(arrayOfCharts).then(() => {
    // console.timeEnd(`first content loading`);
    if (plains) {
      plainsMidstreamProfile(frenchDashboard, "plains_disclaimer");
    }
  });
}
