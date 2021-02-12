// //ngtl incidents
import incidentData from "./incidents_map.json";
import meta from "./summaryMetadata.json";
import { mainIncidents } from "../incidentsDashboard.js";

export async function runIncidents() {
  return mainIncidents(incidentData, meta);
}
