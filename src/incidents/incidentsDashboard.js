import { cerPalette, conversions } from "../modules/util.js";
import { incidentBar } from "./nav_bar.js";
const haversine = require("haversine");

export const mainIncidents = (incidentData) => {
  // TODO: add all substances present in the entire dataset, not just ngtl
  const substanceColors = {
    Propane: cerPalette["Forest"],
    "Natural Gas - Sweet": cerPalette["Flame"],
    "Fuel Gas": cerPalette["Sun"],
    "Lube Oil": cerPalette["hcPurple"],
  };

  const statusColors = {
    "Initially Submitted": cerPalette["Flame"],
    Closed: cerPalette["Night Sky"],
    Submitted: cerPalette["Ocean"],
  };

  const provinceColors = {
    Alberta: cerPalette["Sun"],
    "British Columbia": cerPalette["Forest"],
  };

  function baseMap() {
    const baseZoom = [55, -119];
    var map = L.map("incident-map").setView(baseZoom, 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}", {
      foo: "bar",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    map.setMinZoom(5);
    return map;
  }

  function toolTip(thisMap, incidentParams, fillColor) {
    const formatCommaList = (text) => {
      if (text.includes(",")) {
        let itemList = text.split(",");
        let brokenText = ``;
        for (var i = 0; i < itemList.length; i++) {
          brokenText += "&nbsp- " + itemList[i] + "<br>";
        }
        return brokenText;
      } else {
        return "&nbsp" + text;
      }
    };

    let conv = conversions["m3 to bbl"];
    let toolTipText = `<div id="incident-tooltip"><p style="font-size:15px; font-family:Arial; text-align:center"><b>${incidentParams["Incident Number"]}</b></p>`;
    toolTipText += `<table>`;
    toolTipText += `<tr><td>${
      thisMap.field
    }:</td><td style="color:${fillColor}">&nbsp<b>${
      incidentParams[thisMap.field]
    }</b></td></tr>`;
    toolTipText += `<tr><td>Est. Release Volume:</td><td>&nbsp<b>${Highcharts.numberFormat(
      (incidentParams["Approximate Volume Released"] * conv).toFixed(2),
      2,
      "."
    )} bbl (${Highcharts.numberFormat(
      incidentParams["Approximate Volume Released"],
      2,
      "."
    )} m3)</b></td></tr>`;
    toolTipText += `<tr><td>What Happened?</td><td><b>${formatCommaList(
      incidentParams["What Happened"]
    )}</b></td></tr>`;
    toolTipText += `<tr><td>Why It Happened?</td><td><b>${formatCommaList(
      incidentParams["Why It Happened"]
    )}</b></td></tr>`;
    toolTipText += `</table></div>`;
    return toolTipText;
  }

  function addCircle(x, y, color, fillColor, r, thisMap, incidentParams = {}) {
    return L.circle([x, y], {
      color: color,
      fillColor: fillColor,
      fillOpacity: 0.7,
      radius: thisMap.minRadius,
      minRadius: r,
      weight: 1,
      incidentParams,
    })
      .bindTooltip(toolTip(thisMap, incidentParams, fillColor))
      .openTooltip();
  }

  function processIncidents(data, thisMap) {
    let years = []; //piggyback on data processing pass to get the year colors
    let colors = [
      cerPalette["Sun"],
      cerPalette["Night Sky"],
      "#1d5478",
      "#366687",
      "#507a96",
      "#698da5",
      "#82a0b4",
      "#9bb3c3",
      "#b4c6d2",
      "#cdd9e1",
      "#e6ecf0",
      "#ffffff",
    ];
    let allCircles = data.map((row) => {
      years.push(row.Year);
      return addCircle(
        row.Latitude,
        row.Longitude,
        cerPalette["Cool Grey"],
        thisMap.colors[thisMap.field][row[thisMap.field]],
        row["Approximate Volume Released"] / 100 + 2000,
        thisMap,
        row
      );
    });
    years = years.filter((v, i, a) => a.indexOf(v) === i); //get unique years
    years = years.sort(function (a, b) {
      return b - a;
    });
    let yearColors = {};
    years.map((yr, i) => {
      yearColors[yr] = colors[i];
    });
    thisMap.colors.Year = yearColors;
    let circles = L.featureGroup(allCircles).addTo(thisMap.map);
    thisMap.circles = circles;
    thisMap.map.on("zoom", function (e) {
      updateRadius(thisMap);
    });
  }

  function updateRadius(thisMap) {
    if (thisMap.filters.type == "volume") {
      thisMap.circles.eachLayer(function (layer) {
        try {
          layer.setRadius(layer.options["minRadius"]);
        } catch (err) {
          layer.setRadius(0);
          console.log("Error setting new radius");
        }
      });
    } else {
      let currZoom = thisMap.map.getZoom();
      if (currZoom >= 7) {
        thisMap.circles.eachLayer(function (layer) {
          layer.setRadius(thisMap.minRadius / 2);
        });
      } else if (currZoom <= 6) {
        thisMap.circles.eachLayer(function (layer) {
          layer.setRadius(thisMap.minRadius);
        });
      }
    }
  }

  async function findUser(thisMap) {
    return new Promise((resolve, reject) => {
      thisMap.map
        .locate({
          //setView: true,
          watch: false,
        }) /* This will return map so you can do chaining */
        .on("locationfound", function (e) {
          var marker = L.marker([e.latitude, e.longitude]).bindPopup(
            "Approximate location"
          );
          marker.id = "userLocation";
          thisMap.map.addLayer(marker);
          thisMap.user.latitude = e.latitude;
          thisMap.user.longitude = e.longitude;
          resolve(thisMap);
        })
        .on("locationerror", function (e) {
          reject(thisMap);
        });
    });
  }

  async function waitOnUser(thisMap) {
    try {
      return await findUser(thisMap);
    } catch (err) {
      var incidentFlag = document.getElementById("nearby-flag");
      incidentFlag.innerHTML = `<section class="alert alert-warning"><h4>Cant access your location.</h4>Try enabling your browser's location services and refresh the page.</section>`;
    }
  }

  function nearbyIncidents(thisMap, range) {
    var nearbyCircles = [];
    thisMap.circles.eachLayer(function (layer) {
      let incLoc = layer._latlng;
      let distance = haversine(thisMap.user, {
        latitude: incLoc.lat,
        longitude: incLoc.lng,
      });
      if (distance > range) {
        layer.setStyle({ fillOpacity: 0 });
      } else {
        nearbyCircles.push(layer);
        layer.setStyle({ fillOpacity: 0.7 });
      }
    });
    var incidentFlag = document.getElementById("nearby-flag");
    if (nearbyCircles.length > 0) {
      thisMap.nearby = L.featureGroup(nearbyCircles);
      let bounds = thisMap.nearby.getBounds();
      thisMap.map.fitBounds(bounds, { maxZoom: 15 });
      incidentFlag.innerHTML = `<section class="alert alert-info"><h4>There are ${nearbyCircles.length} incidents within ${range} km</h4>Summary: Coming Soon!</section>`;
    } else {
      incidentFlag.innerHTML = `<section class="alert alert-warning"><h4>No nearby incidents</h4>Try increasing the search range.</section>`;
    }
  }

  function resetMap(thisMap) {
    thisMap.circles.eachLayer(function (layer) {
      layer.setStyle({ fillOpacity: 0.7 });
    });
    thisMap.reZoom();
  }

  // main
  const thisMap = {};
  thisMap.map = baseMap();
  thisMap.filters = { type: "frequency" };
  thisMap.user = { latitude: undefined, longitude: undefined };
  thisMap.nearby = undefined;
  thisMap.minRadius = 14000;
  thisMap.field = "Substance";
  thisMap.colors = {
    Substance: substanceColors,
    Status: statusColors,
    Province: provinceColors,
  };
  processIncidents(incidentData, thisMap); // this false determines if volume is shown on load
  thisMap.reZoom = function () {
    let bounds = this.circles.getBounds();
    this.map.fitBounds(bounds, { maxZoom: 15 });
  };
  thisMap.fieldChange = function (newField) {
    let newColors = this.colors[newField];
    this.field = newField;
    this.circles.eachLayer(function (layer) {
      let newFill = newColors[layer.options.incidentParams[newField]];
      layer.setStyle({
        fillColor: newFill,
      });
      layer.bindTooltip(
        toolTip(thisMap, layer.options.incidentParams, newFill)
      );
    });
  };

  thisMap.reZoom();
  let bars = incidentBar(incidentData, thisMap);
  //when using html tabs, the leaflet map will get messed up when moving from display:none to display:block after a screen resize.
  function lookForSize() {
    var rezise = false;
    $(window).on("resize", function () {
      rezise = true;
    });
    $(".tab > .tablinks").on("click", function (e) {
      if (rezise && e.currentTarget.innerText == "Pipeline Incidents") {
        thisMap.map.invalidateSize(true, { pan: false, animate: false });
        rezise = false;
      }
    });
  }
  lookForSize();
  // user selection to show volume or incident frequency
  $("#incident-data-type button").on("click", function () {
    $(".btn-incident-data-type > .btn").removeClass("active");
    $(this).addClass("active");
    var thisBtn = $(this);
    var btnValue = thisBtn.val();
    thisMap.filters.type = btnValue;
    bars.switchY(btnValue);
    updateRadius(thisMap);
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
      waitOnUser(thisMap).then((userAdded) => {
        nearbyIncidents(userAdded, range);
      });
    } else {
      nearbyIncidents(thisMap, range);
    }
  });

  // reset map after user has selected a range
  $("#reset-incidents-btn").on("click", function () {
    resetMap(thisMap);
    document.getElementById("reset-incidents-btn").disabled = true;
    document.getElementById("nearby-flag").innerHTML = ``;
  });
};
