import { profileTextQuery } from "../modules/dynamicText.js";
import { EventNavigator, EventTrend } from "../modules/dashboard.js";

export async function mainOandM(activityData, metaData, lang) {
  const eventType = "O&M activities";
  const field = "Activity Type";
  const filters = { type: "frequency" };
  const oandmTimeSeries = (field, filters) => {
    const timeSeries = new EventTrend({
      eventType: eventType,
      field: field,
      filters: filters,
      data: activityData,
      hcDiv: "om-time-series",
    });
    const trendNav = new EventNavigator({
      plot: timeSeries,
      height: 65,
    });

    trendNav.makeBar("Activity Type", "om-activity-trend", "activated", false);
    trendNav.makeBar("Status", "om-status-trend", "deactivated", false);
    trendNav.makeBar("Province", "om-province-trend", "deactivated", false);
    trendNav.makeBar(
      "Species At Risk Present",
      "om-species-trend",
      "deactivated",
      false
    );
    trendNav.makeBar("Fish Present", "om-fish-trend", "deactivated", false);
    trendNav.divEvents();
    timeSeries.createChart();
    return timeSeries;
  };
  function buildDashboard() {
    try {
      // add the system name to metadata
      try {
        metaData.systemName = lang.companyToSystem[metaData.companyName];
      } catch (err) {
        metaData.systemName = metaData.companyName;
      }
      profileTextQuery.oandmEnglish("system-o&m-paragraph", metaData);
      const trends = oandmTimeSeries(field, filters);
    } catch (err) {
      console.log(err);
    }
  }

  return buildDashboard();
}
