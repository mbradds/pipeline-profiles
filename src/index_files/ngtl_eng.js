console.time(`chart loading`);
//highcharts themes/configuration
import { generalTheme } from "../modules/themes.js";
//let generalTheme = await import("../modules/themes.js");
import ieWarn from "ie-gang";

//ngtl conditions
import econRegions from "../conditions/NOVAGasTransmissionLtd/economicRegions.json";
import canadaMap from "../conditions/base_maps/base_map.json";
import mapMetaData from "../conditions/NOVAGasTransmissionLtd/mapMetadata.json";
import meta from "../conditions/NOVAGasTransmissionLtd/summaryMetadata.json";
import { mainConditions } from "../conditions/conditionsDashboard.js";

//ngtl incidents
import incidentData from "../incidents/NOVAGasTransmissionLtd/incidents_map.json";
import { mainIncidents } from "../incidents/incidentsDashboard.js";

let warningParams = {
  message:
    "We noticed you are using Internet Explorer. Please consider using a different browser for a better experience on this page.",
  type: "alert",
  title: "Old Browser Warning",
  applyIE: false,
};

ieWarn(warningParams);
generalTheme();

mainConditions(econRegions, canadaMap, mapMetaData, meta);
mainIncidents(incidentData);
console.timeEnd(`chart loading`);
