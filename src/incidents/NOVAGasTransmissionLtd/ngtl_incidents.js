import { cerPalette } from "../../modules/util";
import incidentData from "./incidents_map.json";

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
    var iMap = L.map("incident-map").setView(baseZoom, 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}", {
      foo: "bar",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(iMap);
    iMap.setMinZoom(5);
    return iMap;
  }

  function addCircle(x, y, color, fillColor, r, incidentParams = {}) {
    let toolTipText = `<div id="incident-tooltip"><p style="font-size:15px; text-align:center;"><b>${incidentParams["Incident Number"]}</b></p>`;
    toolTipText += `<table>`;
    toolTipText += `<tr><td>Substance:</td><td style="color:${fillColor}">${incidentParams.Substance}</td></tr>`;
    toolTipText += `<tr><td>Est. Release Volume:</td><td>${incidentParams["Approximate Volume Released"]} m3</td></tr>`;
    toolTipText += `</table>`;
    return L.circle([x, y], {
      color: color,
      fillColor: fillColor,
      fillOpacity: 0.7,
      radius: r,
      minRadius: minRadius,
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
    const radiusFunc = (applyVolume) => {
      if (applyVolume) {
        return (r) => r["Approximate Volume Released"] / 100;
      } else {
        return (r) => minRadius;
      }
    };

    let findRadius = radiusFunc(applyVolume);
    let allCircles = data.map((row) => {
      return addCircle(
        row.Latitude,
        row.Longitude,
        cerPalette["Cool Grey"],
        substanceColors[row.Substance],
        findRadius(row),
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

  // load inital dashboard
  let imap = baseMap();
  var circles;
  [imap, circles] = processIncidents(incidentData, imap, true);
  let bounds = circles.getBounds();
  imap.fitBounds(bounds, { maxZoom: 15 });
  console.log(circles);
  // update dashboard
  $("#incident-data-type button").on("click", function () {
    $(".btn-incident-data-type > .btn").removeClass("active");
    $(this).addClass("active");
    var thisBtn = $(this);
    var btnValue = thisBtn.val();
    if (btnValue == "volume") {
      updateRadius(circles, "radius");
    } else {
      updateRadius(circles, "minRadius");
    }
  });
};
