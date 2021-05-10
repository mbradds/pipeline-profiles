import { visibility } from "../modules/util";
import { EventMap, EventNavigator, EventTrend } from "../modules/dashboard";

export async function mainIncidents(incidentData, metaData, lang) {
  const eventType = "incidents";
  const field = "Substance";
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
      langPillTitles,
      pillWidth: 124,
      data,
    });
    barNav.makeBar("Substance", "substance-bar", "activated", true);
    barNav.makeBar("Status", "status-bar", "deactivated", true);
    barNav.makeBar("Year", "year-bar", "deactivated", true);
    barNav.makeBar("Province", "province-bar", "deactivated", true);
    barNav.divEvents();
    return barNav;
  };

  const incidentMap = (mapField, mapFilters, mapLang) => {
    const map = new EventMap({
      eventType,
      field: mapField,
      filters: mapFilters,
      minRadius: 14000,
      leafletDiv: "incident-map",
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
      hcDiv: "time-series",
      lang: lang.dashboard,
      definitions: lang.definitions,
    });
    const trendNav = new EventNavigator({
      plot: timeSeries,
      langPillTitles: lang.dashboard.pillTitles,
      height: 70,
    });

    trendNav.makeBar("Substance", "substance-trend", "activated", false);
    trendNav.makeBar("Status", "status-trend", "deactivated", false);
    trendNav.makeBar("what", "what-trend", "deactivated", false);
    trendNav.makeBar("why", "why-trend", "deactivated", false);
    trendNav.makeBar("Province", "province-trend", "deactivated", false);
    trendNav.divEvents();
    timeSeries.createChart();
    return timeSeries;
  };

  function buildDashboard() {
    if (incidentData.length > 0) {
      try {
        const chartParams = metaData;
        // add the system name to metadata
        try {
          chartParams.systemName = lang.companyToSystem[metaData.companyName];
        } catch (err) {
          chartParams.systemName = metaData.companyName;
        }

        lang.dynamicText("system-incidents-paragraph", chartParams);

        setTitle(lang, chartParams);
        const thisMap = incidentMap(field, filters, lang.dashboard);
        const bars = incidentBar(
          incidentData,
          thisMap,
          lang.dashboard.pillTitles
        );
        const trends = incidentTimeSeries(field, filters);
        const volumeBtn = document.getElementById("incident-volume-btn");
        // user selection to show volume or incident frequency
        document
          .getElementById("inline-radio")
          .addEventListener("click", (event) => {
            if (event.target) {
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
            } else {
              // if the user selects trends, the option to view volume should be disabled
              volumeBtn.disabled = true;
              const countBtn = document.getElementById("incident-count-btn");
              countBtn.checked = true;
              countBtn.click();
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
