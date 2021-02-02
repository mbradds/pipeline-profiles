//ngtl conditions
import econRegions from "./economicRegions.json";
import canadaMap from "../base_maps/base_map.json";
import mapMetaData from "./mapMetadata.json";
import meta from "./summaryMetadata.json";
import { mainConditions } from "../conditionsDashboard.js";

export async function runConditions() {
  return mainConditions(econRegions, canadaMap, mapMetaData, meta);
}
