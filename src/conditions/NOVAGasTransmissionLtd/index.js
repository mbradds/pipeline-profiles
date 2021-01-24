//ngtl conditions
import econRegions from "./economicRegions.json";
import canadaMap from "../base_maps/base_map.json";
import mapMetaData from "./mapMetadata.json";
import meta from "./summaryMetadata.json";
import { mainConditions } from "../conditionsDashboard.js";

// async version
export async function runConditions() {
  return new Promise((resolve) => {
    resolve(mainConditions(econRegions, canadaMap, mapMetaData, meta));
  });
}
// syncronous version
// export function runConditions() {
//   mainConditions(econRegions, canadaMap, mapMetaData, meta);
// }
