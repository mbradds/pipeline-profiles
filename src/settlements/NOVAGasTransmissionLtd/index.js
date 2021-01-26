// //ngtl incidents
import settlementsData from "./settlementsData.json";
import { settlements } from "../settlementsDashboard.js";

// async version
export async function runSettlements() {
  return new Promise((resolve) => {
    resolve(settlements(settlementsData));
  });
}
// syncronous version
// export function runIncidents() {
//   mainIncidents(incidentData);
// }
