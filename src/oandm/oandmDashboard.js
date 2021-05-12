import { EventNavigator, EventTrend } from "../modules/dashboard";
import { oandmText } from "../modules/dynamicText";

export function mainOandM(eventData) {
  // console.log(eventData.data);
  const eventType = "oandm-activities";
  const field = "Integrity Dig";
  const filters = { type: "frequency" };
  function loadDynamicText() {
    oandmText(eventData.meta);
  }

  const incidentTimeSeries = (timeField, timeFilters) => {
    const timeSeries = new EventTrend({
      eventType,
      field: timeField,
      filters: timeFilters,
      data: eventData.data,
      seriesed: true,
      hcDiv: "time-series-oandm",
      lang: {},
    });
    const trendNav = new EventNavigator({
      plot: timeSeries,
      langPillTitles: false,
      height: 70,
      showClickText: false,
    });

    trendNav.makeBar("Integrity Dig", "oandm-dig-trend", "activated", false);
    trendNav.makeBar(
      "Province/Territory",
      "oandm-region-trend",
      "deactivated",
      false
    );
    trendNav.makeBar("Fish Present", "oandm-fish-trend", "deactivated", false);
    trendNav.makeBar(
      "In Stream Work Required",
      "oandm-instream-trend",
      "deactivated",
      false
    );
    trendNav.makeBar(
      "Species At Risk Present At Activity Site",
      "oandm-species-trend",
      "deactivated",
      false
    );
    trendNav.divEvents();
    timeSeries.createChart();
    return timeSeries;
  };

  loadDynamicText();
  incidentTimeSeries(field, filters);
}
