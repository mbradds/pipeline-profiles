import test from "ava";
import {
  arrAvg,
  sortJson,
  sortJsonAlpha,
  addSeriesParams,
} from "../src/modules/util";

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
  { name: "i", data: [1, 2, 3] },
];
const unitsHolder = { base: "one", current: "one", conversion: 50 };
const s = addSeriesParams(seriesWithDate, unitsHolder, true);
const sNoFive = addSeriesParams(seriesWithDate, unitsHolder, false);

test("addSeriesParams id", macroIs, s[0][0].id, "i");
test("addSeriesParams type", macroIs, s[0][0].type, "area");
test(
  "addSeriesParams min date",
  macroDeep,
  new Date(s[1][0][0]),
  new Date(2006, 0, 1)
);

test(
  "addSeriesParams max date",
  macroDeep,
  new Date(s[1][2][0]),
  new Date(2006, 2, 1)
);

test("addseriesParams No Five vs Five", macroDeep, s[0], sNoFive[0]);
test("addseriesParams No Five undefined", macroIs, sNoFive[1], undefined);
