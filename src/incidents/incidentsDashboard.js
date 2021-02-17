import { generateDynamicIncidentText } from "./dynamicText.js";
import { profileAssist as pa } from "../modules/util.js";
import { EventMap, EventNavigator, EventTrend } from "../modules/dashboard.js";

export async function mainIncidents(incidentData, metaData) {
  generateDynamicIncidentText(metaData);
  const eventType = "incidents";
  const field = "Substance";
  const filters = { type: "frequency" };
  const definitions = {
    Status: {
      Closed:
        "The CER’s incident review has been completed and the file is closed.",
      Submitted:
        "The company has submitted all of the required information and the CER is reviewing the incident.",
      "Initially Submitted":
        " The company has notified the CER that an incident has occurred and provided preliminary information. An investigation is has been initiated.",
    },
    "What Happened": {
      "Defect and Deterioration":
        "Defects in manufacturing processes or materials, or deterioration as a result of damage or service life limitations, lack of inspection or maintenance",
      "Corrosion and Cracking":
        "External corrosion or cracking caused by damage to coating systems or failed coating systems; weld cracking as a result of stress or workmanship issues; or internal corrosion as a result of contaminates in products",
      "Equipment Failure":
        "A failure of the pipeline’s equipment components. Examples of equipment include valves, electrical power systems and control systems",
      "Incorrect Operation":
        "Typically, personnel fail to follow procedures or use equipment improperly",
      "External Interference":
        "External activities that cause damage to the pipeline or components. Examples include excavation damage and vandalism",
      "Natural Force Damage":
        "Damage caused by natural forces, such as earthquakes, landslides and wash-outs",
      "Other Causes":
        "All other causes or when an incident’s circumstances could not be determined",
      "To be determined": "The CER is currently investigating what happened",
    },
    "Why It Happened": {
      "Engineering and Planning":
        "Failures of assessment, planning or monitoring that may be related to inadequate specifications or design criteria, evaluation of change, or implementation of controls",
      Maintenance:
        "Inadequate preventive maintenance or repairs, and excessive wear and tear",
      "Inadequate Procurement":
        "Failures in the purchasing, handling, transport and storage of materials",
      "Tools and Equipment":
        "Tools and equipment that are inadequate for the task or used improperly",
      "Standards and Procedures":
        "Inadequate development, communication, maintenance or monitoring of standards and procedures",
      "Failure in communication":
        "Loss of communication with automatic devices, equipment or people",
      "Inadequate Supervision":
        "Lack of oversight of a contractor or employee during construction or maintenance activities",
      "Human Factors":
        "Individual conduct or capability, or physical and psychological factors",
      "Natural or Environmental Forces":
        "External natural or environmental conditions",
      "To be determined": "The CER is currently investigating why it happened",
    },
  };

  const incidentBar = (data, map) => {
    const barNav = new EventNavigator({
      plot: map,
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

  const incidentMap = (field, filters) => {
    const map = new EventMap({
      eventType: eventType,
      field: field,
      filters: filters,
      minRadius: 14000,
      leafletDiv: "incident-map",
    });
    map.addBaseMap();
    map.processEventsData(incidentData);
    map.lookForSize();
    return map;
  };

  const incidentTimeSeries = (field, filters, definitions) => {
    const timeSeries = new EventTrend({
      eventType: eventType,
      field: field,
      filters: filters,
      data: incidentData,
      hcDiv: "time-series",
      definitions: definitions,
    });
    const trendNav = new EventNavigator({
      plot: timeSeries,
      height: 70,
    });

    trendNav.makeBar("Substance", "substance-trend", "activated", false);
    trendNav.makeBar("Status", "status-trend", "deactivated", false);
    trendNav.makeBar("What Happened", "what-trend", "deactivated", false);
    trendNav.makeBar("Why It Happened", "why-trend", "deactivated", false);
    trendNav.makeBar("Province", "province-trend", "deactivated", false);
    trendNav.divEvents();
    timeSeries.createChart();
    return timeSeries;
  };

  function buildDashboard() {
    try {
      const thisMap = incidentMap(field, filters);
      const bars = incidentBar(incidentData, thisMap);
      const trends = incidentTimeSeries(field, filters, definitions);
      // user selection to show volume or incident frequency
      $("#inline_content input[name='type']").click(function () {
        var btnValue = $("input:radio[name=type]:checked").val();
        if (btnValue !== "trends") {
          // update map radius for volume
          thisMap.filters.type = btnValue;
          trends.filters.type = btnValue;
          bars.switchY(btnValue);
          thisMap.updateRadius();
        }
      });

      // user selection to show map or trends
      $("#incident-view-type button").on("click", function () {
        $(".btn-incident-view-type > .btn").removeClass("active");
        $(this).addClass("active");
        var thisBtn = $(this);
        var btnValue = thisBtn.val();
        var dashboardDivs = ["incident-map", "nearby-incidents-popup"].concat(
          bars.allDivs
        );
        if (btnValue !== "trends") {
          pa.visibility(dashboardDivs, "show");
          pa.visibility(["time-series-section"], "hide");
          $("#incident-volume-btn").removeAttr("disabled");
        } else {
          // if the user selects trends, the option to view volume should be disabled
          $("#incident-volume-btn").attr("disabled", "disabled");
          $("#incident-count-btn").prop("checked", true).click();
          pa.visibility(dashboardDivs, "hide");
          pa.visibility(["time-series-section"], "show");
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
    } catch (err) {
      console.log(err);
    }
  }
  return buildDashboard();
}
