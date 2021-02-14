console.time(`chart loading`);
import { generalTheme } from "../modules/themes.js";
import ieWarn from "ie-gang";
// conditions
import econRegions from "../conditions/EnbridgePipelinesInc/economicRegions.json";
import canadaMap from "../conditions/base_maps/base_map.json";
import mapMetaData from "../conditions/EnbridgePipelinesInc/mapMetadata.json";
import metaConditions from "../conditions/EnbridgePipelinesInc/summaryMetadata.json";
import { mainConditions } from "../conditions/conditionsDashboard.js";
// incidents
import incidentData from "../incidents/EnbridgePipelinesInc/incidents_map.json";
import metaIncidents from "../incidents/EnbridgePipelinesInc/summaryMetadata.json";
import { mainIncidents } from "../incidents/incidentsDashboard.js";
// settlements
import settlementsData from "../settlements/EnbridgePipelinesInc/settlementsData.json";
import { mainSettlements } from "../settlements/settlementsDashboard.js";
// language
import { englishDashboard } from "../modules/langEnglish.js";
let warningParams = {
  message:
    "We noticed you are using Internet Explorer. Please consider using a different browser for a better experience on this page.",
  type: "alert",
  title: "Old Browser Warning",
  applyIE: false,
};

ieWarn(warningParams);
generalTheme();

async function loadAllCharts() {
  let arrayOfCharts = [
    mainConditions(
      econRegions,
      canadaMap,
      mapMetaData,
      metaConditions,
      englishDashboard.conditions
    ),
    mainIncidents(incidentData, metaIncidents),
    mainSettlements(settlementsData),
  ];
  Promise.allSettled(arrayOfCharts).then((value) => {
    console.timeEnd(`chart loading`);
  });
}

loadAllCharts();
