import { loadAllCharts } from "../../loadDashboards_en.js";
import { getData } from "../../getData.js";

// for testing loader
// setTimeout(() => {
//   getData("NGTL", loadAllCharts);
// }, 2000);
getData("NGTL", loadAllCharts);
