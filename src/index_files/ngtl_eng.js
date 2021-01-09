import { generalTheme } from "../modules/themes.js";
import ngtlRegions from "../conditions/NOVAGasTransmissionLtd/economicRegions.json";
import canadaMap from "../conditions/base_maps/base_map.json";
import mapMetaData from "../conditions/NOVAGasTransmissionLtd/mapMetadata.json";
import meta from "../conditions/NOVAGasTransmissionLtd/summaryMetadata.json";
import { conditionsMap } from "../conditions/hcConditionsMap.js";
import ieWarn from "ie-gang";
let warningParams = {
  message:
    "We noticed you are using Internet Explorer. Please consider using a different browser for a better experience on this page.",
  type: "alert",
  title: "Old Browser Warning",
  applyIE: false,
};
ieWarn(warningParams);
generalTheme();
conditionsMap(ngtlRegions, canadaMap, mapMetaData, meta);
