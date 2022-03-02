/**
 * @file This file contains shared utility functions that are required throughout the project. Only contains lower level highly
 * general functions. Higher level functions more specific to the dashboards should be placed in src/dashboards/dashboardUtils.js
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
 * @param {PointerEvent} evt
 * @param {string} sectionName
 */
export function openTab(evt, sectionName) {
  const sections = document.querySelectorAll(".profile-section");
  Array.from(sections).forEach((section) => {
    section.classList.remove("profile-show");
    section.classList.add("profile-hide");
  });
  const tablinks = document.getElementsByClassName("tablinks");
  Array.from(tablinks).forEach((tab) => {
    tab.className = tab.className.replace(" active", "");
  });
  const currentSection = document.getElementById(sectionName);
  currentSection.classList.add("profile-show");
  evt.currentTarget.classList.add("active");
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
      pointHtml += `<${seperator}>${i[textCol]}</${seperator}>`;
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
 * @param {boolean} config.zoomControl - Whether to show the plus/minus zoom button on map.
 * @param {number[]} config.initZoomTo - Initial [lat, -long] for map.
 * @param {number} config.initZoomLevel - Initial map zoom on load, before zoomTo/fitBounds.
 * @param {number} config.minZoom - Conttols how far the map can be zoomed out.
 * @returns leaflet map object.
 */
export function leafletBaseMap(config, L) {
  const map = L.map(config.div, {
    zoomSnap: config.zoomSnap,
    zoomDelta: config.zoomDelta,
    zoomControl: config.zoomControl,
  }).setView(config.initZoomTo, config.initZoomLevel);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
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
 * @returns false
 */
export function loadChartError(errorDiv, lang, err = false) {
  if (err) {
    console.warn(err);
  }
  document.getElementById(
    errorDiv
  ).innerHTML = `<section class="alert alert-danger"><h3>${lang.title}</h3>${lang.message}</section>`;
  return false;
}

/**
 *
 * @param {object} lang - Top level language object. Should contain {plains: string}.
 * @param {string} div - HTML class for all plains disclaimers.
 */
export function plainsMidstreamProfile(lang, div) {
  Array.from(document.querySelectorAll(`.${div}`)).forEach((warn) => {
    warn.innerHTML = `<section class="alert alert-warning" style="margin-bottom: 0px"><small>${lang.plains}</small></section>`;
  });
}

/**
 * Handles user interaction with a button group.
 * @param {string} btnDiv - HTML id of the target button group.
 * @param {Object} event - Event listener callback object.
 */
export function btnGroupClick(btnDiv, event) {
  document.querySelectorAll(`#${btnDiv} .btn`).forEach((elem) => {
    elem.className = elem.className.replace(" active", "");
  });
  event.target.className += " active";
}

/**
 *
 * @param {string} s
 * @returns {string} first letter capitalized input string.
 */
export function capitalize(s) {
  return s[0].toUpperCase() + s.slice(1);
}

/**
 * Removes all series from a Highcharts chart
 * @param {Object} chart Highcharts chart object
 * @param {boolean} redraw
 * @param {boolean} animation
 * @param {boolean} withEvent
 */
export function removeAllSeries(
  chart,
  redraw = false,
  animation = false,
  withEvent = false
) {
  while (chart.series.length) {
    chart.series[0].remove(redraw, animation, withEvent);
  }
}
