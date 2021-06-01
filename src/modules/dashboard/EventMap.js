/**
 * @file Contains class definition for leaflet map portion of an event dashboard. Commonly used with an EventNavigator to update the map.
 *
 * The leaflet map has the following functionality:
 * - Locate events near the user.
 * - Switch between event frequency (same size bubbles) and "volume" (different bubble size).
 * - Switch between data "columns" when paired with an EventNavigator.
 * - Reset zoom.
 * - Dynamic tooltip displaying the currently selected, or default data column value.
 */

import markerIconPng from "leaflet/dist/images/marker-icon.png";
import { Icon } from "leaflet";
import { cerPalette, conversions, leafletBaseMap } from "../util";

const haversine = require("haversine");

/**
 * Class defining functionality for a leaflet map that can update colors, tooltip, show events close to user location, etc.
 */
export class EventMap {
  /**
   * New leaflet map displaying lat/long as circles with a default metric shown as filled circle colors.
   * @param {Object} constr - EventMap constructor.
   * @param {string} constr.eventType - Short name for the dataset, eg: incidents (lowercase).
   * @param {(string|undefined)} [constr.field=undefined] - The initial data column to display on the map.
   * @param {(Object|undefined)} [constr.filters=undefined] - Initial data "values" to show eg: {type: "frequency"} or {type: "volume" }
   * @param {(number|undefined)} [constr.minRadius=undefined] - Minimum radius for leaflet map circles.
   * @param {string} [constr.divId="map"] - HTML div id where map will be loaded.
   * @param {number[]} [constr.initZoomTo=[55, -119]] - Set to the middle of Canada, just North of Winnipeg.
   * @param {Object} constr.lang - En/Fr language object from ./langEnglish.js or ./langFrench.js
   */

  constructor({
    eventType,
    field = undefined,
    filters = undefined,
    minRadius = undefined,
    divId = "map",
    initZoomTo = [55, -119],
    toolTipFields = [],
    lang = {},
  }) {
    this.eventType = eventType;
    this.filters = filters;
    this.minRadius = minRadius;
    this.colors = lang.seriesInfo;
    this.field = field;
    this.initZoomTo = initZoomTo;
    this.user = { latitude: undefined, longitude: undefined };
    this.divId = divId;
    this.toolTipFields = toolTipFields;
    this.lang = lang;
    this.mapDisclaimer = undefined;
    this.findPlotHeight();
  }

  findPlotHeight() {
    try {
      this.plotHeight = document.getElementById(this.divId).clientHeight;
    } catch (err) {
      this.plotHeight = 0;
    }
  }

  /**
   * Generate a blank leaflet base map using src/modules/util/leafletBaseMap() method.
   */
  addBaseMap() {
    this.map = leafletBaseMap({
      div: this.divId,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      zoomControl: true,
      initZoomTo: this.initZoomTo,
      initZoomLevel: 5,
      minZoom: 4,
    });
  }

  static getState(substance) {
    if (!substance) {
      return "other";
    }
    const shortSubstance = substance.split("-")[0].trim();
    const state = {
      pro: "gas",
      ngsweet: "gas",
      fgas: "liquid",
      loil: "liquid",
      cosweet: "liquid",
      cosour: "liquid",
      sco: "liquid",
      diesel: "liquid",
      gas: "liquid",
      ngl: "gas",
      co: "liquid",
      Other: "other",
      Autre: "other",
    };
    return state[shortSubstance];
  }

  /**
   * Used in the map tooltip, and the nearby panel to differentiate liquid vs gas units.
   * @param {number} m3 - Volumes come in m3 by default.
   * @param {string} substance - Short substance id defined in EventMap.getState(), and this.processEventsData(data)
   * @param {boolean} gas - Overrides state definition.
   * @param {boolean} liquid - Overrides state definition.
   * @param {boolean} other - Overrides state definition.
   * @returns {string} - Formatted En/Fr string displaying the imperial volumn, units and metric.
   */
  volumeText(m3, substance, gas = false, liquid = false, other = false) {
    if (m3 && m3 >= 0) {
      const convLiquid = conversions["m3 to bbl"];
      const convGas = conversions["m3 to cf"];
      let state = "other";
      if (!gas && !liquid && !other) {
        state = EventMap.getState(substance);
      } else if (!gas && liquid && !other) {
        state = "liquid";
      } else if (gas && !liquid && !other) {
        state = "gas";
      }

      let digits = 2;
      if (m3 > 50) {
        digits = 0;
      } else if (m3 < 5) {
        digits = 3;
      }

      if (state !== "other") {
        let imperial;
        if (state === "gas") {
          imperial = `${this.lang.numberFormat(m3 * convGas, digits)} ${
            this.lang.cf
          }`;
        } else {
          imperial = `${this.lang.numberFormat(m3 * convLiquid, digits)} ${
            this.lang.bbl
          }`;
        }

        return `${imperial} (${Highcharts.numberFormat(m3, digits)} m3)`;
      }
      return `${Highcharts.numberFormat(m3, digits)} m3`;
    }

    return ``;
  }

