import { loadAllCharts } from "../../loadDashboards_en.js";
import { getData } from "../../getData.js";

// setTimeout(getData("NGTL", loadAllCharts), 5000);
setTimeout(() => {
  getData("NGTL", loadAllCharts);
}, 2000);
// getData("NGTL", loadAllCharts);
