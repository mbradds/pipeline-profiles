import { cerPalette, conversions } from "../modules/util.js";
import { incidentBar } from "./nav_bar.js";
import { summaryParagraph } from "./summary.js";
const haversine = require("haversine");

class Dashboard {
  substanceColors = {
    Propane: cerPalette["Forest"],
    "Natural Gas - Sweet": cerPalette["Flame"],
    "Fuel Gas": cerPalette["Sun"],
    "Lube Oil": cerPalette["hcPurple"],
  };

  statusColors = {
    "Initially Submitted": cerPalette["Flame"],
    Closed: cerPalette["Night Sky"],
    Submitted: cerPalette["Ocean"],
  };

  provinceColors = {
    Alberta: cerPalette["Sun"],
    "British Columbia": cerPalette["Forest"],
  };

  constructor(eventType, filters, minRadius, field) {
    this.eventType = eventType;
    this.filters = filters;
    this.minRadius = minRadius;
    this.field = field;
    this.colors = this.setColors();
    this.user = { latitude: undefined, longitude: undefined };
  }

  setColors() {
    if (this.eventType == "incidents") {
      return {
        Substance: this.substanceColors,
        Status: this.statusColors,
        Province: this.provinceColors,
      };
    }
  }

  addBaseMap() {
    const baseZoom = [55, -119];
    var map = L.map("incident-map").setView(baseZoom, 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}", {
      foo: "bar",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    map.setMinZoom(5);
    this.map = map;
  }

  volumeText(m3) {
    let conv = conversions["m3 to bbl"];
    return `<tr><td>Est. Release Volume:</td><td>&nbsp<b>${Highcharts.numberFormat(
      (m3 * conv).toFixed(2),
      2,
      "."
    )} bbl (${Highcharts.numberFormat(m3, 2, ".")} m3)</b></td></tr>`;
  }

  toolTip(incidentParams, fillColor) {
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

    let toolTipText = `<div id="incident-tooltip"><p style="font-size:15px; font-family:Arial; text-align:center"><b>${incidentParams["Incident Number"]}</b></p>`;
    toolTipText += `<table>`;
    toolTipText += `<tr><td>${
      this.field
    }:</td><td style="color:${fillColor}">&nbsp<b>${
      incidentParams[this.field]
    }</b></td></tr>`;
    toolTipText += this.volumeText(
      incidentParams["Approximate Volume Released"]
    );
    toolTipText += `<tr><td>What Happened?</td><td><b>${formatCommaList(
      incidentParams["What Happened"]
    )}</b></td></tr>`;
    toolTipText += `<tr><td>Why It Happened?</td><td><b>${formatCommaList(
      incidentParams["Why It Happened"]
    )}</b></td></tr>`;
    toolTipText += `</table></div>`;
    return toolTipText;
  }

  addCircle(x, y, color, fillColor, r, incidentParams = {}) {
    return L.circle([x, y], {
      color: color,
      fillColor: fillColor,
      fillOpacity: 0.7,
      radius: this.minRadius,
      minRadius: r,
      weight: 1,
      incidentParams,
    });
  }

  updateRadius() {
    if (this.filters.type == "volume") {
      this.circles.eachLayer(function (layer) {
        try {
          layer.setRadius(layer.options["minRadius"]);
        } catch (err) {
          layer.setRadius(0);
          console.log("Error setting new radius");
        }
      });
    } else {
      let currZoom = this.map.getZoom();
      var minRadius = this.minRadius;
      if (currZoom >= 7) {
        this.circles.eachLayer(function (layer) {
          layer.setRadius(minRadius / 2);
        });
      } else if (currZoom <= 6) {
        this.circles.eachLayer(function (layer) {
          layer.setRadius(minRadius);
        });
      }
    }
  }

