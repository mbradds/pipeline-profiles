import { loadChartError } from "../modules/util.js";
import { noEventsFlag } from "./dashboardUtil.js";

export async function mainUa(uaData, metaData, lang) {
  function buildDashboard() {
    if (metaData.build) {
      console.log(uaData, metaData, lang);
    } else {
      noEventsFlag(
        lang.noEvents.header(lang.dashboard.eventName),
        lang.noEvents.note(
          lang.dashboard.eventName,
          lang.companyToSystem[metaData.companyName]
        ),
        "unauthorized-activities-dashboard"
      );
    }
  }

  try {
    return buildDashboard();
  } catch (err) {
    return loadChartError(
      "unauthorized-activities-dashboard",
      lang.dashboardError,
      err
    );
  }
}
