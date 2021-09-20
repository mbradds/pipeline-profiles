/**
 * @file Contains class definition for leaflet map portion of an event dashboard. Commonly used with an EventNavigator to update the map.
 *
 * The leaflet map has the following functionality:
 * - Locate events near the user.
 * - Switch between event frequency (same size bubbles) and "volume" (different bubble size).
 * - Switch between data "columns" when paired with an EventNavigator.
 * - Reset zoom.
 * - Dynamic tooltip displaying the currently selected, or default data column value.
 * - Optional REDOCS search attached to circle click event.
 */

import * as L from "leaflet";
import Highcharts from "highcharts";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import shadowIconPng from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import haversine from "haversine";
import {
  cerPalette,
  conversions,
  leafletBaseMap,
  visibility,
  btnGroupClick,
} from "../util.js";

/**
 * Class defining functionality for a leaflet map that can update colors, tooltip, show events close to user location, etc.
 * TODO:
 *  - Look into a class variable that contains some of the common translations. Pass "en" or "fr" to to constructor to set up
 *    some of the language strings in a more re-usable/transparent way.
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
   * @param {string[]} [constr.toolTipFields=[]] - Add the columns that should appear in the tooltip, extra to the selected column.
   * @param {Object} constr.lang - En/Fr language object from ./langEnglish.js or ./langFrench.js
   * @param {boolean} constr.regdocsClick - Adds on click event to circle + tooltip instructions for opening regdocs event info in new tab. Searches regdocs based on dataset "id" column.
   *
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
    regdocsClick = false,
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
    this.regdocsClick = regdocsClick;
    this.mapDisclaimer = undefined;
    this.findPlotHeight();
  }

  findPlotHeight() {
    try {
      const ch = document.getElementById(this.divId).clientHeight;
      if (ch > 0) {
        this.plotHeight = ch;
      } else {
        const style = document.getElementById(this.divId);
        const { height } = getComputedStyle(style);
        const heightInt = parseInt(height.replace("px", ""), 10);
        this.plotHeight = heightInt;
      }
    } catch (err) {
      this.plotHeight = 500;
    }
  }

  /**
   * Generate a blank leaflet base map using src/modules/util/leafletBaseMap() method.
   */
  addBaseMap() {
    this.map = leafletBaseMap(
      {
        div: this.divId,
        zoomSnap: 0.5,
        zoomDelta: 1,
        zoomControl: true,
        initZoomTo: this.initZoomTo,
        initZoomLevel: 5,
        minZoom: 4,
      },
      L
    );
  }

  static getState(substance) {
    if (!substance) {
      return "other";
    }
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
    return state[substance];
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
      } else if (m3 < 1) {
        digits = 3;
      }

      if (state !== "other") {
        if (state === "gas") {
          return `${this.lang.numberFormat(m3 * convGas, digits)} ${
            this.lang.cf
          } (${Highcharts.numberFormat(m3, digits)} m3)`;
        }
        return `${this.lang.numberFormat(m3 * convLiquid, digits)} ${
          this.lang.bbl
        } (${Highcharts.numberFormat(m3, digits)} m3)`;
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
      info.onAdd = function onAddDisclaimer() {
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
    const getNameText = (val, lookup, hash) => {
      if (lookup && Object.prototype.hasOwnProperty.call(lookup, val)) {
        return hash ? lookup[val][hash] : lookup[val];
      }
      return val;
    };
    const formatCommaList = (text, names) => {
      if (typeof text !== "string" && text.length > 1) {
        return text.reduce((preVal, currVal, i) => {
          const currName = `&nbsp;-&nbsp;${getNameText(currVal, names, "n")}`;
          const preName =
            i === 1
              ? `&nbsp;-&nbsp;${getNameText(preVal, names, "n")}`
              : preVal;
          return `${preName}<br>${currName}`;
        });
      }
      return `&nbsp;${getNameText(text, names, "n")}`;
    };

    const rowName = getNameText(this.field, this.lang.pillTitles.titles);
    const bubbleName = this.colors[this.field][eventParams[this.field]].n;
    let toolTipText = `<div class="map-tooltip"><p style="font-size:15px; font-family:Arial; text-align:center"><strong>${eventParams.id}</strong></p>`;
    toolTipText += `<table><tr><td>${rowName}</td><td style="color:${fillColor}">&nbsp;<strong>${bubbleName}</strong></td></tr>`;

    this.toolTipFields.forEach((toolCol) => {
      if (toolCol === "vol") {
        if (eventParams.vol && eventParams.vol >= 0) {
          toolTipText += `<tr><td>${
            this.lang.pillTitles.titles.vol
          }</td><td>&nbsp;<strong>${this.volumeText(
            eventParams.vol,
            eventParams.sub
          )}</strong></td></tr>`;
        }
      } else if (eventParams[toolCol]) {
        toolTipText += `<tr><td>${
          this.lang.pillTitles.titles[toolCol]
        }</td><td><strong>${formatCommaList(
          eventParams[toolCol],
          this.colors[toolCol]
        )}</strong></td></tr>`;
      }
    });

    toolTipText += `</table>`;
    if (this.regdocsClick) {
      toolTipText += `<i class="center-footer">Click circle to open REGDOCS search for ${eventParams.id}</i>`;
    }

    return toolTipText;
  }

  addCircle(x, y, color, fillColor, r, eventParams = {}) {
    const circle = L.circle([x, y], {
      color,
      fillColor,
      fillOpacity: 0.7,
      radius: this.minRadius,
      volRadius: r,
      weight: 1,
      eventParams,
    });

    if (this.regdocsClick) {
      circle.on("click", (e) => {
        window.open(
          `https://apps.cer-rec.gc.ca/REGDOCS/Search?txthl=${e.target.options.eventParams.id}`
        );
      });
    }
    return circle;
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
   *  loc: [lat, -long]
   * }]
   */
  processEventsData(data) {
    const radiusCalc = (maxVolume) => (maxVolume > 500 ? 150000 : 100000);

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
      "#ffffff",
      "#ffffff",
    ];
    const volumes = data.map((row) => row.vol);
    const [maxVol, minVol] = [Math.max(...volumes), Math.min(...volumes)];
    const maxRad = radiusCalc(maxVol);
    let years = []; // piggyback on data processing pass to get the year colors
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
      if (yr < 0) {
        yearColors[yr] = { c: cerPalette["Dim Grey"], n: "n/a" };
      } else {
        yearColors[yr] = { c: colors[i], n: yr };
      }
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
          watch: false,
        })
        .on("locationfound", (e) => {
          const marker = L.marker([e.latitude, e.longitude], {
            icon: new L.Icon({
              iconUrl: markerIconPng,
              shadowUrl: shadowIconPng,
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
          // console.log("locationerror in findUser method");
          reject(err);
        });
    });
  }

  /**
   * Finds all nearby events within a given range.
   * Requires the following HTML div is's:
   *  - nearby-this.eventType-flag (displays the analysis text number of nearby incidents, or location error message)
   * @param {number} range - User input range in kilometers (from range slider) to compare with distance between user and all events.
   */
  nearbyIncidents(range) {
    const [nearbyCircles, allCircles] = [[], []];
    const currentDashboard = this;
    this.circles.eachLayer((layer) => {
      allCircles.push(layer);
      const distance = haversine(currentDashboard.user, {
        latitude: layer._latlng.lat,
        longitude: layer._latlng.lng,
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

    const incidentFlag = document.getElementById(
      `nearby-${this.eventType}-flag`
    );

    if (nearbyCircles.length > 0) {
      this.nearby = L.featureGroup(nearbyCircles);
      const bounds = this.nearby.getBounds();
      bounds.extend(userDummy.getBounds());
      this.map.fitBounds(bounds, { maxZoom: 15 });
      // loop through the nearbyCircles and get some summary stats:
      let [nearbyGas, nearbyLiquid, nearbyOther, nearbyAll] = [0, 0, 0, 0];
      this.nearby.eachLayer((layer) => {
        const layerState = EventMap.getState(layer.options.eventParams.sub);
        if (layerState === "gas") {
          nearbyGas += layer.options.eventParams.vol;
        } else if (layerState === "liquid") {
          nearbyLiquid += layer.options.eventParams.vol;
        } else {
          nearbyOther += layer.options.eventParams.vol;
        }
        nearbyAll += layer.options.eventParams.vol;
      });
      let nearbyText = `<section class="alert alert-info"><h4>${this.lang.nearbyHeader(
        nearbyCircles.length,
        range
      )}</h4><table class="mrgn-bttm-sm">`;

      if (this.eventType === "incidents") {
        [
          [this.lang.gasRelease, nearbyGas, "gas"],
          [this.lang.liquidRelease, nearbyLiquid, "liquid"],
          [this.lang.otherRelease, nearbyOther, "other"],
        ].forEach((release) => {
          if (release[1] > 0) {
            let [g, l, o] = [false, false, false];
            if (release[2] === "gas") {
              g = true;
              l = false;
              o = false;
            } else if (release[2] === "liquid") {
              g = false;
              l = true;
              o = false;
            } else {
              g = false;
              l = false;
              o = true;
            }
            nearbyText += `<tr><td>
          ${release[0]}&nbsp;&nbsp;</td><td>${this.volumeText(
              release[1],
              undefined,
              g,
              l,
              o
            )}</td>`;
          }
        });
      } else if (this.eventType === "remediation") {
        nearbyText += `<tr><td>
        Contaminated soil nearby:&nbsp;&nbsp;</td><td>${this.lang.numberFormat(
          nearbyAll,
          0
        )} m3</td>`;
      }

      nearbyText += `</table><small>${this.lang.exploreOther}</small>
          </section>`;
      incidentFlag.innerHTML = nearbyText;
    } else {
      const bounds = L.featureGroup(allCircles).getBounds();
      bounds.extend(userDummy.getBounds());
      this.map.fitBounds(bounds, { maxZoom: 15 });
      incidentFlag.innerHTML = `<section class="alert alert-warning">${this.lang.noNearby(
        this.eventType
      )}</section>`;
    }
  }

  reZoom() {
    this.map.fitBounds(this.circles.getBounds());
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
    this.field = newField;
    const currentDashboard = this;
    this.circles.eachLayer((layer) => {
      const newFill =
        this.colors[newField][layer.options.eventParams[newField]].c;
      layer.setStyle({
        fillColor: newFill,
      });
      layer.bindTooltip(
        currentDashboard.toolTip(layer.options.eventParams, newFill)
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

  /**
   * Switches the user view between event map and event trends.
   * Requires the following div id's in HTML:
   *  - this.eventType-view-type (button group with value="map" and value="trends")
   *  - this.divId (leaflet map container)
   *  - ${this.eventType}-time-series-section (initially hidden trends section)
   *  - nearby-${this.eventType}-popup (optional, will hide if exists)
   * @param {Object} mapBars - EventNavigator instance with bars placed next to the leaflet map. mapBars.allDivs are hidden on click
   * @param {boolean} [cBtn=false] - Optional count button for switching between event frequency/volume. Must be added to this method
   * to control if event frequency/volume is selected/available when looking at trends or map.
   * @param {boolean} [vBtn=false] - Volume button
   */
  switchDashboards(mapBars, cBtn = false, vBtn = false) {
    document
      .getElementById(`${this.eventType}-view-type`)
      .addEventListener("click", (event) => {
        btnGroupClick(`${this.eventType}-view-type`, event);
        const dashboardDivs = [
          `${this.divId}`,
          `nearby-${this.eventType}-popup`,
        ].concat(mapBars.allDivs);
        if (event.target.value !== "trends") {
          visibility(dashboardDivs, "show");
          visibility([`${this.eventType}-time-series-section`], "hide");
          if (vBtn) {
            vBtn.disabled = false;
          }
          this.map.invalidateSize(true); // fixes problem when switching from trends to map after changing tabs
          if (cBtn) {
            cBtn.click();
          }
        } else {
          // if the user selects trends, the option to view volume should be disabled
          if (vBtn && cBtn) {
            vBtn.disabled = true;
            cBtn.checked = true;
          }
          visibility(dashboardDivs, "hide");
          visibility([`${this.eventType}-time-series-section`], "show");
        }
      });
  }

  /**
   * Sets up the select range slider for finding nearby events on the map. Contains event listener to update title+button with selected range.
   * Requires the following HTML div id's in HTML:
   *  - this.eventType-range-slide (html slider)
   *  - find-this.eventType-btn (button that triggers nearby analysis, with updating title based on desired range)
   *  - find-this.eventTyle-title (range slider title, with updating title based on desired range)
   * @param {string} rangeTitle - HTML text to be displayed above range slider.
   * @param {string} findBtnTitle - HTML text to be displayed on find-this.eventType-btn button.
   */
  nearbySlider(rangeTitle, findBtnTitle) {
    const slider = document.getElementById(`${this.eventType}-range-slide`);
    slider.addEventListener("change", () => {
      const currentValue = slider.value;
      const findIncidentBtn = document.getElementById(
        `find-${this.eventType}-btn`
      );
      document.getElementById(
        `find-${this.eventType}-title`
      ).innerText = `${rangeTitle} (${currentValue}km):`;

      findIncidentBtn.innerText = `${findBtnTitle} ${currentValue}km`;
      findIncidentBtn.value = currentValue;
    });
  }

  /**
   * Binds event listener when the user clicks on find events within a seleted range.
   * Requires the following HTML div id's:
   *  - find-${this.eventType}-btn (button used to initiate nearby analysis)
   *  - reset-${this.eventType}-btn (used to enable or disable button when find nearby is clicked)
   *  - nearby-${this.eventType}-flag (displays nearby analysis, or location error text)
   * @param {string} errorText - text to display if there is a location error, or user declines to share location.
   */
  nearbyListener(errorText) {
    // user selects a range to find nearby incidents
    document
      .getElementById(`find-${this.eventType}-btn`)
      .addEventListener("click", () => {
        const resetBtn = document.getElementById(`reset-${this.eventType}-btn`);
        const range = document.getElementById(
          `find-${this.eventType}-btn`
        ).value;
        if (!this.user.latitude && !this.user.longitude) {
          const loadDisclaimer = setTimeout(() => {
            this.addMapDisclaimer("location");
          }, 200);
          this.findUser()
            .then(() => {
              this.nearbyIncidents(range); // .then((userAdded))
              clearTimeout(loadDisclaimer);
              this.removeMapDisclaimer("location");
              resetBtn.disabled = false;
              resetBtn.className = "btn btn-primary col-md-12 notice-me-btn";
            })
            .catch(() => {
              const incidentFlag = document.getElementById(
                `nearby-${this.eventType}-flag`
              );
              incidentFlag.innerHTML = `<section class="alert alert-warning">${errorText}</section>`;
              clearTimeout(loadDisclaimer);
              this.removeMapDisclaimer("location");
            });
        } else {
          this.nearbyIncidents(range);
          resetBtn.disabled = false;
          resetBtn.className = "btn btn-primary col-md-12 notice-me-btn";
        }
      });
  }

  /**
   * reset map after user has selected a range
   */
  resetCirclesListener() {
    const resetBtnDiv = `reset-${this.eventType}-btn`;
    document.getElementById(resetBtnDiv).addEventListener("click", () => {
      this.resetMap();
      const resetBtn = document.getElementById(resetBtnDiv);
      resetBtn.disabled = true;
      resetBtn.className = "btn btn-default col-md-12";
      document.getElementById(`nearby-${this.eventType}-flag`).innerHTML = ``;
    });
  }
}
