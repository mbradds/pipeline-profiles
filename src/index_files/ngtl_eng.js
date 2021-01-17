//ngtl conditions
import econRegions from "../conditions/NOVAGasTransmissionLtd/economicRegions.json";
import canadaMap from "../conditions/base_maps/base_map.json";
import mapMetaData from "../conditions/NOVAGasTransmissionLtd/mapMetadata.json";
import meta from "../conditions/NOVAGasTransmissionLtd/summaryMetadata.json";
import { conditionsMap } from "../conditions/hcConditionsMap.js";

//ngtl incidents
import { ngtlIncidents } from "../incidents/NOVAGasTransmissionLtd/ngtl_incidents.js";
//highcharts themes/configuration
import ieWarn from "ie-gang";

let warningParams = {
  message:
    "We noticed you are using Internet Explorer. Please consider using a different browser for a better experience on this page.",
  type: "alert",
  title: "Old Browser Warning",
  applyIE: false,
};
ieWarn(warningParams);
conditionsMap(econRegions, canadaMap, mapMetaData, meta);
ngtlIncidents();
