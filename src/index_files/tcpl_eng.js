console.time(`chart loading`);
import { generalTheme } from "../modules/themes.js";
import ieWarn from "ie-gang";
// conditions
import econRegions from "../conditions/TransCanadaPipeLinesLimited/economicRegions.json";
import canadaMap from "../conditions/base_maps/base_map.json";
import mapMetaData from "../conditions/TransCanadaPipeLinesLimited/mapMetadata.json";
import metaConditions from "../conditions/TransCanadaPipeLinesLimited/summaryMetadata.json";
import { mainConditions } from "../conditions/conditionsDashboard.js";
// incidents
import incidentData from "../incidents/TransCanadaPipeLinesLimited/incidents_map.json";
import metaIncidents from "../incidents/TransCanadaPipeLinesLimited/summaryMetadata.json";
import { mainIncidents } from "../incidents/incidentsDashboard.js";
// settlements
import settlementsData from "../settlements/TransCanadaPipeLinesLimited/settlementsData.json";
import { mainSettlements } from "../settlements/settlementsDashboard.js";

let warningParams = {
  message:
    "We noticed you are using Internet Explorer. Please consider using a different browser for a better experience on this page.",
  type: "alert",
  title: "Old Browser Warning",
  applyIE: false,
};

ieWarn(warningParams);
generalTheme();

// async version
async function loadAllCharts() {
  let arrayOfCharts = [
    mainConditions(econRegions, canadaMap, mapMetaData, metaConditions),
    mainIncidents(incidentData, metaIncidents),
    mainSettlements(settlementsData),
  ];
  Promise.allSettled(arrayOfCharts).then((value) => {
    console.timeEnd(`chart loading`);
  });
}

loadAllCharts();
