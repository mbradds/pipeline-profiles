/**
 * @file Contains the all the five-year average functionality found in the traffic section.
 * Creates a highcharts specific series array with a five-year average line, range, and current year values.
 */

import { arrAvg, cerPalette } from "./util.js";

/**
 * @typedef {Object} FiveYearReturn
 * @property {Array[]} currentYrData - 3 months - 1 year of data above the five year range.
 * @property {Array[]} avgData - Array with 12 entries, each containing the five year average of a month from Dec-Jan.
 * @property {Array[]} rangeData - Array with 12 entries, each containing five-year range info: ["month", "min", "max"].
 * @property {Object} meta - Contains info on the five-year year range: {lastYear: XXXX, firstYear: XXXX}.
 */

/**
 *
 * @param {number} lastDate - Serialized date integer representing the max date in the dataset/series.
 * @param {Object} dataObj - {date: value} pairs of the dataset, to be filtered and shaped into the five year series.
 * @returns {FiveYearReturn}
 */
function calculateFiveYrAvg(lastDate, dataObj) {
  const lastYear = new Date(lastDate).getFullYear(); // the last year in the dataset
  const firstYear = lastYear - 6; // the first year of the five year average
  const startYear = new Date(
    parseInt(Object.keys(dataObj)[0], 10)
  ).getFullYear();

  const meta = { lastYear, firstYear };
  const [currentYrData, rangeData, avgData] = [[], [], []];

  const months = {};
  if (startYear > firstYear + 1) {
    return { currentYrData, avgData, rangeData, meta };
  }

  Object.keys(dataObj).forEach((dateKey) => {
    const value = dataObj[dateKey];
    const dateInt = new Date(parseInt(dateKey, 10));
    const [month, year] = [dateInt.getMonth() + 1, dateInt.getFullYear()];
    if (year === lastYear) {
      currentYrData.push([month.toString(), value]);
    }
    if (year > firstYear && year < lastYear) {
      if (month in months) {
        months[month].push(value);
      } else {
        months[month] = [value];
      }
    }
  });

  Object.keys(months).forEach((monthNum) => {
    const value = months[monthNum];
    rangeData.push([monthNum, Math.min(...value), Math.max(...value)]);
    avgData.push([monthNum, arrAvg(value)]);
  });

  return { currentYrData, avgData, rangeData, meta };
}

/**
 *
 * @param {Object} dataWithDate - At least 60 (5 years) {date: value} pairs, with the last object entry containing the max date {"lastDate": date int}
 * @param {Object} lang - Language parameters found in langEnglish.js or langFrench.js
 * @returns {Object[]} - Highcharts ready list of series: [{lastYrSeries, fiveYrAvg, fiveYrRange}]
 */
export function createFiveYearSeries(dataWithDate, lang) {
  const { lastDate, ...dataObj } = dataWithDate;
  const { currentYrData, avgData, rangeData, meta } = calculateFiveYrAvg(
    lastDate,
    dataObj
  );

  const lastYrSeries = {
    data: [],
    type: "line",
    zIndex: 5,
    name: lang.fiveYr.lastYrName(meta.lastYear),
    color: cerPalette.hcRed,
  };

  const fiveYrRange = {
    data: [],
    name: lang.fiveYr.rangeName(meta.firstYear, meta.lastYear),
    type: "arearange",
    zIndex: 3,
    marker: {
      enabled: false,
    },
    color: cerPalette.Ocean,
  };

  const fiveYrAvg = {
    data: [],
    name: lang.fiveYr.avgName,
    type: "line",
    zIndex: 4,
    marker: {
      enabled: false,
    },
    lineWidth: 4,
    color: "black",
  };
  lastYrSeries.id = lastYrSeries.name;
  fiveYrRange.id = fiveYrRange.name;
  fiveYrAvg.id = fiveYrAvg.name;
  lastYrSeries.data = currentYrData;
  fiveYrAvg.data = avgData;
  fiveYrRange.data = rangeData;
  return [lastYrSeries, fiveYrAvg, fiveYrRange];
}

/**
 *
 * @param {Object} fiveSeries - The return array from createFiveYearSeries
 * @param {boolean} dontCalculate - When true, the trend isnt calcualted, and the return value is undefined.
 * @returns {(Object|undefined)} - Object containing trend info to be loaded in ./dynamicText.js
 */
export function fiveYearTrend(fiveSeries, dontCalculate) {
  if (fiveSeries && !dontCalculate) {
    const [lastYrSeries, fiveYrAvg] = [fiveSeries[0], fiveSeries[1]];
    const dataForAvg = lastYrSeries.data.slice(-3);
    const monthsForAvg = dataForAvg.map((row) => row[0]);
    const fiveYrTrend = {};
    const lst = [
      [fiveYrAvg, "fiveYrQtr"],
      [lastYrSeries, "lastYrQtr"],
    ];
    lst.forEach((series) => {
      let last3 = series[0].data.filter((row) => monthsForAvg.includes(row[0]));
      last3 = last3.map((row) => row[1]);
      fiveYrTrend[series[1]] = arrAvg(last3);
    });
    return fiveYrTrend;
  }
  return undefined;
}
