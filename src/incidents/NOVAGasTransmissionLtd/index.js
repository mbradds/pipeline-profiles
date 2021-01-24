// //ngtl incidents
import incidentData from "./incidents_map.json";
import { mainIncidents } from "../incidentsDashboard.js";

export function runIncidents() {
  return new Promise((resolve) => {
    resolve(mainIncidents(incidentData));
    //setTimeout(() => resolve(mainIncidents(incidentData)), 0);
  });
}
