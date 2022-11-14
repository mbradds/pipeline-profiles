import { EventMap } from "../modules/dashboard/EventMap.js";
import { EventNavigator } from "../modules/dashboard/EventNavigator.js";
import { EventTrend } from "../modules/dashboard/EventTrend.js";
import { loadChartError } from "../modules/util.js";
import { noEventsFlag, addDashboardTitle } from "./dashboardUtil.js";
import basicCauses from "../data_output/unauthorized_activities/metadata/basic_causes.json";

export async function mainUa(uaData, metaData, lang, pipelineShape) {
  const eventType = "unauthorized-activities";
  const filters = { type: "frequency" };

  const applyBasicCauses = (data, lookup) => {
    try {
      data.map((row) => {
        row.bc = row.bc.map((cause) => {
          if (lookup[cause]) {
            return lookup[cause][lang.lang];
          }
          return "ns";
        });
        return row;
      });
      return data;
    } catch (err) {
      return data;
    }
  };

  const uaBar = (events, map, langPillTitles) => {
    const barNav = new EventNavigator({
      plot: map,
      numberOfPills: 4,
      langPillTitles,
      data: events,
    });
    barNav.makeBar("wpd", "ua-damage-bar", "activated");
    barNav.makeBar("wgd", "ua-disturbance-bar", "deactivated");
    barNav.makeBar("y", "ua-year-bar", "deactivated");
    barNav.makeBar("wdi", "ua-who-discovered-bar", "deactivated");
    barNav.divEvents();
    return barNav;
  };

  const uaMap = (events, mapFilters, mapLang) => {
    const map = new EventMap({
      eventType,
      filters: mapFilters,
      minRadius: 14000,
      divId: "unauthorized-activities-map",
      toolTipFields: ["et", "mod", "bc"],
      lang: mapLang,
      regdocsClick: false,
      pipelineShape,
    });
    map.addBaseMap();
    map.processEventsData(events);
    map.lookForSize();
    map.addPipelineShape();
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
      oneToMany: { et: true },
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
    trendNav.makeBar("et", "ua-type-trend", "activated");
    trendNav.makeBar("wdi", "ua-who-discovered-trend", "deactivated");
    trendNav.makeBar("wpd", "ua-damage-trend", "deactivated");
    trendNav.makeBar("mod", "ua-method-trend", "deactivated");
    trendNav.divEvents();
    return timeSeries;
  };

  function buildDashboard() {
    if (metaData.build) {
      const uaDataTranslated = applyBasicCauses(uaData, basicCauses);
      const chartParams = metaData;
      chartParams.systemName = addDashboardTitle(
        "unauthorized-activities-dashboard-title",
        lang,
        metaData.companyName,
        ` (${metaData.first_year}-${metaData.current_year})`
      );
      lang.dynamicText(chartParams, lang);
      const thisMap = uaMap(uaDataTranslated, filters, lang.dashboard);
      const bars = uaBar(uaDataTranslated, thisMap, lang.dashboard.pillTitles);
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
