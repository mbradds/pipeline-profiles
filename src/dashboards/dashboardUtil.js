/**
 * @file Contains shared utility functions that are specific to the dashboards, and not used elsewhere. General purpose functions
 * should be added to src/modules/util.js
 */

import { mapDates } from "../modules/datestone";
import { cerPalette, sortJsonAlpha, conversions } from "../modules/util";

/**
 * @typedef {Object} SetupReturn
 * @property {Object} unitsHolder - {base, current, conversion} info about units and units switching.
 * @property {boolean} buildFive - Whether a five year average chart should be built given the key point.
 * @property {boolean} hasImports - Whether the inital key point has imports that need a seperate chart.
 * @property {boolean} tm - Whether the user is on the Trans Mountain page. This page is different!
 * @property {string} commodity - Looks at the default unit and is assigned "oil" or "gas".
 */

export const mapInits = {
  mode: "production", // setting mode to "development" will allow pan,zoom, and x,y location console logging.
  zooms: {
    "NOVA Gas Transmission Ltd.": {
      "In Progress": [0.22, -12800000, -7504281],
      Closed: [0.3, -12001114, -7500840],
    },
    "TransCanada PipeLines Limited": {
      "In Progress": [0.22, -10100000, -6500000],
      Closed: [0.3, -10100000, -6500000],
    },
    "Enbridge Pipelines Inc.": {
      "In Progress": [0.22, -10100000, -6500000],
      Closed: [0.22, -10100000, -6500000],
    },
    "TransCanada Keystone Pipeline GP Ltd.": {
      "In Progress": [0.22, -12000000, -7504281],
      Closed: [0.22, -12000000, -7504281],
    },
    "Trans Mountain Pipeline ULC": {
      "In Progress": [0.22, -13200000, -7504281],
      Closed: [0.22, -13200000, -7504281],
    },
    "Alliance Pipeline Ltd.": {
      "In Progress": [0.22, -12100000, -7504281],
      Closed: [0.22, -12100000, -7504281],
    },
    "PKM Cochin ULC": {
      "In Progress": [0.22, -12100000, -7504281],
      Closed: [0.22, -12100000, -7504281],
    },
    "Westcoast Energy Inc.": {
      "In Progress": [0.22, -13200000, -7504281],
      Closed: [0.3, -13200000, -7504281],
    },
    "Southern Lights Pipeline": {
      "In Progress": [0.22, -12100000, -7504281],
      Closed: [0.22, -12100000, -7504281],
    },
    "Foothills Pipe Lines Ltd.": {
      "In Progress": [0.22, -12800000, -7504281],
      Closed: [0.3, -12001114, -7500840],
    },
    "Many Islands Pipe Lines (Canada) Limited": {
      "In Progress": [0.22, -12000000, -7504281],
      Closed: [0.22, -12000000, -7504281],
    },
    "Maritimes & Northeast Pipeline Management Ltd.": {
      "In Progress": [0.18, -7500000, -2000000],
      Closed: [0.18, -7500000, -2000000],
    },
    "Trans Quebec and Maritimes Pipeline Inc.": {
      "In Progress": [0.25, -8000000, -3000000],
      Closed: [0.25, -8000000, -3000000],
    },
    "Enbridge Bakken Pipeline Company Inc.": {
      "In Progress": [0.22, -11500000, -7104281],
      Closed: [0.22, -11500000, -7104281],
    },
    "Enbridge Pipelines (NW) Inc.": {
      "In Progress": [0.3, -12900000, -7820000],
      Closed: [0.3, -12900000, -7820000],
    },
    "Express Pipeline Ltd.": {
      "In Progress": [0.22, -12800000, -7504281],
      Closed: [0.22, -12800000, -7504281],
    },
    "Trans-Northern Pipelines Inc.": {
      "In Progress": [0.2, -8500000, -6000000],
      Closed: [0.2, -8500000, -6000000],
    },
    "Genesis Pipeline Canada Ltd.": {
      "In Progress": [0.16, -9200000, -5000000],
      Closed: [0.16, -9200000, -5000000],
    },
    "Montreal Pipe Line Limited": {
      "In Progress": [0.25, -8000000, -3000000],
      Closed: [0.25, -8000000, -3000000],
    },
    "Kingston Midstream Westspur Limited": {
      "In Progress": [0.22, -11500000, -7504281],
      Closed: [0.22, -11500000, -7504281],
    },
    "Plains Midstream Canada ULC": {
      "In Progress": [0.3, -11000000, -7000840],
      Closed: [0.3, -11000000, -7000840],
    },
  },
};

/**
 * Checks if a highcharts series id corresponds to pipeline capacity. This series's are treaded differently.
 * @param {string} seriesId
 * @returns {boolean}
 */
export const isCapacity = (seriesId) => {
  if (seriesId === "cap" || seriesId === "icap" || seriesId === "ecap") {
    return true;
  }
  return false;
};

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
  } else {
    buildFive = true;
  }

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

export function noEventsFlag(header, note, companyName, dashboardId) {
  let noEventsHTML = `<section class="alert alert-warning"><h3>${header}</h3>`;
  noEventsHTML += `<p>${note(companyName)}</p></section>`;
  document.getElementById(dashboardId).innerHTML = noEventsHTML;
}