  /**
   *
   * @param {string} type - Can be either "volume" or "location".
   * volume disclaimer toggles text explaining that bubble size doesnt correspond to event area.
   * location disclaimer toggles text indicating that location services are pending.
   */
  addMapDisclaimer(type = "volume") {
    const disclaimerL = (map, position, alertStyle, text) => {
      const info = L.control({ position });
      info.onAdd = function () {
        const disclaimerDiv = L.DomUtil.create("div", "map-disclaimer");
        disclaimerDiv.innerHTML = `<div class="alert ${alertStyle}" style="padding:3px; max-width:670px"><p>${text}</p></div>`;
        return disclaimerDiv;
      };
      info.addTo(map);
      return info;
    };
    if (type === "volume") {
      if (!this.mapVolumeDisclaimer) {
        this.mapVolumeDisclaimer = disclaimerL(
          this.map,
          "topright",
          "alert-warning",
          this.lang.volumeDisclaimer
        );
      }
    } else if (type === "location") {
      if (!this.mapLocationDisclaimer) {
        this.mapLocationDisclaimer = disclaimerL(
          this.map,
          "bottomleft",
          "alert-info",
          this.lang.locationDisclaimer
        );
      }
    }
  }

  removeMapDisclaimer(type = "volume") {
    if (type === "volume") {
      if (this.mapVolumeDisclaimer) {
        this.mapVolumeDisclaimer.remove();
        this.mapVolumeDisclaimer = undefined;
      }
    } else if (type === "location") {
      if (this.mapLocationDisclaimer) {
        this.mapLocationDisclaimer.remove();
        this.mapVolumeDisclaimer = undefined;
      }
    }
  }

  toolTip(eventParams, fillColor) {
    const formatCommaList = (text, names) => {
      if (typeof text !== "string" && text.length > 1) {
        const itemList = text;
        let brokenText = ``;
        for (let i = 0; i < itemList.length; i += 1) {
          brokenText += `&nbsp- ${names[itemList[i]].n}<br>`;
        }
        return brokenText;
      }
      return `&nbsp${names[text].n}`;
    };

    let rowName = "";
    if (
      Object.prototype.hasOwnProperty.call(
        this.lang.pillTitles.titles,
        this.field
      )
    ) {
      rowName = this.lang.pillTitles.titles[this.field];
    } else {
      rowName = this.field;
    }

    const bubbleName = this.colors[this.field][eventParams[this.field]].n;
    let toolTipText = `<div class="map-tooltip"><p style="font-size:15px; font-family:Arial; text-align:center"><strong>${eventParams.id}</strong></p>`;
    toolTipText += `<table>`;
    toolTipText += `<tr><td>${rowName}</td><td style="color:${fillColor}">&nbsp<strong>${bubbleName}</strong></td></tr>`;

    this.toolTipFields.forEach((toolCol) => {
      if (toolCol === "vol") {
        if (eventParams.vol && eventParams.vol >= 0) {
          toolTipText += `<tr><td>${
            this.lang.estRelease
          }</td><td>&nbsp<strong>${this.volumeText(
            eventParams.vol,
            eventParams.sub
          )}</strong></td></tr>`;
        }
      } else {
        toolTipText += `<tr><td>${
          this.lang[toolCol]
        }?</td><td><strong>${formatCommaList(
          eventParams[toolCol],
          this.colors[toolCol]
        )}</strong></td></tr>`;
      }
    });

    return toolTipText;
  }

  addCircle(x, y, color, fillColor, r, incidentParams = {}) {
    return L.circle([x, y], {
      color,
      fillColor,
      fillOpacity: 0.7,
      radius: this.minRadius,
      volRadius: r,
      weight: 1,
      incidentParams,
    });
  }

