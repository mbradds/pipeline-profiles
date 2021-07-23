import { EventMap } from "../modules/dashboard/EventMap";
import { EventNavigator } from "../modules/dashboard/EventNavigator";
import { EventTrend } from "../modules/dashboard/EventTrend";
import { remediationText } from "../modules/dynamicText";
import { loadChartError } from "../modules/util";
import { noEventsFlag } from "./dashboardUtil";

export async function mainRemediation(data, lang) {
  const eventType = "remediation";
  const field = "w"; // within 30m of a water body
  const filters = { type: "frequency" };

  const setTitle = (language, meta) => {
    document.getElementById("remediation-dashboard-title").innerHTML =
      language.title(meta.systemName, meta.cutoffDate);
  };

  const remediationBar = (events, map, langPillTitles) => {
    const barNav = new EventNavigator({
      plot: map,
      numberOfPills: 4,
      langPillTitles,
      data: events,
    });
    barNav.makeBar("w", "rem-water-bar", "activated");
    barNav.makeBar("s", "rem-status-bar", "deactivated");
    barNav.makeBar("y", "rem-year-bar", "deactivated");
    barNav.makeBar("p", "rem-province-bar", "deactivated");
    barNav.divEvents();
    return barNav;
  };

  const remediationMap = (events, mapField, mapFilters, mapLang) => {
    const map = new EventMap({
      eventType,
      field: mapField,
      filters: mapFilters,
      minRadius: 14000,
      divId: "remediation-map",
      toolTipFields: ["vol", "use", "c"],
      lang: mapLang,
      regdocsClick: true,
    });
    map.addBaseMap();
    map.processEventsData(events);
    map.lookForSize();
    return map;
  };

  const remediationTimeSeries = (timeField, timeFilters) => {
    const ONETOMANY = {
      w: false,
      s: false,
      p: false,
      use: false,
    };
    const timeSeries = new EventTrend({
      eventType,
      field: timeField,
      filters: timeFilters,
      data: data.data,
      divId: "remediation-time-series",
      legendClickText: { enabled: true, text: lang.dashboard.legendClick },
      oneToMany: ONETOMANY,
      lang: lang.dashboard,
      // definitions: lang.definitions,
    });

    const trendNav = new EventNavigator({
      plot: timeSeries,
      numberOfPills: 5,
      langPillTitles: { titles: lang.dashboard.pillTitles.titles }, // Remove click text from pill
      fixedPillHeight: 72,
    });

    trendNav.makeBar("w", "rem-water-trend", "activated");
    trendNav.makeBar("s", "rem-status-trend", "deactivated");
    trendNav.makeBar("use", "rem-use-trend", "deactivated");
    trendNav.makeBar("a", "rem-activity-trend", "deactivated");
    trendNav.makeBar("p", "rem-province-trend", "deactivated");
    trendNav.divEvents();

    return timeSeries;
  };

  function buildDashboard() {
    if (data.data.length > 0) {
      const chartParams = data.meta;
      if (
        Object.prototype.hasOwnProperty.call(
          lang.companyToSystem,
          data.meta.company
        )
      ) {
        chartParams.systemName = lang.companyToSystem[data.meta.company];
      } else {
        chartParams.systemName = data.meta.company;
      }

      // add the cutoff date to the chartParams
      // const cutoffDate = new Date(2018, 9,15)
      chartParams.cutoffDate = lang.dateFormat(new Date(2018, 7, 15));
      remediationText(data.meta, lang);

      setTitle(lang, chartParams);
      const thisMap = remediationMap(data.data, field, filters, lang.dashboard);
      const bars = remediationBar(
        data.data,
        thisMap,
        lang.dashboard.pillTitles
      );

      remediationTimeSeries(field, filters);

      thisMap.switchDashboards(bars);
      thisMap.nearbySlider(
        lang.dashboard.rangeTitle,
        lang.dashboard.findBtnTitle
      );
      thisMap.nearbyListener(lang.dashboard.locationError);
      thisMap.resetCirclesListener();
    } else {
      noEventsFlag(
        lang.noEvents.header,
        lang.noEvents.note,
        data.meta.companyName,
        "remediation-dashboard"
      );
    }
  }
  try {
    return buildDashboard();
  } catch (err) {
    console.log(err)
    return loadChartError("remediation-dashboard", lang.dashboardError);
  }
}
