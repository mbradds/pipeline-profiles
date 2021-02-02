import { summaryParagraph } from "./summary.js";
import { visibility } from "../modules/util.js";
import { createTimeSeries } from "./overTime.js";
import { DashboardMap, DashboardNav } from "../modules/dashboard.js";

export const mainIncidents = (incidentData, metaData) => {
  const incidentBar = (data, map) => {
    const barNav = new DashboardNav(map, undefined, [], {});
    barNav.prepareData(data);
    barNav.makeBar("Substance", "substance-bar", "activated");
    barNav.makeBar("Status", "status-bar", "deactivated");
    barNav.makeBar("Province", "province-bar", "deactivated");
    barNav.makeBar("Year", "year-bar", "deactivated");
    barNav.divEvents();
    return barNav;
  };

  summaryParagraph(metaData);
  const filters = { type: "frequency" };
  const minRadius = 14000;
  const field = "Substance";
  const thisMap = new DashboardMap("incidents", filters, minRadius, field);
  thisMap.addBaseMap();
  thisMap.processIncidents(incidentData);
  const bars = incidentBar(incidentData, thisMap);
  thisMap.lookForSize();

  //add the time series to last button
  const ts = createTimeSeries(incidentData);

  // user selection to show volume or incident frequency
  $("#incident-data-type button").on("click", function () {
    $(".btn-incident-data-type > .btn").removeClass("active");
    $(this).addClass("active");
    var thisBtn = $(this);
    var btnValue = thisBtn.val();
    var dashboardDivs = ["incident-map", "nearby-incidents-popup"].concat(
      bars.allDivs
    );
    if (btnValue !== "time") {
      thisMap.filters.type = btnValue;
      bars.switchY(btnValue);
      thisMap.updateRadius();
      visibility(dashboardDivs, "show");
      visibility(["time-series"], "hide");
    } else {
      visibility(dashboardDivs, "hide");
      visibility(["time-series"], "show");
    }
  });

  // user selection for finding nearby incidents
  $("#incident-range-slide").on("change", function () {
    let slide = $(this);
    let findIncidentBtn = document.getElementById("find-incidents-btn");
    let findIncidentTitle = document.getElementById("find-incidents-title");
    findIncidentBtn.innerText = `Find Incidents within ${slide.val()}km`;
    findIncidentTitle.innerText = `Select Range (${slide.val()}km):`;
    findIncidentBtn.value = slide.val();
  });

  // user selects a range to find nearby incidents
  $("#find-incidents-btn").on("click", function () {
    document.getElementById("reset-incidents-btn").disabled = false;
    let range = document.getElementById("find-incidents-btn").value;
    if (!thisMap.user.latitude && !thisMap.user.longitude) {
      thisMap.waitOnUser().then((userAdded) => {
        thisMap.nearbyIncidents(range);
      });
    } else {
      thisMap.nearbyIncidents(range);
    }
  });

  // reset map after user has selected a range
  $("#reset-incidents-btn").on("click", function () {
    thisMap.resetMap();
    document.getElementById("reset-incidents-btn").disabled = true;
    document.getElementById("nearby-flag").innerHTML = ``;
  });
};
