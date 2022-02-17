/**
 * @file Contains shared utility functions that are specific to the dashboards, and not used elsewhere. General purpose functions
 * should be added to src/modules/util.js
 */

import Highcharts from "highcharts";
import { mapDates } from "../modules/datestone.js";
import { cerPalette, sortJsonAlpha, conversions } from "../modules/util.js";

/**
 * @typedef {Object} SetupReturn
 * @property {Object} unitsHolder - {base, current, conversion} info about units and units switching.
 * @property {boolean} buildFive - Whether a five year average chart should be built given the key point.
 * @property {boolean} hasImports - Whether the inital key point has imports that need a seperate chart.
 * @property {boolean} tm - Whether the user is on the Trans Mountain page. This page is different!
 * @property {string} commodity - Looks at the default unit and is assigned "oil" or "gas".
 */

export const mapInits = {
  MNP: {
    "In Progress": -1,
    Closed: -1,
  },
  NormanWells: {
    "In Progress": 0,
    Closed: 0,
  },
  Foothills: {
    "In Progress": -2,
    Closed: -2,
  },
  TQM: {
    "In Progress": -1,
    Closed: -1,
  },
  Keystone: {
    "In Progress": -1,
    Closed: -1,
  },
  Genesis: {
    "In Progress": -1,
    Closed: -1,
  },
  Montreal: {
    "In Progress": -2,
    Closed: -2,
  },
  Westspur: {
    "In Progress": -2,
    Closed: -2,
  },
};

/**
 * Checks if a highcharts series id corresponds to pipeline capacity. This series's are treaded differently.
 * @param {string} seriesId
 * @returns {boolean}
 */
export const isCapacity = (seriesId) =>
  !!(seriesId === "cap" || seriesId === "icap" || seriesId === "ecap");

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
  const series = sorted
    ? sortJsonAlpha(seriesWithDate.slice(1), "id")
    : seriesWithDate.slice(1);

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
      if (key !== "data" && key !== "name") {
        nextSeries[key] = s[key];
      }
    });

    const transform =
      unitsHolder.current !== unitsHolder.base && s.id !== "ap"
        ? {
            convert: true,
            operation: "*",
            conversion: unitsHolder.conversion,
            round: -1,
          }
        : {
            convert: false,
            operation: "none",
            conversion: 0,
            round: -1,
          };

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
            fiveYearData[row[0]] = row[1];
          }
        });
        fiveYearData.lastDate = nextSeries.data.slice(-1)[0][0];
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
export function addUnitsAndSetup(
  defaultUnit,
  defaultPoint,
  units,
  section,
  frequency = "m"
) {
  const commodity = defaultUnit === "Mb/d" ? "oil" : "gas";
  const unitsHolder = {
    base: units[defaultUnit],
    current: units[defaultUnit],
  };

  const radioBtn = (unit, checked, i, s) => {
    const checkhtml = checked ? 'checked="checked"' : " ";
    return `<label for="units${i}_${s}" class="radio-inline">
    <input id="units${i}_${s}" value="${unit}" type="radio"${checkhtml}name="${section}Units" />${unit}</label>`;
  };
  let [buildFive, hasImports] = [false, false];

  if (defaultPoint.id === "KP0001") {
    // KP0001 = St. Stephen
    hasImports = true;
  }
  if (frequency === "monthly" || frequency === "m") {
    buildFive = true;
  } else {
    document.getElementById("traffic-hc-range").style.height = 0;
  }

  let secondUnit = "";
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
  const tm = defaultPoint.id === "KP0003";
  return { unitsHolder, buildFive, hasImports, tm, commodity };
}

export function addUnitsDisclaimer(div, commodity, textFunction) {
  document.getElementById(div).innerHTML = textFunction(commodity);
}

/**
 * Replaces the dashboard div with a warning flag indicating there is no data for the section.
 * @param {string} header - Warning flag title.
 * @param {function} note - String template arrow for inserting company name into warning flag body.
 * @param {string} companyName - Company or system name inserted into warning flag body.
 * @param {string} dashboardId - HTML div id for the dashboard section.
 */
export function noEventsFlag(header, note, dashboardId) {
  try {
    document.getElementById(
      dashboardId
    ).innerHTML = `<section class="alert alert-warning"><h3>${header}</h3><p>${note}</p></section>`;
  } catch (err) {
    console.warn(
      `Missing HTML and dashboard ID (${dashboardId}) for noEventsFlag method. `
    );
  }
}

/**
 * Adds a custom text box to upper left corner of a Highcharts chart
 * @param {Object} chart Highcharts chart object
 * @param {string} text HTML partial to be displayed in the text box
 * @returns
 */
export function addRenderer(chart, text, color) {
  const label = chart.renderer
    .label(text, null, null, null, null, null, true)
    .css({
      width: Math.floor(chart.chartWidth / 4) + 40,
    })
    .attr({
      "stroke-width": 3,
      zIndex: 8,
      padding: 8,
      r: 3,
      fill: "white",
      stroke: color,
    })
    .add(chart.rGroup);
  chart.customTooltip = label;
  label.align(
    Highcharts.extend(label.getBBox(), {
      align: "right",
      x: 0, // offset
      verticalAlign: "top",
      y: 0, // offset
    }),
    null,
    "spacingBox"
  );
  return label;
}
