import { loadChartError, visibility } from "../modules/util.js";
import { Traffic } from "../modules/dashboard/traffic.js";

export async function mainTraffic(trafficData, metaData, lang) {
  if (metaData.build) {
    try {
      const traffic = new Traffic({ trafficData, metaData, lang });
      traffic.buildDashboard();
      traffic.keyPointListener();
      traffic.unitsListener();
      traffic.mapZoomListener();
      return traffic;
    } catch (err) {
      console.log(err);
      return loadChartError("traffic-section", lang.dashboardError);
    }
  } else {
    visibility(["traffic-section"], "hide");
    return false;
  }
}
