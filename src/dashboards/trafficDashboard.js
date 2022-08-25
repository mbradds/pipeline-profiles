import { loadChartError, visibility } from "../modules/util.js";
import { Traffic } from "../modules/dashboard/Traffic.js";

export async function mainTraffic(trafficData, metaData, lang, pipelineShape) {
  if (metaData.build) {
    try {
      const traffic = new Traffic({
        trafficData,
        metaData,
        lang,
        pipelineShape,
      });
      traffic.buildDashboard();
      traffic.keyPointListener();
      traffic.unitsListener();
      traffic.mapZoomListener();
      return traffic;
    } catch (err) {
      return loadChartError("traffic-section", lang.dashboardError, err);
    }
  } else {
    visibility(["traffic-section"], "hide");
    return false;
  }
}
