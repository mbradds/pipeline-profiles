/**
 * @file This file contains shared utility functions that are required throughout the project.
 */

import * as L from "leaflet";
import { mapDates } from "./datestone";

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
 * @param {Object[]} seriesWithDate - Pre-processed highcharts series containing a starting date, and one or more objects containing data arrays.
 * @param {Object} unitsHolder - Info about the current dataset/series units.
 * @param {string} unitsHolder.base - The default dataset unit. Typcially Bcf/d or Mb/d.
 * @param {string} unitsHolder.current - The default unit or updated unit based on user radio selection.
 * @param {string} unitsHolder.conversion - The multiplication factor to convert from base unit to other radio selection.
 * @param {boolean} buildFive - Whether a five-year average series needs to be created.
 * @param {Object} seriesNames - Lookup object containing series id's and en/fr series names to be added to the series.
 * @param {string} frequency - Set to "monthly" can only handle monthly data at this point.
 * @param {string} [section="traffic"] - The profile section. Different sections will have different series properties.
 * @param {boolean} [sorted=true] - Whether seriesWithDate should be sorted by series.id. Helps maintain chart order
 * @returns {Array} Array with first element containing the chart series, and second element containing the five-year series.
 */
export function addSeriesParams(
  seriesWithDate,
  unitsHolder,
  buildFive,
  seriesNames,
  frequency = "monthly",
  section = "traffic",
  sorted = true
) {
  if (seriesWithDate.length === 0) {
    return [[undefined], [undefined]];
  }

  const minDate = seriesWithDate[0].min;
  let series = seriesWithDate.slice(1);
  if (sorted) {
    series = sortJsonAlpha(series, "id");
  }

  const isCapacity = (seriesId) => {
    if (seriesId === "cap" || seriesId === "icap" || seriesId === "ecap") {
      return true;
    }
    return false;
  };

  const fiveYearData = {};
  const newSeries = series.map((s) => {
    const nextSeries = {};
    const startd = new Date(minDate[0], minDate[1] + 1, minDate[2]);
    if (seriesNames) {
      if (Object.prototype.hasOwnProperty.call(seriesNames, s.id)) {
        nextSeries.name = seriesNames[s.id];
      } else {
        nextSeries.name = s.id;
      }
    } else {
      nextSeries.name = s.id;
    }

    Object.keys(s).forEach((key) => {
      const value = s[key];
      if (key !== "data" && key !== "name") {
        nextSeries[key] = value;
      }
    });

    let transform = {
      convert: false,
      operation: "none",
      conversion: 0,
      round: -1,
    };

    if (unitsHolder.current !== unitsHolder.base) {
      transform = {
        convert: true,
        operation: "*",
        conversion: unitsHolder.conversion,
        round: -1,
      };
    }

    nextSeries.data = mapDates(s.data, startd, frequency, "forward", transform);

    if (section === "traffic") {
      if (isCapacity(s.id)) {
        nextSeries.type = "line";
        nextSeries.zIndex = 6;
        nextSeries.lineWidth = 3;
      } else {
        nextSeries.type = "area";
        nextSeries.zIndex = 5;
        nextSeries.lineWidth = 1;
        nextSeries.data.forEach((row) => {
          if (Object.prototype.hasOwnProperty.call(fiveYearData, row[0])) {
            fiveYearData[row[0]] += row[1];
          } else {
            const toAdd = row[1];
            fiveYearData[row[0]] = toAdd;
          }
        });
        const lastDate = nextSeries.data.slice(-1)[0][0];
        fiveYearData.lastDate = lastDate;
      }
    } else if (section === "apportionment") {
      if (nextSeries.type === "line" && nextSeries.yAxis === 0) {
        nextSeries.zIndex = 6;
        nextSeries.lineWidth = 3;
        nextSeries.color = cerPalette.Sun;
      } else if (nextSeries.type === "line" && nextSeries.yAxis === 1) {
        nextSeries.zIndex = 6;
        nextSeries.lineWidth = 3;
        nextSeries.color = cerPalette.Forest;
      } else {
        nextSeries.zIndex = 5;
        nextSeries.color = cerPalette["Night Sky"];
      }
    }

    nextSeries.marker = { enabled: false };
    return nextSeries;
  });
  if (buildFive) {
    return [newSeries, fiveYearData];
  }
  return [newSeries, undefined];
}

/**
 *
 * @param {string} defaultUnit - The en/fr unit to be placed as "default" in returned unitsHolder and radio button checked.
 * @param {Object} defaultPoint - Contains initial key point id and name (en/fr) to be initially selected on load.
 * @param {Object} units - Contains unit id's and names (en/fr) to be used in radio button text and HTML id.
 * @param {string} section - Section name is added to radio id to avoid duplication between traffic and apportionment.
 * @returns {SetupReturn}
 */
export function addUnitsAndSetup(defaultUnit, defaultPoint, units, section) {
  const commodity = defaultUnit === "Mb/d" ? "oil" : "gas";
  const unitsHolder = {
    base: units[defaultUnit],
    current: units[defaultUnit],
  };

  const radioBtn = (unit, checked, i, s) => {
    let checkhtml = " ";
    if (checked) {
      checkhtml = 'checked="checked"';
    }
    return `<label for="units${i}_${s}" class="radio-inline">
  <input id="units${i}_${s}" value="${unit}" type="radio"${checkhtml}name="${section}Units" />
  ${unit}</label>`;
  };
  let [buildFive, hasImports] = [false, false];
  let secondUnit = "";

  if (defaultPoint.id === "7") {
    // 7 = St. Stephen
    hasImports = true;
  }
  buildFive = true;
  if (defaultUnit === "Bcf/d") {
    secondUnit = "million m3/d";
    unitsHolder.conversion = conversions["bcf/d to million m3/d"];
  } else if (defaultUnit === "Mb/d") {
    secondUnit = "thousand m3/d";
    unitsHolder.conversion = conversions["bbl to m3"];
  }

  let buttonHTML = "";
  [
    [units[defaultUnit], true],
    [units[secondUnit], false],
  ].forEach((unit, i) => {
    buttonHTML += radioBtn(unit[0], unit[1], i, section);
  });
  document.getElementById(`select-units-radio-${section}`).innerHTML =
    buttonHTML;
  const tm = defaultPoint.id === "35";
  return { unitsHolder, buildFive, hasImports, tm, commodity };
}

export function addUnitsDisclaimer(div, commodity, textFunction) {
  const unitsDisclaimer = document.getElementById(div);
  unitsDisclaimer.innerHTML = textFunction(commodity);
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

export function loadChartError(errorDiv, lang, hideDivs = []) {
  if (hideDivs.length > 0) {
    visibility(hideDivs, "hide");
  }
  const e = document.getElementById(errorDiv);
  const errHtml = `<section class="alert alert-danger"><h3>${lang.title}</h3>${lang.message}</section>`;
  e.innerHTML = errHtml;
  return false;
}
