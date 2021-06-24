/**
 * @file This file contains shared utility functions that are required throughout the project. Only contains lower level highly
 * general functions. Higher level functions more specific to the dashboards should be placed in src/dashboards/dashboardUtils.js
 */

import * as L from "leaflet";

/**
 * @typedef {Object} SetupReturn
 * @property {Object} unitsHolder - {base, current, conversion} info about units and units switching.
 * @property {boolean} buildFive - Whether a five year average chart should be built given the key point.
 * @property {boolean} hasImports - Whether the inital key point has imports that need a seperate chart.
 * @property {boolean} tm - Whether the user is on the Trans Mountain page. This page is different!
 * @property {string} commodity - Looks at the default unit and is assigned "oil" or "gas".
 */

/**
 * @typedef {Object} FiveYearReturn
 * @property {Array[]} currentYrData - 3 months - 1 year of data above the five year range.
 * @property {Array[]} avgData - Array with 12 entries, each containing the five year average of a month from Dec-Jan.
 * @property {Array[]} rangeData - Array with 12 entries, each containing five-year range info: ["month", "min", "max"].
 * @property {Object} meta - Contains info on the five-year year range: {lastYear: XXXX, firstYear: XXXX}.
 */

export const cerPalette = {
  "Night Sky": "#054169",
  Sun: "#FFBE4B",
  Ocean: "#5FBEE6",
  Forest: "#559B37",
  Flame: "#FF821E",
  Aubergine: "#871455",
  "Dim Grey": "#8c8c96",
  "Cool Grey": "#42464B",
  hcBlue: "#7cb5ec",
  hcGreen: "#90ed7d",
  hcPink: "#f15c80",
  hcRed: "#f45b5b",
  hcAqua: "#2b908f",
  hcPurple: "#8085e9",
  hcLightBlue: "#91e8e1",
};

export const conversions = {
  "m3 to bbl": 6.2898,
  "bbl to m3": 1 / 6.2898,
  "m3 to cf": 35.3,
  "bcf/d to million m3/d": 28.32,
};

/**
 *
 * @param {number} start - Start year of the returned range.
 * @param {number} end  - End year for the returned range.
 * @returns {Array} - Sorted array from start date to end data inclusive.
 */
export function rangeInclusive(start, end) {
  return Array(end - start + 1)
    .fill()
    .map((_, idx) => start + idx);
}

/**
 *
 * @param {Object[]} obj - JSON style list of objects with a common numeric column to sort.
 * @param {string} [colName="value"] - JSON column identifier to sort.
 * @returns {Object[]} - Descending sorted JSON list of objects.
 */
export const sortJson = (obj, colName = "value") =>
  obj.slice().sort((a, b) => b[colName] - a[colName]);

/**
 *
 * @param {Object[]} lst - JSON style list of ojects with a common string column to sort.
 * @param {string} col - JSON column identifier to sort.
 * @returns {Object[]} - Alphabetically sorted JSON list of objects.
 */
export function sortJsonAlpha(lst, col) {
  function compareStrings(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
  }
  return lst.sort((a, b) => compareStrings(a[col], b[col]));
}

/**
 *
 * @param {string[]} divList - Array of HTML div id's to be hidden or shown.
 * @param {string} status - Set either to "hide" or "show".
 */
export function visibility(divList, status) {
  divList.forEach((div) => {
    const x = document.getElementById(div);
    if (x) {
      if (status === "hide") {
        if (x.style.display !== "none") {
          x.style.display = "none";
        }
      } else if (status === "show") {
        if (x.style.display !== "block") {
          x.style.display = "block";
        }
      }
    } else {
      console.warn(`tried to hide non existent div: ${div}`);
    }
  });
}

/**
 *
 * @param {number[]} arr - Array of numeric values to be averaged.
 * @returns {number} - Simple numeric average of the input array.
 */
export const arrAvg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

/**
 *
 * @param {Object[]} itter - Array of objects containing one or more key point definitions.
 * @param {string} textCol - Object key identifier for the text to be displayed.
 * @returns {string} - HTML unordered list (itter.length > 1) or HTML paragraph (itter.length === 1).
 */
export function listOrParagraph(itter, textCol) {
  let [seperator, pointHtml, closing] = ["p", "", ""];
  if (itter.length > 1) {
    [seperator, pointHtml, closing] = ["li", "<ul>", "</ul>"];
  }

  itter.forEach((i) => {
    if (i && textCol in i) {
      const pointText = i[textCol];
      pointHtml += `<${seperator}>${pointText}</${seperator}>`;
    }
  });
  pointHtml += closing;
  return pointHtml;
}

/**
 *
 * @param {Object} config - Options to set up a basic leaflet map.
 * @param {string} config.div - HTML div where map will be loaded.
 * @param {number} config.zoomSnap - Defines how precise things like zoomTo will be.
 * @param {number} config.zoomDelta - Defines how much zoom happens on one scroll/click.
 * @param {boolean} config.zoomContol - Whether to show the plus/minus zoom button on map.
 * @param {number[]} config.initZoomTo - Initial [lat, -long] for map.
 * @param {number} config.initZoomLevel - Initial map zoom on load, before zoomTo/fitBounds.
 * @param {number} config.minZoom - Conttols how far the map can be zoomed out.
 * @returns leaflet map object.
 */
export function leafletBaseMap(config) {
  const map = L.map(config.div, {
    zoomSnap: config.zoomSnap,
    zoomDelta: config.zoomDelta,
    zoomControl: config.zoomControl,
  }).setView(config.initZoomTo, config.initZoomLevel);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}", {
    foo: "bar",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  map.setMinZoom(config.minZoom);
  return map;
}

/**
 * Overrides the wet4 equal height if it doesnt work.
 * @param {string} divId1 - HTML id of div to compare to second parameter
 * @param {string} divId2 - HMTL id of div to compare to first parameter
 */
export function equalizeHeight(divId1, divId2) {
  const d1 = document.getElementById(divId1);
  const d2 = document.getElementById(divId2);

  d1.style.height = "auto";
  d2.style.height = "auto";

  const d1Height = d1.clientHeight;
  const d2Height = d2.clientHeight;

  const maxHeight = Math.max(d1Height, d2Height);
  if (d1Height !== maxHeight || d2Height !== maxHeight) {
    d1.style.height = `${maxHeight}px`;
    d2.style.height = `${maxHeight}px`;
  }
}

/**
 *
 * @param {string} errorDiv - The div containing all the dashboard elements to be hidden and replaced with an error message.
 * @param {{title: string, message: string}} lang - En/Fr title and error message.
 * @param {Array} [hideDivs=[]] - Optional array of HTML div id's to be hidden on error.
 * @returns false
 */
export function loadChartError(errorDiv, lang, hideDivs = []) {
  if (hideDivs.length > 0) {
    visibility(hideDivs, "hide");
  }
  const errHtml = `<section class="alert alert-danger"><h3>${lang.title}</h3>${lang.message}</section>`;
  document.getElementById(errorDiv).innerHTML = errHtml;
  return false;
}

/**
 *
 * @param {object} lang - Top level language object. Should contain {plains: string}.
 * @param {string} div - HTML class for all plains disclaimers.
 */
export function plainsMidstreamProfile(lang, div) {
  [...document.querySelectorAll(`.${div}`)].forEach((warn) => {
    const plainsDiv = warn;
    plainsDiv.innerHTML = `<section class="alert alert-warning" style="margin-bottom: 0px"><small>${lang.plains}</small></section>`;
  });
}
