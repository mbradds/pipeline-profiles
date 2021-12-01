import { Tolls } from "../modules/dashboard/Tolls.js";
import { loadChartError } from "../modules/util.js";
import { noEventsFlag } from "./dashboardUtil.js";

export async function mainTolls(tollsData, metaData, lang) {
  function buildDecision() {
    const dashboard = new Tolls({
      tollsData,
      metaData,
      lang: lang.dashboard,
      chartDiv: "tolls-chart",
    });
    if (metaData.build) {
      dashboard.buildDashboard();
    } else {
      noEventsFlag(
        lang.noEvents.header(lang.eventName),
        lang.noEvents.note(
          lang.eventName,
          lang.companyToSystem[metaData.companyName]
        ),
        "tolls-section"
      );
    }
  }

  try {
    buildDecision();
  } catch (err) {
    // console.log(err);
    loadChartError("tolls-section", lang.dashboardError, err);
  }
}
