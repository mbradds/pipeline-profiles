import test from "ava";
import { mapDates } from "../src/modules/datestone.js";
import {
  arrAvg,
  sortJson,
  sortJsonAlpha,
  rangeInclusive,
} from "../src/modules/util.js";
import { addSeriesParams } from "../src/dashboards/dashboardUtil.js";
import {
  createFiveYearSeries,
  fiveYearTrend,
} from "../src/modules/fiveYear.js";
import { EventTrend } from "../src/modules/dashboard/EventTrend.js";

const fiveYrLang = {
  fiveYr: {
    lastYrName: (lastYear) => `${lastYear} Throughput (last year of data)`,
    avgName: "Five-Year Average",
    rangeName: (min, max) => `Five-Year Range (${min + 1}-${max - 1})`,
    notEnough: "Not enough data to calculate five-year average",
  },
};

function macroIs(t, input, expected) {
  t.is(input, expected);
}
function macroDeep(t, input, expected) {
  t.deepEqual(input, expected);
}
macroIs.title = (providedTitle = "") => `${providedTitle}`.trim();
macroDeep.title = (providedTitle = "") => `${providedTitle}`.trim();
// macroIs.title = (providedTitle = "", input, expected) =>
//   `${providedTitle} ${input} = ${expected}`.trim();

test("arrAvg", (t) => {
  const testArr = [1, 2, 3, 4, 5];
  t.is(arrAvg(testArr), 3);
});

test("arrAvg2", (t) => {
  const testArr = [5, 5, 5, 5, 5];
  t.is(arrAvg(testArr), 5);
});

test("rangeInclusive", (t) => {
  const start = 3;
  const end = 10;
  const range = rangeInclusive(start, end);
  t.is(range[0], 3);
  t.is(range[range.length - 1], 10);
  t.is(range.length, 8);
});

test("sortJson", (t) => {
  const testJson = [{ value: 4 }, { value: 5 }, { value: 45 }];
  const sorted = sortJson(testJson);
  t.is(sorted[0].value, 45);
});

test("sortJsonAlpha", (t) => {
  const testJson = [
    { value: "grapes" },
    { value: "apples" },
    { value: "oranges" },
  ];
  const sorted = sortJsonAlpha(testJson, "value");
  t.is(sorted[0].value, "apples");
});

// addSeriesParams (used in traffic and apportionment)
const seriesWithDate = [
  { name: "date", min: [2005, 11, 1] },
  { id: "i", data: [1, 2, 3] },
];
const unitsHolder = { base: "one", current: "one", conversion: 50 };
const s = addSeriesParams(seriesWithDate, unitsHolder, true);
const sNoFive = addSeriesParams(seriesWithDate, unitsHolder, false);
test("addSeriesParams id", macroIs, s[0][0].id, "i");
test("addSeriesParams type", macroIs, s[0][0].type, "area");
test(
  "addSeriesParams min date",
  macroDeep,
  new Date(parseInt(Object.keys(s[1])[0])),
  new Date(2006, 0, 1)
);

test(
  "addSeriesParams max date",
  macroDeep,
  new Date(parseInt(Object.keys(s[1])[2])),
  new Date(2006, 2, 1)
);

test("addseriesParams No Five vs Five", macroDeep, s[0], sNoFive[0]);
test("addseriesParams No Five undefined", macroIs, sNoFive[1], undefined);

// test five year average calculation
function generateTestData(months = 60) {
  let timeSeries = [];
  let [m0, m1] = [0, months];
  while (m0 <= m1) {
    timeSeries.push(5);
    m0++;
  }
  timeSeries = mapDates(timeSeries, new Date(2015, 0, 1), "monthly");
  const timeObj = {};

  timeSeries.forEach((row) => {
    timeObj[row[0]] = new Date(parseInt(row[0])).getMonth() + 1;
  });
  timeObj.lastDate = timeSeries[timeSeries.length - 1][0];
  const fiveYr = createFiveYearSeries(timeObj, fiveYrLang);
  return fiveYr;
}

const fiveSeries1 = generateTestData(59);
test("not enough five year data", macroDeep, fiveSeries1[1].data, []);

const fiveSeries2 = generateTestData(65);

test("five years (5.5 years) current year", (t) => {
  t.is(fiveSeries2[0].data.length, 6);
  t.is(fiveSeries2[0].data[0][1], 1);
  t.is(fiveSeries2[0].name, "2020 Throughput (last year of data)");
});

test("five years (5.5 years) avg + range data", (t) => {
  t.is(fiveSeries2[1].data.length, 12);
  t.is(fiveSeries2[1].data[0][1], 1);
  t.is(fiveSeries2[1].data[11][1], 12);

  t.is(fiveSeries2[2].data.length, 12);
  t.is(fiveSeries2[2].name, "Five-Year Range (2015-2019)");
  t.is(fiveSeries2[2].data[0].length, 3);
  t.is(fiveSeries2[2].data[0][0], "1");
  t.is(fiveSeries2[2].data[0][1], 1);
  t.is(fiveSeries2[2].data[0][2], 1);
});

test("five year trend", (t) => {
  const trend = fiveYearTrend(fiveSeries2, false);
  t.is(fiveYearTrend(fiveSeries2, true), undefined);
  t.is(trend.fiveYrQtr, 5);
  t.is(trend.lastYrQtr, 5);
});

test("EventTrend dummy series", (t) => {
  const yearList = [2015, 2016, 2019];
  const dummySeries = EventTrend.dummyYears(yearList, "list");
  t.is(dummySeries.name, "dummy");
  t.is(dummySeries.showInLegend, false);
  t.is(dummySeries.data[0][0], 2015);
  t.is(dummySeries.data[dummySeries.data.length - 1][0], 2021);
});
