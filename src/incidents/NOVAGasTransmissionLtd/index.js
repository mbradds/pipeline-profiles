// //ngtl incidents
import incidentData from "./incidents_map.json";
import meta from "./summaryMetadata.json";
import { mainIncidents } from "../incidentsDashboard.js";

// async version
export async function runIncidents() {
  return new Promise((resolve) => {
    resolve(mainIncidents(incidentData, meta));
  });
}
// syncronous version
// export function runIncidents() {
//   mainIncidents(incidentData);
// }
