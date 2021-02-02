// //ngtl incidents
import settlementsData from "./settlementsData.json";
import { settlements } from "../settlementsDashboard.js";

export async function runSettlements() {
  return settlements(settlementsData);
}
