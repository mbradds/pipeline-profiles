import { Tolls } from "../modules/dashboard/Tolls.js";
import { loadChartError } from "../modules/util.js";
import { noEventsFlag } from "./dashboardUtil.js";

export async function mainTolls(tollsData, metaData, lang) {
  function buildDecision() {
    const dashboard = new Tolls({
      tollsData,
      metaData,
      chartDiv: "tolls-chart",
    });
    if (metaData.build) {
      dashboard.buildDashboard();
    } else {
      noEventsFlag(
        lang.noTolls.header,
        lang.noTolls.note,
        metaData.companyName,
        "tolls-section"
      );
    }
  }

  try {
    buildDecision();
  } catch (err) {
    // console.log(err);
    loadChartError("tolls-section", lang.dashboardError);
  }
}
