console.time(`first content loading`);
import { generalTheme } from "../modules/themes.js";
// conditions
import { mainConditions } from "../conditions/conditionsDashboard.js";
//incidents
import { mainIncidents } from "../incidents/incidentsDashboard.js";
//language;
import { frenchDashboard } from "../modules/langFrench.js";
//traffic
import { mainTraffic } from "../traffic/trafficDashboard.js";
generalTheme();

export async function loadAllCharts(data) {
  const arrayOfCharts = [
    mainTraffic(
      data.trafficData.traffic,
      data.trafficData.meta,
      frenchDashboard.traffic
    ),
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
  ];

  return Promise.allSettled(arrayOfCharts).then((value) => {
    console.timeEnd(`first content loading`);
  });
}
