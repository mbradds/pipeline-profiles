//ngtl conditions
import econRegions from "./economicRegions.json";
import canadaMap from "../base_maps/base_map.json";
import mapMetaData from "./mapMetadata.json";
import meta from "./summaryMetadata.json";
import { mainConditions } from "../conditionsDashboard.js";

export function runConditions() {
  return new Promise((resolve) => {
    setTimeout(
      () => resolve(mainConditions(econRegions, canadaMap, mapMetaData, meta)),
      0
    );
  });
}
