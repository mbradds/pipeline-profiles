import { EventNavigator } from "../modules/dashboard/EventNavigator";
import { EventTrend } from "../modules/dashboard/EventTrend";
import { oandmText } from "../modules/dynamicText";
import { loadChartError } from "../modules/util";
import { noEventsFlag } from "./dashboardUtil";

// TODO: add regdocs folder for all company oandm submissions
// TODO: add some more stuff from the oamdm filing guide
export async function mainOandM(eventData, lang) {
  const eventType = "oandm";
  const field = "Province/Territory";
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
    oandmText(eventData.meta, lang);
  }

  const definitions = {
    "Integrity Dig":
      "Indicates if the activity includes excavation to expose, assess, or repair an existing pipeline.",
    "Fish Present":
      "Indicates if there will be ground disturbance using power-operated equipment within 30M of a wetland or a water body or within 30M of the substrate of a wetland or water body at the activity site, and the water body is fish-bearing.",
    "In Stream Work Required":
      "Indicates if there will be any in-stream work at activity site.",
    "Species At Risk Present":
      "Indicates if there are species present which are listed on schedule 1 of the Species At Risk Act at the activity site.",
  };

  const incidentTimeSeries = (timeField, timeFilters) => {
    const timeSeries = new EventTrend({
      eventType,
      field: timeField,
      filters: timeFilters,
      data: eventData.data,
      seriesed: true,
      seriesInfo: lang.seriesInfo,
      definitions,
      definitionsOn: "pill",
      divId: "time-series-oandm",
      legendClickText: { enabled: true, text: lang.legendClick },
      lang,
    });
    const trendNav = new EventNavigator({
      plot: timeSeries,
      numberOfPills: 5,
      langPillTitles: lang.pillTitles,
      fixedPillHeight: 72,
    });

    trendNav.makeBar("Province/Territory", "oandm-region-trend", "activated");
    trendNav.makeBar("Integrity Dig", "oandm-dig-trend", "deactivated");
    trendNav.makeBar("Fish Present", "oandm-fish-trend", "deactivated");
    trendNav.makeBar(
      "In Stream Work Required",
      "oandm-instream-trend",
      "deactivated"
    );
    trendNav.makeBar(
      "Species At Risk Present",
      "oandm-species-trend",
      "deactivated"
    );
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
    return loadChartError("oandm-dashboard", lang.dashboardError);
  }
}