  processIncidents(data) {
    const radiusCalc = (maxVolume) => {
      if (maxVolume > 500) {
        return 150000;
      } else {
        return 100000;
      }
    };

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
    let volumes = data.map((row) => {
      return row["Approximate Volume Released"];
    });
    let [maxVol, minVol] = [Math.max(...volumes), Math.min(...volumes)];
    let maxRad = radiusCalc(maxVol);
    let allCircles = data.map((row) => {
      years.push(row.Year);
      let t = (row["Approximate Volume Released"] - minVol) / (maxVol - minVol);
      t = t * (maxRad - 5000) + 5000;
      return this.addCircle(
        row.Latitude,
        row.Longitude,
        cerPalette["Cool Grey"],
        this.colors[this.field][row[this.field]],
        t,
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
    this.colors.Year = yearColors;
    let circles = L.featureGroup(allCircles).addTo(this.map);
    this.circles = circles;
    let currentDashboard = this;
    this.map.on("zoom", function (e) {
      currentDashboard.updateRadius();
    });
  }

  async findUser() {
    return new Promise((resolve, reject) => {
      let currentDashboard = this;
      this.map
        .locate({
          //setView: true,
          watch: false,
        }) /* This will return map so you can do chaining */
        .on("locationfound", function (e) {
          var marker = L.marker([e.latitude, e.longitude], {
            draggable: true,
          }).bindPopup(
            "Approximate location. You can drag this marker around to explore incident events in other locations."
          );
          marker.on("drag", function (e) {
            var marker = e.target;
            var position = marker.getLatLng();
            currentDashboard.user.latitude = position.lat;
            currentDashboard.user.longitude = position.lng;
          });
          marker.id = "userLocation";
          currentDashboard.map.addLayer(marker);
          currentDashboard.user.latitude = e.latitude;
          currentDashboard.user.longitude = e.longitude;
          currentDashboard.user.layer = marker;
          resolve(currentDashboard);
        })
        .on("locationerror", function (e) {
          reject(currentDashboard);
        });
    });
  }

  async waitOnUser() {
    try {
      return await this.findUser();
    } catch (err) {
      var incidentFlag = document.getElementById("nearby-flag");
      incidentFlag.innerHTML = `<section class="alert alert-warning"><h4>Cant access your location.</h4>Try enabling your browser's location services and refresh the page.</section>`;
    }
  }

  nearbyIncidents(range) {
    var [nearbyCircles, allCircles] = [[], []];
    var currentDashboard = this;
    this.circles.eachLayer(function (layer) {
      allCircles.push(layer);
      let incLoc = layer._latlng;
      let distance = haversine(currentDashboard.user, {
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

    let userDummy = L.circle([this.user.latitude, this.user.longitude], {
      color: undefined,
      fillColor: undefined,
      fillOpacity: 0,
      radius: 1,
      weight: 1,
    });
    userDummy.addTo(this.map);

    if (nearbyCircles.length > 0) {
      this.nearby = L.featureGroup(nearbyCircles);
      let bounds = this.nearby.getBounds();
      bounds.extend(userDummy.getBounds());
      this.map.fitBounds(bounds, { maxZoom: 15 });
      // loop through the nearbyCircles and get some summary stats:
      let nearbyVolume = 0;
      this.nearby.eachLayer(function (layer) {
        nearbyVolume +=
          layer.options.incidentParams["Approximate Volume Released"];
      });
      incidentFlag.innerHTML = `<section class="alert alert-info"><h4>There are ${
        nearbyCircles.length
      } incidents within ${range} km</h4>\
      ${this.volumeText(nearbyVolume)}</section>`;
    } else {
      let userZoom = L.featureGroup(allCircles);
      let bounds = userZoom.getBounds();
      bounds.extend(userDummy.getBounds());
      this.map.fitBounds(bounds, { maxZoom: 15 });
      incidentFlag.innerHTML = `<section class="alert alert-warning"><h4>No nearby incidents</h4>Try increasing the search range.</section>`;
    }
  }

  reZoom() {
    let bounds = this.circles.getBounds();
    this.map.fitBounds(bounds, { maxZoom: 5 });
  }

  resetMap() {
    this.circles.eachLayer(function (layer) {
      layer.setStyle({ fillOpacity: 0.7 });
    });
    this.reZoom();
  }

  fieldChange(newField) {
    let newColors = this.colors[newField];
    this.field = newField;
    var currentDashboard = this;
    this.circles.eachLayer(function (layer) {
      let newFill = newColors[layer.options.incidentParams[newField]];
      layer.setStyle({
        fillColor: newFill,
      });
      layer.bindTooltip(
        currentDashboard.toolTip(layer.options.incidentParams, newFill)
      );
    });
  }

  lookForSize() {
    var currentDashboard = this;
    var resize = false;
    $(window).on("resize", function () {
      resize = true;
    });
    $(".tab > .tablinks").on("click", function (e) {
      currentDashboard.reZoom();
      if (resize) {
        currentDashboard.map.invalidateSize(true);
        resize = false;
      } else {
        currentDashboard.map.invalidateSize(false);
      }
    });
  }
}

export const mainIncidents = (incidentData, metaData) => {
  // TODO: add all substances present in the entire dataset, not just ngtl
  summaryParagraph(metaData);
  const filters = { type: "frequency" };
  const minRadius = 14000;
  const field = "Substance";
  const thisMap = new Dashboard("incidents", filters, minRadius, field);
  thisMap.addBaseMap();
  thisMap.processIncidents(incidentData);

  let bars = incidentBar(incidentData, thisMap);

  thisMap.lookForSize();
  // user selection to show volume or incident frequency
  $("#incident-data-type button").on("click", function () {
    $(".btn-incident-data-type > .btn").removeClass("active");
    $(this).addClass("active");
    var thisBtn = $(this);
    var btnValue = thisBtn.val();
    thisMap.filters.type = btnValue;
    bars.switchY(btnValue);
    thisMap.updateRadius();
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
