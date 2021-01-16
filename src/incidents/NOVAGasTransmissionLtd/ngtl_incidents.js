import { cerPalette } from "../../modules/util";
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
  const minRadius = 15000;
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
    // .on("click", circleClick)
    // .on("mouseover", highlightFeature)
    // .on("mouseout", resetHighlight);
  }

  function processIncidents(data, leaf, applyVolume = false) {
    // const radiusFunc = (applyVolume) => {
    //   if (applyVolume) {
    //     return (r) => r["Approximate Volume Released"] / 100;
    //   } else {
    //     return (r) => minRadius;
    //   }
    // };
    // let findRadius = radiusFunc(applyVolume);
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
    let circles = L.featureGroup(allCircles).addTo(leaf);
    return [leaf, circles];
  }

  function updateRadius(circles, r = "minRadius") {
    circles.eachLayer(function (layer) {
      try {
        layer.setRadius(layer.options[r]);
      } catch (err) {
        layer.setRadius(0);
        console.log("Error setting new radius");
      }
    });
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

  function findUser(leaf) {
    return leaf
      .locate({
        //setView: true,
        watch: true,
      }) /* This will return map so you can do chaining */
      .on("locationfound", function (e) {
        var marker = L.marker([e.latitude, e.longitude]).bindPopup(
          "Approximate location"
        );
        marker.id = "userLocation";
        leaf.addLayer(marker);
        leaf.options.user = { latitude: e.latitude, longitude: e.longitude };
      })
      .on("locationerror", function (e) {
        console.log(e);
      });
  }

  function nearbyIncidents(leaf) {}

  // load inital dashboard
  var imap = baseMap();
  var circles;
  [imap, circles] = processIncidents(incidentData, imap, false); // this false determines if volume is shown on load
  let bounds = circles.getBounds();
  imap.fitBounds(bounds, { maxZoom: 15 });
  console.log(circles);
  // user selection to show volume or incident frequency
  $("#incident-data-type button").on("click", function () {
    $(".btn-incident-data-type > .btn").removeClass("active");
    $(this).addClass("active");
    var thisBtn = $(this);
    var btnValue = thisBtn.val();
    if (btnValue == "volume") {
      updateRadius(circles, "minRadius");
    } else {
      updateRadius(circles, "radius");
    }
  });

  // user selection for finding nearby incidents
  $("#incident-range-slide").on("change", function () {
    let slide = $(this);
    let findIncidentBtn = document.getElementById("find-incidents-btn");
    findIncidentBtn.innerText = `Find Incidents within ${slide.val()}km`;
    findIncidentBtn.value = slide.val();
  });

  //var userLoc = null;
  $("#find-incidents-btn").on("click", function () {
    let range = document.getElementById("find-incidents-btn").value;
    if (!imap.options.user) {
      imap = findUser(imap);
    }
    //console.log(userLoc);
    //imap = getUserLocation(imap);
    //console.log(imap);
  });
};
