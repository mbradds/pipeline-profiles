import { EventMap } from "../modules/dashboard/EventMap";
import { EventNavigator } from "../modules/dashboard/EventNavigator";
// import { visibility } from "../modules/util";
// import { EventTrend } from "../modules/dashboard/EventTrend";

export async function mainRemediation(data, lang) {
  // console.log(data);
  const eventType = "remediation";
  const field = "w"; // within 30m of a water body
  const filters = { type: "frequency" };

  const setTitle = (language, meta) => {
    document.getElementById("remediation-dashboard-title").innerHTML =
      language.title(meta.systemName);
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
      toolTipFields: ["vol"],
      lang: mapLang,
    });
    map.addBaseMap();
    map.processEventsData(events);
    map.lookForSize();
    return map;
  };

  function buildDashboard() {
    if (data.data.length > 0) {
      const chartParams = data.meta;
      // add the system name to chartParams
      if (
        Object.prototype.hasOwnProperty.call(
          lang.companyToSystem,
          data.meta.companyName
        )
      ) {
        chartParams.systemName = lang.companyToSystem[data.meta.companyName];
      } else {
        chartParams.systemName = data.meta.companyName;
      }

      setTitle(lang, chartParams);
      try {
        const thisMap = remediationMap(
          data.data,
          field,
          filters,
          lang.dashboard
        );
        const bars = remediationBar(
          data.data,
          thisMap,
          lang.dashboard.pillTitles
        );
      } catch (err) {
        console.log(err);
      }
    }
  }
  return buildDashboard();
}
