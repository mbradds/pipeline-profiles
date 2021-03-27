import { visibility } from "../modules/util.js";
import { EventMap, EventNavigator, EventTrend } from "../modules/dashboard.js";

export async function mainIncidents(incidentData, metaData, lang) {
  const eventType = "incidents";
  const field = "Substance";
  const filters = { type: "frequency" };

  const setTitle = (lang, meta) => {
    try {
      document.getElementById(
        "incidents-dashboard-title"
      ).innerHTML = lang.title(meta.systemName);
    } catch (err) {
      document.getElementById(
        "incidents-dashboard-title"
      ).innerText = `Dashboard: Incidents with a product release`;
    }
  };

  const incidentBar = (data, map, langPillTitles) => {
    const barNav = new EventNavigator({
      plot: map,
      langPillTitles: langPillTitles,
      pillWidth: 124,
      data: data,
    });
    barNav.makeBar("Substance", "substance-bar", "activated", true);
    barNav.makeBar("Status", "status-bar", "deactivated", true);
    barNav.makeBar("Year", "year-bar", "deactivated", true);
    barNav.makeBar("Province", "province-bar", "deactivated", true);
    barNav.divEvents();
    return barNav;
  };

  const incidentMap = (field, filters, lang) => {
    const map = new EventMap({
      eventType: eventType,
      field: field,
      filters: filters,
      minRadius: 14000,
      leafletDiv: "incident-map",
      lang: lang,
    });
    map.addBaseMap();
    map.processEventsData(incidentData);
    map.lookForSize();
    return map;
  };

  const incidentTimeSeries = (field, filters, lang) => {
    const timeSeries = new EventTrend({
      eventType: eventType,
      field: field,
      filters: filters,
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
    if (!incidentData.length == 0) {
      try {
        // add the system name to metadata
        try {
          metaData.systemName = lang.companyToSystem[metaData.companyName];
        } catch (err) {
          metaData.systemName = metaData.companyName;
        }

        lang.dynamicText("system-incidents-paragraph", metaData);

        setTitle(lang, metaData);
        //generateDynamicIncidentText(metaData);
        const thisMap = incidentMap(field, filters, lang.dashboard);
        const bars = incidentBar(
          incidentData,
          thisMap,
          lang.dashboard.pillTitles
        );
        const trends = incidentTimeSeries(field, filters, lang);
        const volumeBtn = document.getElementById("incident-volume-btn");
        // user selection to show volume or incident frequency
        $("#inline_content input[name='type']").click(function () {
          var btnValue = $("input:radio[name=type]:checked").val();
          thisMap.filters.type = btnValue;
          trends.filters.type = btnValue;
          bars.switchY(btnValue);
          thisMap.updateRadius();
          if (btnValue !== "frequency") {
            thisMap.addMapDisclaimer("volume");
          } else {
            thisMap.removeMapDisclaimer("volume");
          }
        });
        if (incidentData.length == 1) {
          // if there is only one incident, then disable the select volume option
          volumeBtn.disabled = true;
        }

        // user selection to show map or trends
        $("#incident-view-type button").on("click", function () {
          $(".btn-incident-view-type > .btn").removeClass("active");
          $(this).addClass("active");
          var btnValue = $(this).val();
          var dashboardDivs = ["incident-map", "nearby-incidents-popup"].concat(
            bars.allDivs
          );
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
        $("#incident-range-slide").on("change", function () {
          let slide = $(this);
          let findIncidentBtn = document.getElementById("find-incidents-btn");
          let findIncidentTitle = document.getElementById(
            "find-incidents-title"
          );
          findIncidentBtn.innerText = `${
            lang.dashboard.findBtnTitle
          } ${slide.val()}km`;
          findIncidentTitle.innerText = `${
            lang.dashboard.rangeTitle
          } (${slide.val()}km):`;
          findIncidentBtn.value = slide.val();
        });

        // user selects a range to find nearby incidents
        $("#find-incidents-btn").on("click", function () {
          var resetBtn = document.getElementById("reset-incidents-btn");
          let range = document.getElementById("find-incidents-btn").value;
          if (!thisMap.user.latitude && !thisMap.user.longitude) {
            var loadDisclaimer = setTimeout(function () {
              thisMap.addMapDisclaimer("location");
            }, 200);
            thisMap
              .waitOnUser()
              .then((userAdded) => {
                thisMap.nearbyIncidents(range);
                clearTimeout(loadDisclaimer);
                thisMap.removeMapDisclaimer("location");
                resetBtn.disabled = false;
                resetBtn.className = "btn btn-primary col-md-12 notice-me-btn";
              })
              .catch((error) => {
                var incidentFlag = document.getElementById("nearby-flag");
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
        $("#reset-incidents-btn").on("click", function () {
          thisMap.resetMap();
          var resetBtn = document.getElementById("reset-incidents-btn");
          resetBtn.disabled = true;
          resetBtn.className = "btn btn-default col-md-12";
          document.getElementById("nearby-flag").innerHTML = ``;
        });
      } catch (err) {
        console.log(err);
      }
    } else {
      // no incidents data
      let noIncidents = document.getElementById("incidents-dashboard");
      let noIncidentsHTML = `<section class="alert alert-warning"><h3>${lang.noIncidents.header}</h3>`;
      noIncidentsHTML += `<p>${lang.noIncidents.note(
        metaData.companyName
      )}</p></section>`;
      noIncidents.innerHTML = noIncidentsHTML;
    }
  }
  return buildDashboard();
}
