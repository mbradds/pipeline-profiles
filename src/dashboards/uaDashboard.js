import { EventMap } from "../modules/dashboard/EventMap.js";
import { EventNavigator } from "../modules/dashboard/EventNavigator.js";
import { EventTrend } from "../modules/dashboard/EventTrend.js";
import { loadChartError } from "../modules/util.js";
import { noEventsFlag } from "./dashboardUtil.js";

export async function mainUa(uaData, metaData, lang) {
  const eventType = "unauthorized-activities";
  const filters = { type: "frequency" };

  const uaBar = (events, map, langPillTitles) => {
    const barNav = new EventNavigator({
      plot: map,
      numberOfPills: 4,
      langPillTitles,
      data: events,
    });
    barNav.makeBar("wpc", "ua-contact-bar", "activated");
    barNav.makeBar("y", "ua-year-bar", "deactivated");
    barNav.makeBar("ic", "ua-concern-var", "deactivated");
    barNav.makeBar("wpd", "ua-damage-bar", "deactivated");
    barNav.divEvents();
    return barNav;
  };

  const uaMap = (events, mapFilters, mapLang) => {
    const map = new EventMap({
      eventType,
      filters: mapFilters,
      minRadius: 14000,
      divId: "unauthorized-activities-map",
      toolTipFields: ["et", "mod"],
      lang: mapLang,
      regdocsClick: false,
    });
    map.addBaseMap();
    map.processEventsData(events);
    map.lookForSize();
    return map;
  };

  const uaTimeSeries = (timeFilters) => {
    const timeSeries = new EventTrend({
      eventType,
      field: undefined,
      filters: timeFilters,
      data: uaData,
      divId: "unauthorized-activities-time-series",
      legendClickText: { enabled: true, text: lang.dashboard.legendClick },
      oneToMany: {},
      lang: lang.dashboard,
      definitions: {},
      seriesed: false,
      seriesInfo: {},
    });

    const trendNav = new EventNavigator({
      plot: timeSeries,
      numberOfPills: 4,
      langPillTitles: { titles: lang.dashboard.pillTitles.titles }, // Remove click text from pill
    });
    trendNav.makeBar("et", "ua-status-trend", "activated");
    trendNav.makeBar("eqt", "ua-activity-trend", "deactivated");
    trendNav.makeBar("wpc", "ua-pipeline-trend", "deactivated");
    trendNav.makeBar("mod", "ua-contaminant-trend", "deactivated");
    trendNav.divEvents();

    return timeSeries;
  };

  function buildDashboard() {
    if (metaData.build) {
      const thisMap = uaMap(uaData, filters, lang.dashboard);
      const bars = uaBar(uaData, thisMap, lang.dashboard.pillTitles);

      uaTimeSeries(filters);

      thisMap.switchDashboards(bars);
      thisMap.nearbySlider(
        lang.dashboard.rangeTitle,
        lang.dashboard.findBtnTitle
      );
      thisMap.nearbyListener(lang.dashboard.locationError);
      thisMap.resetCirclesListener();
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
