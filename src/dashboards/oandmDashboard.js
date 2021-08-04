import { EventNavigator } from "../modules/dashboard/EventNavigator";
import { EventTrend } from "../modules/dashboard/EventTrend";
import { loadChartError } from "../modules/util";
import { noEventsFlag } from "./dashboardUtil";

// TODO: add regdocs folder for all company oandm submissions
// TODO: add some more stuff from the oamdm filing guide
export async function mainOandM(eventData, lang) {
  const eventType = "oandm";
  const field = "p";
  const filters = { type: "frequency" };

  function addDashboardTitle() {
    const titleElement = document.getElementById("oandm-dashboard-title");
    if (
      Object.prototype.hasOwnProperty.call(
        lang.companyToSystem,
        eventData.meta.company
      )
    ) {
      titleElement.innerText = lang.title(
        lang.companyToSystem[eventData.meta.company]
      );
    } else {
      titleElement.innerHTML = lang.title(eventData.meta.company);
    }
  }

  function loadDynamicText() {
    lang.dynamicText(eventData.meta, lang);
    // oandmText(eventData.meta, lang);
  }

  const incidentTimeSeries = (timeField, timeFilters) => {
    const timeSeries = new EventTrend({
      eventType,
      field: timeField,
      filters: timeFilters,
      data: eventData.data,
      seriesed: true,
      seriesInfo: lang.seriesInfo,
      definitions: lang.definitions,
      definitionsOn: "pill",
      divId: "oandm-time-series",
      legendClickText: { enabled: true, text: lang.legendClick },
      lang,
    });
    const trendNav = new EventNavigator({
      plot: timeSeries,
      numberOfPills: 5,
      langPillTitles: lang.pillTitles,
    });

    trendNav.makeBar("p", "oandm-region-trend", "activated");
    trendNav.makeBar("id", "oandm-dig-trend", "deactivated");
    trendNav.makeBar("fp", "oandm-fish-trend", "deactivated");
    trendNav.makeBar("is", "oandm-instream-trend", "deactivated");
    trendNav.makeBar("sr", "oandm-species-trend", "deactivated");
    trendNav.divEvents();
    return timeSeries;
  };

  function buildDecision() {
    if (eventData.build) {
      addDashboardTitle();
      loadDynamicText();
      incidentTimeSeries(field, filters);
    } else {
      noEventsFlag(
        lang.noEvents.header,
        lang.noEvents.note,
        eventData.meta.companyName,
        "oandm-dashboard"
      );
    }
  }

  try {
    return buildDecision();
  } catch (err) {
    console.log(err);
    return loadChartError("oandm-dashboard", lang.dashboardError);
  }
}
