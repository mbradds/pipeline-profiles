import incidentData from "../../incidents/company_data/NOVAGasTransmissionLtd.json";
import { mainIncidents } from "../../incidents/incidentsDashboard.js";

export async function modTest(loadAllCharts, englishDashboard) {
  const arrayOfCharts = [
    mainIncidents(
      incidentData.events,
      incidentData.meta,
      englishDashboard.incidents
    ),
  ];
  loadAllCharts(arrayOfCharts);
}