  /**
   * Looks at the current map zoom and divides or multiplies the circle radius to accomodate.
   * If this.filters.type is set to "volume", radius is set to "area".
   */
  updateRadius() {
    if (this.filters.type === "volume") {
      this.circles.eachLayer((layer) => {
        try {
          layer.setRadius(layer.options.volRadius);
        } catch (err) {
          layer.setRadius(this.minRadius);
          console.warn("Error setting new radius");
        }
      });
    } else {
      const currZoom = this.map.getZoom();
      const { minRadius } = this;
      if (currZoom >= 5 && currZoom <= 6.5) {
        this.circles.eachLayer((layer) => {
          layer.setRadius(minRadius);
        });
      } else if (currZoom <= 4.5) {
        this.circles.eachLayer((layer) => {
          layer.setRadius(minRadius * 2);
        });
      } else if (currZoom > 6.5) {
        let zoomFactor = currZoom - 6;
        if (currZoom > 11.5) {
          zoomFactor += 8;
        }
        if (zoomFactor < 2) {
          zoomFactor = 2;
        }
        this.circles.eachLayer((layer) => {
          layer.setRadius(minRadius / zoomFactor);
        });
      }
    }
  }

  applyColor(rowValue, field) {
    try {
      return this.colors[field][rowValue].c;
    } catch (err) {
      return undefined;
    }
  }

