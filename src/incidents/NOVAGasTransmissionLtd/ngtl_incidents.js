import { cerPalette, currentDate } from "../../modules/util";
import incidentData from "./incidents_map.json";
const haversine = require("haversine");

export const ngtlIncidents = () => {
  // TODO: add all substances present in the entire dataset, not just ngtl
  const substanceColors = {
    Propane: cerPalette["Forest"],
    "Natural Gas - Sweet": cerPalette["Flame"],
    "Fuel Gas": cerPalette["Sun"],
    "Lube Oil": cerPalette["hcPurple"],
  };
  const minRadius = 17000;
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

  function addCircle(x, y, color, fillColor, r, incidentParams = {}) {
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

    let toolTipText = `<div id="incident-tooltip"><p style="font-size:15px; text-align:center;"><b>${incidentParams["Incident Number"]}</b></p>`;
    toolTipText += `<table>`;
    toolTipText += `<tr><td>Substance:</td><td style="color:${fillColor}">&nbsp<b>${incidentParams.Substance}</b></td></tr>`;
    toolTipText += `<tr><td>Est. Release Volume:</td><td>&nbsp<b>${incidentParams["Approximate Volume Released"]} m3</b></td></tr>`;
    toolTipText += `<tr><td>What Happened?</td><td><b>${formatCommaList(
      incidentParams["What Happened"]
    )}</b></td></tr>`;
    toolTipText += `<tr><td>Why It Happened?</td><td><b>${formatCommaList(
      incidentParams["Why It Happened"]
    )}</b></td></tr>`;
    toolTipText += `</table>`;
    return L.circle([x, y], {
      color: color,
      fillColor: fillColor,
      fillOpacity: 0.7,
      radius: minRadius,
      minRadius: r,
      weight: 1,
      incidentParams,
    })
      .bindTooltip(toolTipText)
      .openTooltip();
    //.on("click", circleClick)
    // .on("mouseover", highlightFeature)
    // .on("mouseout", resetHighlight);
  }

  function processIncidents(data, thisMap) {
    let allCircles = data.map((row) => {
      return addCircle(
        row.Latitude,
        row.Longitude,
        cerPalette["Cool Grey"],
        substanceColors[row.Substance],
        row["Approximate Volume Released"] / 100,
        row
      );
    });
    let circles = L.featureGroup(allCircles).addTo(thisMap.map);
    thisMap.circles = circles;
    thisMap.map.on("zoom", function (e) {
      updateRadius(thisMap);
    });
    // return thisMap;
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
          layer.setRadius(minRadius / 2);
        });
      } else if (currZoom <= 6) {
        thisMap.circles.eachLayer(function (layer) {
          layer.setRadius(minRadius);
        });
      }
    }
  }

  function updateColor(circles, field) {
    circles.eachLayer(function (layer) {
      try {
        layer.setRadius(layer.options[r]);
      } catch (err) {
        layer.setRadius(0);
        console.log("Error setting new radius");
      }
    });
  }

  function findUser(thisMap) {
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
    return await findUser(thisMap);
  }

  function nearbyIncidents(thisMap, range) {
    console.log(thisMap.user);
  }
  const thisMap = {};
  thisMap.map = baseMap();
  thisMap.filters = { type: "frequency" };
  thisMap.user = { latitude: undefined, longitude: undefined };
  processIncidents(incidentData, thisMap); // this false determines if volume is shown on load
  let bounds = thisMap.circles.getBounds();
  thisMap.map.fitBounds(bounds, { maxZoom: 15 });
  // user selection to show volume or incident frequency
  $("#incident-data-type button").on("click", function () {
    $(".btn-incident-data-type > .btn").removeClass("active");
    $(this).addClass("active");
    var thisBtn = $(this);
    var btnValue = thisBtn.val();
    thisMap.filters.type = btnValue;
    updateRadius(thisMap);
  });

  // user selection for finding nearby incidents
  $("#incident-range-slide").on("change", function () {
    let slide = $(this);
    let findIncidentBtn = document.getElementById("find-incidents-btn");
    findIncidentBtn.innerText = `Find Incidents within ${slide.val()}km`;
    findIncidentBtn.value = slide.val();
  });

  $("#find-incidents-btn").on("click", function () {
    let range = document.getElementById("find-incidents-btn").value;
    if (!thisMap.user.latitude && !thisMap.user.longitude) {
      waitOnUser(thisMap).then((userAdded) => {
        nearbyIncidents(userAdded, range);
      });
    } else {
      nearbyIncidents(thisMap, range);
    }
  });
};
