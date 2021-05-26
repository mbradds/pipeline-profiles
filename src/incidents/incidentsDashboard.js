import { visibility } from "../modules/util";
import { EventMap } from "../modules/dashboard/EventMap";
import { EventNavigator } from "../modules/dashboard/EventNavigator";
import { EventTrend } from "../modules/dashboard/EventTrend";

export async function mainIncidents(incidentData, metaData, lang) {
  const eventType = "incidents";
  const field = "sub"; // Substance
  const filters = { type: "frequency" };

  const setTitle = (language, meta) => {
    try {
      document.getElementById("incidents-dashboard-title").innerHTML =
        language.title(meta.systemName);
    } catch (err) {
      document.getElementById(
        "incidents-dashboard-title"
      ).innerText = `Dashboard: Incidents with a product release`;
    }
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
      divId: "incident-map",
      lang: mapLang,
    });
    map.addBaseMap();
    map.processEventsData(incidentData);
    map.lookForSize();
    return map;
  };

  const incidentTimeSeries = (timeField, timeFilters) => {
    const ONETOMANY = {
      sub: false,
      s: false,
      p: false,
      what: true,
      why: true,
      category: true,
    };
    const timeSeries = new EventTrend({
      eventType,
      field: timeField,
      filters: timeFilters,
      data: incidentData,
      divId: "time-series",
      legendClickText: { enabled: true, text: lang.dashboard.legendClick },
      oneToMany: ONETOMANY,
      lang: lang.dashboard,
      definitions: lang.definitions,
    });

    const trendNav = new EventNavigator({
      plot: timeSeries,
      numberOfPills: 5,
      langPillTitles: { titles: lang.dashboard.pillTitles.titles }, // Remove click text from pill
      fixedPillHeight: 70,
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
    if (incidentData.length > 0) {
      try {
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

        const langParams = langCommon(chartParams, metaData);
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
        const volumeBtn = document.getElementById("incident-volume-btn");
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
          // if there is only one incident, then disable the select volume option
          volumeBtn.disabled = true;
        }

        // user selection to show map or trends
        const countBtn = document.getElementById("incident-count-btn");
        document
          .getElementById("incident-view-type")
          .addEventListener("click", (event) => {
            const evt = event;
            const allButtons = document.querySelectorAll(
              `#incident-view-type .btn`
            );
            allButtons.forEach((elem) => {
              const e = elem;
              e.className = elem.className.replace(" active", "");
            });
            evt.target.className += " active";
            const btnValue = evt.target.value;
            const dashboardDivs = [
              "incident-map",
              "nearby-incidents-popup",
            ].concat(bars.allDivs);
            if (btnValue !== "trends") {
              visibility(dashboardDivs, "show");
              visibility(["time-series-section"], "hide");
              volumeBtn.disabled = false;
              thisMap.map.invalidateSize(true); // fixes problem when switching from trends to map after changing tabs
              countBtn.click();
            } else {
              // if the user selects trends, the option to view volume should be disabled
              volumeBtn.disabled = true;
              countBtn.checked = true;
              visibility(dashboardDivs, "hide");
              visibility(["time-series-section"], "show");
            }
          });

        // user selection for finding nearby incidents
        const slider = document.getElementById("incident-range-slide");

        slider.addEventListener("change", () => {
          const currentValue = slider.value;
          const findIncidentBtn = document.getElementById("find-incidents-btn");
          const findIncidentTitle = document.getElementById(
            "find-incidents-title"
          );
          findIncidentBtn.innerText = `${lang.dashboard.findBtnTitle} ${currentValue}km`;
          findIncidentTitle.innerText = `${lang.dashboard.rangeTitle} (${currentValue}km):`;
          findIncidentBtn.value = currentValue;
        });

        // user selects a range to find nearby incidents
        document
          .getElementById("find-incidents-btn")
          .addEventListener("click", () => {
            const resetBtn = document.getElementById("reset-incidents-btn");
            const range = document.getElementById("find-incidents-btn").value;
            if (!thisMap.user.latitude && !thisMap.user.longitude) {
              const loadDisclaimer = setTimeout(() => {
                thisMap.addMapDisclaimer("location");
              }, 200);
              thisMap
                .waitOnUser()
                .then(() => {
                  thisMap.nearbyIncidents(range); // .then((userAdded))
                  clearTimeout(loadDisclaimer);
                  thisMap.removeMapDisclaimer("location");
                  resetBtn.disabled = false;
                  resetBtn.className =
                    "btn btn-primary col-md-12 notice-me-btn";
                })
                .catch(() => {
                  const incidentFlag = document.getElementById("nearby-flag"); // .catch((error))
                  incidentFlag.innerHTML = `<section class="alert alert-warning">${lang.dashboard.locationError}</section>`;
                  clearTimeout(loadDisclaimer);
                  thisMap.removeMapDisclaimer("location");
                });
            } else {
              thisMap.nearbyIncidents(range);
              resetBtn.disabled = false;
              resetBtn.className = "btn btn-primary col-md-12 notice-me-btn";
            }
          });

        // reset map after user has selected a range
        document
          .getElementById("reset-incidents-btn")
          .addEventListener("click", () => {
            thisMap.resetMap();
            const resetBtn = document.getElementById("reset-incidents-btn");
            resetBtn.disabled = true;
            resetBtn.className = "btn btn-default col-md-12";
            document.getElementById("nearby-flag").innerHTML = ``;
          });
      } catch (err) {
        console.log(err);
      }
    } else {
      // no incidents data
      const noIncidents = document.getElementById("incidents-dashboard");
      let noIncidentsHTML = `<section class="alert alert-warning"><h3>${lang.noIncidents.header}</h3>`;
      noIncidentsHTML += `<p>${lang.noIncidents.note(
        metaData.companyName
      )}</p></section>`;
      noIncidents.innerHTML = noIncidentsHTML;
    }
  }
  return buildDashboard();
}
