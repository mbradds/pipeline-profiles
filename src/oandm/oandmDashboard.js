import { EventNavigator, EventTrend } from "../modules/dashboard";
import { oandmText } from "../modules/dynamicText";
import { regionColors, yesNoColors } from "../modules/colors";

export function mainOandM(eventData) {
  console.log(eventData);
  const eventType = "oandm-activities";
  const field = "Integrity Dig";
  const filters = { type: "frequency" };
  function loadDynamicText() {
    oandmText(eventData.meta);
  }

  const engNames = { y: "Yes", n: "No" };
  const seriesInfo = {
    "Integrity Dig": { colors: yesNoColors, names: engNames },
    "Fish Present": { colors: yesNoColors, names: engNames },
    "In Stream Work Required": { colors: yesNoColors, names: engNames },
    "Species At Risk Present": { colors: yesNoColors, names: engNames },
    "Province/Territory": {
      colors: regionColors,
      names: { ab: "Alberta", bc: "British Columbia", sk: "Saskatchewan" },
    },
  };

  const incidentTimeSeries = (timeField, timeFilters) => {
    const timeSeries = new EventTrend({
      eventType,
      field: timeField,
      filters: timeFilters,
      data: eventData.data,
      seriesed: true,
      seriesInfo,
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
      "Species At Risk Present",
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
