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
// tolls
import { mainTolls } from "../dashboards/tollsDashboard.js";
// operations and maintenance activities
import { mainOandM } from "../dashboards/oandmDashboard.js";
// contaminated sites and remediation
import { mainRemediation } from "../dashboards/remediationDashboard.js";
// unauthorized activities
import { mainUa } from "../dashboards/uaDashboard.js";
// tcpl revenues
import { mainTcplRevenues } from "../dashboards/tcplRevenuesDashboard.js";
// pipeline shape promise
import { getPipelineShape } from "../modules/pipelineShape.js";

import "../css/main.css";

// console.time(`first content loading`);

generalTheme();
frenchTheme();

export function loadAllCharts(data) {
  // mainTolls(data.tollsData.tolls, data.tollsData.meta, frenchDashboard.tolls);
  $(document).on("wb-ready.wb", function () {
    const pipelineShape = getPipelineShape(data.incidentData.meta.companyName);
    mainTraffic(
      data.trafficData.traffic,
      data.trafficData.meta,
      frenchDashboard.traffic,
      pipelineShape
    );
    mainApportion(data.apportionData, frenchDashboard.apportion);
    mainConditions(
      JSON.parse(data.conditionsData.regions),
      data.canadaMap,
      data.conditionsData.mapMeta,
      data.conditionsData.meta,
      frenchDashboard.conditions
    );
    mainIncidents(
      data.incidentData.events,
      data.incidentData.meta,
      frenchDashboard.incidents,
      pipelineShape
    );
    mainOandM(data.oandmData, frenchDashboard.oandm);
    mainRemediation(
      data.remediationData,
      frenchDashboard.remediation,
      pipelineShape
    );
    mainUa(
      data.uaData.events,
      data.uaData.meta,
      frenchDashboard.ua,
      pipelineShape
    );
  });
  if (data.tcplRevenues) {
    mainTcplRevenues(data.tcplRevenues, frenchDashboard.tcplRevenues);
  }
  // console.timeEnd(`first content loading`);
}