  /**
   *
   * @param {Object[]} data - JSON style array containing georeferenced "event" data.
   * Input data should have a format that follows this pattern:
   * [{
   *  id: string,
   *  Variable1: string,
   *  VariableN: string,
   *  y: number //Year
   *  loc: [number, number]
   * }]
   */
  processEventsData(data) {
    const radiusCalc = (maxVolume) => {
      if (maxVolume > 500) {
        return 150000;
      }
      return 100000;
    };

    let years = []; // piggyback on data processing pass to get the year colors
    const colors = [
      cerPalette.Sun,
      "#022034",
      "#043454",
      "#043a5e",
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
    const volumes = data.map((row) => row.vol);
    const [maxVol, minVol] = [Math.max(...volumes), Math.min(...volumes)];
    const maxRad = radiusCalc(maxVol);
    let allCircles = data.map((row) => {
      years.push(row.y);
      let radiusVol = (row.vol - minVol) / (maxVol - minVol);
      radiusVol = Math.sqrt(radiusVol / Math.PI) * maxRad + 1000;
      if (row.loc[0] && row.loc[0] > 0) {
        return this.addCircle(
          row.loc[0],
          row.loc[1],
          cerPalette["Cool Grey"],
          this.applyColor(row[this.field], this.field), // fillColor
          radiusVol,
          row
        );
      }
      return false;
    });
    allCircles = allCircles.filter((circle) => circle !== false);
    years = years.filter((v, i, a) => a.indexOf(v) === i); // get unique years
    years = years.sort((a, b) => b - a);
    const yearColors = {};
    years.forEach((yr, i) => {
      yearColors[yr] = { c: colors[i], n: yr };
    });
    this.colors.y = yearColors;
    this.circles = L.featureGroup(allCircles).addTo(this.map);
    const currentDashboard = this;
    this.map.on("zoom", () => {
      currentDashboard.updateRadius();
    });
  }

  async findUser() {
    return new Promise((resolve, reject) => {
      const currentDashboard = this;
      this.map
        .locate({
          // setView: true,
          watch: false,
        }) /* This will return map so you can do chaining */
        .on("locationfound", (e) => {
          const marker = L.marker([e.latitude, e.longitude], {
            icon: new Icon({
              iconUrl: markerIconPng,
              iconSize: [25, 41],
              iconAnchor: [12, 41],
            }),
            draggable: true,
          }).bindPopup(currentDashboard.lang.userPopUp);
          marker.on("drag", (d) => {
            const position = d.target.getLatLng();
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
        .on("locationerror", (err) => {
          console.log("locationerror in findUser method");
          reject(err);
        });
    });
  }

  /**
   * Request user latitude and longitude prior to nearby analysis.
   * @returns {Promise} - Promise object resolved if user location is accepted. User lat/long is stored in EventMap.user.latitude & EventMap.user.longitude
   */
  async waitOnUser() {
    // this promise is handled one level above in ../indidents/incidentDashboard.js
    return this.findUser();
  }

  /**
   *
   * @param {number} range - User input range in kilometers (from range slider) to compare with distance between user and all events.
   */
  nearbyIncidents(range) {
    const [nearbyCircles, allCircles] = [[], []];
    const currentDashboard = this;
    this.circles.eachLayer((layer) => {
      allCircles.push(layer);
      const incLoc = layer._latlng;
      const distance = haversine(currentDashboard.user, {
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

    const userDummy = L.circle([this.user.latitude, this.user.longitude], {
      color: undefined,
      fillColor: undefined,
      fillOpacity: 0,
      radius: 1,
      weight: 1,
    });
    userDummy.addTo(this.map);

    const incidentFlag = document.getElementById("nearby-flag");

    if (nearbyCircles.length > 0) {
      this.nearby = L.featureGroup(nearbyCircles);
      const bounds = this.nearby.getBounds();
      bounds.extend(userDummy.getBounds());
      this.map.fitBounds(bounds, { maxZoom: 15 });
      // loop through the nearbyCircles and get some summary stats:
      let [nearbyGas, nearbyLiquid, nearbyOther] = [0, 0, 0];
      // const currentDashboard = this;
      this.nearby.eachLayer((layer) => {
        const layerState = EventMap.getState(layer.options.incidentParams.sub);
        if (layerState === "gas") {
          nearbyGas += layer.options.incidentParams.vol;
        } else if (layerState === "liquid") {
          nearbyLiquid += layer.options.incidentParams.vol;
        } else {
          nearbyOther += layer.options.incidentParams.vol;
        }
      });
      let nearbyText = `<section class="alert alert-info"><h4>${this.lang.nearbyHeader(
        nearbyCircles.length,
        range
      )}</h4><table>`;
      nearbyText += `<tr><td>
          ${this.lang.gasRelease}&nbsp&nbsp</td><td>${this.volumeText(
        nearbyGas,
        undefined,
        true
      )}`;
      nearbyText += `<tr><td>
        ${this.lang.liquidRelease}&nbsp&nbsp</td><td>${this.volumeText(
        nearbyLiquid,
        undefined,
        false,
        true
      )}`;
      nearbyText += `<tr><td>
        ${this.lang.otherRelease}&nbsp&nbsp</td><td>${this.volumeText(
        nearbyOther,
        undefined,
        false,
        true
      )}`;
      nearbyText += `</table><br><small>${this.lang.exploreOther}</small>
          </section>`;
      incidentFlag.innerHTML = nearbyText;
    } else {
      const userZoom = L.featureGroup(allCircles);
      const bounds = userZoom.getBounds();
      bounds.extend(userDummy.getBounds());
      this.map.fitBounds(bounds, { maxZoom: 15 });
      incidentFlag.innerHTML = `<section class="alert alert-warning">${this.lang.noNearby(
        this.eventType
      )}</section>`;
    }
  }

  reZoom() {
    const bounds = this.circles.getBounds();
    this.map.fitBounds(bounds);
  }

  /**
   * Reset bubble opacity to 0.7 and call this.reZoom()
   */
  resetMap() {
    this.circles.eachLayer((layer) => {
      layer.setStyle({ fillOpacity: 0.7 });
    });
    this.reZoom();
  }

  fieldChange(newField) {
    const newColors = this.colors[newField];

    this.field = newField;
    const currentDashboard = this;
    this.circles.eachLayer((layer) => {
      const newFill = newColors[layer.options.incidentParams[newField]].c;
      layer.setStyle({
        fillColor: newFill,
      });
      layer.bindTooltip(
        currentDashboard.toolTip(layer.options.incidentParams, newFill)
      );
    });
  }

  /**
   * Listens for a Window resize event, or top button navigation event so that invalidateSize() and reZoom() are called to ensure proper sizing.
   */
  lookForSize() {
    const currentDashboard = this;
    let resize = false;
    window.addEventListener("resize", () => {
      resize = true;
    });
    document
      .getElementById("safety-env-navigation")
      .addEventListener("click", () => {
        if (resize) {
          currentDashboard.map.invalidateSize(true);
          resize = false;
        } else {
          currentDashboard.map.invalidateSize(false);
        }
        currentDashboard.reZoom();
      });
  }
}
