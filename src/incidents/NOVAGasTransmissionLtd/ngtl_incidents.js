import { cerPalette } from "../../modules/util";
import incidentData from "./incidents_map.json";

export const ngtlIncidents = () => {
  const minRadius = 3000;
  function baseMap() {
    const baseZoom = [55, -119];
    var iMap = L.map("incident-map").setView(baseZoom, 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}", {
      foo: "bar",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(iMap);
    return iMap;
  }

  function addCircle(leaf, x, y, color, fillColor, r) {
    L.circle([x, y], {
      color: color,
      fillColor: fillColor,
      fillOpacity: 0.5,
      radius: r,
    }).addTo(leaf);
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
    data.map((row) => {
      addCircle(
        leaf,
        row.Latitude,
        row.Longitude,
        cerPalette["Night Sky"],
        cerPalette["Ocean"],
        findRadius(row)
      );
    });
    return leaf;
  }

  let imap = baseMap();
  imap = processIncidents(incidentData, imap, true);
};
