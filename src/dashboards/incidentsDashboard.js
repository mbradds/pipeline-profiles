import { EventMap } from "../modules/dashboard/EventMap.js";
import { EventNavigator } from "../modules/dashboard/EventNavigator.js";
import { EventTrend } from "../modules/dashboard/EventTrend.js";
import { loadChartError } from "../modules/util.js";
import { noEventsFlag } from "./dashboardUtil.js";

export async function mainIncidents(incidentData, metaData, lang) {
  const eventType = "incidents";
  const field = "sub"; // Substance
  const filters = { type: "frequency" };

  const setTitle = (language, meta) => {
    document.getElementById("incidents-dashboard-title").innerHTML =
      language.title(meta.systemName);
  };

  const incidentBar = (data, map, langPillTitles) => {
    const barNav = new EventNavigator({
      plot: map,
      numberOfPills: 4,
      langPillTitles,
      data,
    });
    barNav.makeBar("sub", "substance-bar", "activated");
    barNav.makeBar("s", "status-bar", "deactivated");
    barNav.makeBar("y", "year-bar", "deactivated");
    barNav.makeBar("p", "province-bar", "deactivated");
    barNav.divEvents();
    return barNav;
  };

  const incidentMap = (mapField, mapFilters, mapLang) => {
    const map = new EventMap({
      eventType,
      field: mapField,
      filters: mapFilters,
      minRadius: 14000,
      divId: "incidents-map",
      toolTipFields: ["vol", "what", "why"],
      lang: mapLang,
    });
    map.addBaseMap();
    map.processEventsData(incidentData);
    map.lookForSize();
    return map;
  };

  const incidentTimeSeries = (timeField, timeFilters) => {
    const timeSeries = new EventTrend({
      eventType,
      field: timeField,
      filters: timeFilters,
      data: incidentData,
      divId: "incidents-time-series",
      legendClickText: { enabled: true, text: lang.dashboard.legendClick },
      oneToMany: {
        what: true,
        why: true,
        category: true,
      },
      lang: lang.dashboard,
      definitions: lang.definitions,
    });

    const trendNav = new EventNavigator({
      plot: timeSeries,
      numberOfPills: 5,
      langPillTitles: { titles: lang.dashboard.pillTitles.titles }, // Remove click text from pill
    });

    trendNav.makeBar("sub", "substance-trend", "activated");
    trendNav.makeBar("s", "status-trend", "deactivated");
    trendNav.makeBar("what", "what-trend", "deactivated");
    trendNav.makeBar("why", "why-trend", "deactivated");
    trendNav.makeBar("p", "province-trend", "deactivated");
    trendNav.divEvents();

    return timeSeries;
  };

  /**
   *
   * @returns {Object} - {substance, what, why} Parameters that have id's substituted with correct language.
   */
  function langCommon() {
    const joinMultiple = (lst, sep = " & ") => {
      const langList = lst.join(sep);
      return langList;
    };

    const substance =
      lang.dashboard.seriesInfo.sub[
        metaData.mostCommonSubstance
      ].n.toLowerCase();

    let why = metaData.mostCommonWhy.map((e) =>
      lang.dashboard.seriesInfo.why[e].n.toLowerCase()
    );
    let what = metaData.mostCommonWhat.map((e) =>
      lang.dashboard.seriesInfo.what[e].n.toLowerCase()
    );

    why = joinMultiple(why);
    what = joinMultiple(what);

    return { substance, what, why };
  }

  function buildDashboard() {
    if (metaData.build) {
      const chartParams = metaData;
      // add the system name to chartParams
      if (
        Object.prototype.hasOwnProperty.call(
          lang.companyToSystem,
          metaData.companyName
        )
      ) {
        chartParams.systemName = lang.companyToSystem[metaData.companyName];
      } else {
        chartParams.systemName = metaData.companyName;
      }

      const langParams = langCommon();
      chartParams.mostCommonSubstance = langParams.substance;
      chartParams.mostCommonWhat = langParams.what;
      chartParams.mostCommonWhy = langParams.why;
      lang.dynamicText("system-incidents-paragraph", chartParams);

      setTitle(lang, chartParams);
      const thisMap = incidentMap(field, filters, lang.dashboard);
      const bars = incidentBar(
        incidentData,
        thisMap,
        lang.dashboard.pillTitles
      );
      const trends = incidentTimeSeries(field, filters);
      // user selection to show volume or incident frequency
      const volumeBtn = document.getElementById("incidents-volume-btn");
      document
        .getElementById("inline-radio")
        .addEventListener("click", (event) => {
          if (event.target && !volumeBtn.disabled && event.target.value) {
            const btnValue = event.target.value;
            thisMap.filters.type = btnValue;
            trends.filters.type = btnValue;
            bars.switchY(btnValue);
            thisMap.updateRadius();
            if (btnValue !== "frequency") {
              thisMap.addMapDisclaimer("volume");
            } else {
              thisMap.removeMapDisclaimer("volume");
            }
          }
        });

      if (incidentData.length === 1) {
        volumeBtn.disabled = true;
      }

      // user selection to show map or trends
      const countBtn = document.getElementById("incidents-count-btn");
      thisMap.switchDashboards(bars, countBtn, volumeBtn);

      // user selection for finding nearby incidents
      thisMap.nearbySlider(
        lang.dashboard.rangeTitle,
        lang.dashboard.findBtnTitle
      );

      // user wants to find nearby incidents
      thisMap.nearbyListener(lang.dashboard.locationError);

      // reset map after user has selected a range
      thisMap.resetCirclesListener();
    } else {
      noEventsFlag(
        lang.noEvents.header(lang.dashboard.eventName),
        lang.noEvents.note(
          lang.dashboard.eventName,
          lang.companyToSystem[metaData.companyName]
        ),
        "incidents-dashboard"
      );
    }
  }

  try {
    return buildDashboard();
  } catch (err) {
    return loadChartError("incidents-dashboard", lang.dashboardError);
  }
}
