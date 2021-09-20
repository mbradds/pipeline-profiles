import { EventNavigator } from "../modules/dashboard/EventNavigator.js";
import { EventTrend } from "../modules/dashboard/EventTrend.js";
import { loadChartError } from "../modules/util.js";
import { noEventsFlag } from "./dashboardUtil.js";

// TODO: add regdocs folder for all company oandm submissions
// TODO: add some more stuff from the oamdm filing guide
export async function mainOandM(eventData, lang) {
  const eventType = "oandm";
  const field = "p";
  const filters = { type: "frequency" };

  function addDashboardTitle() {
    const titleElement = document.getElementById("oandm-dashboard-title");
    const dataWithCompany = eventData;
    if (
      Object.prototype.hasOwnProperty.call(
        lang.companyToSystem,
        eventData.meta.company
      )
    ) {
      dataWithCompany.meta.system =
        lang.companyToSystem[eventData.meta.company];
      titleElement.innerText = lang.title(
        lang.companyToSystem[eventData.meta.company]
      );
    } else {
      dataWithCompany.meta.system = eventData.meta.company;
      titleElement.innerHTML = lang.title(eventData.meta.company);
    }
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
      lang.dynamicText(eventData.meta, lang);
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
    return loadChartError("oandm-dashboard", lang.dashboardError);
  }
}
