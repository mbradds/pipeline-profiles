/**
 * @file TODO: replace this file with the relevant npm package: https://www.npmjs.com/package/datestone
 */

function changeValue(u) {
  let valueTransformer;
  const dontConvert = function noTransform(row) {
    return row;
  };
  const convertNoRound = (row) => row * u.conversion;
  const convertWithRound = (row) =>
    parseFloat((row * u.conversion).toFixed(u.round));
  let rowFunction = convertNoRound;
  if (u.round >= 0) {
    rowFunction = convertWithRound;
  }
  if (u.convert) {
    if (u.operation === "*") {
      valueTransformer = function convert(row) {
        return row ? rowFunction(row) : null;
      };
    } else if (u.operation === "/") {
      valueTransformer = function convert(row) {
        return row ? rowFunction(row) : null;
      };
    } else if (u.operation === "+") {
      valueTransformer = function convert(row) {
        return row ? rowFunction(row) : null;
      };
    } else if (u.operation === "-") {
      valueTransformer = function convert(row) {
        return row ? rowFunction(row) : null;
      };
    } else {
      valueTransformer = dontConvert;
    }
  } else {
    valueTransformer = dontConvert;
  }
  return valueTransformer;
}
function getDateFunction(frequency) {
  const dFunc = (d, i) => d.setDate(d.getDate() + i);
  const mFunc = (d, i) => d.setMonth(d.getMonth() + i);
  const qFunc = (d, i) => d.setMonth(d.getMonth() + (i + 2));
  const yFunc = (d, i) => d.setFullYear(d.getFullYear() + i);
  let datePlusPlus = mFunc;
  if (frequency === "daily" || frequency === "d") {
    datePlusPlus = dFunc;
  } else if (frequency === "monthly" || frequency === "m") {
    datePlusPlus = mFunc;
  } else if (frequency === "quarterly" || frequency === "q") {
    datePlusPlus = qFunc;
  } else if (frequency === "yearly" || frequency === "y") {
    datePlusPlus = yFunc;
  }
  return datePlusPlus;
}
function addRow(units, increment, datePlusPlus) {
  const rowFunction = changeValue(units);
  const adder = (row, startDate) => {
    const nextDate = datePlusPlus(startDate, increment);
    return { dateNew: nextDate, valueNew: rowFunction(row) };
  };
  return adder;
}
export function mapDates(
  series,
  date,
  frequency = "monthly",
  method = "forward",
  transform = { convert: false, operation: "none", conversion: 0, round: -1 }
) {
  let increment = 1;
  if (method === "backward" || method === "b") {
    increment = -1;
  }
  const datePlusPlus = getDateFunction(frequency);
  const dateMinusOne = new Date(datePlusPlus(date, -1));
  const addFunction = addRow(transform, increment, datePlusPlus);
  const seriesWithDate = series.map((row) => {
    const { dateNew, valueNew } = addFunction(row, dateMinusOne);
    return [dateNew, valueNew];
  });
  return seriesWithDate;
}

export function fillBetween(
  start,
  end,
  value,
  frequency = "daily",
  method = "forward",
  transform = { convert: false, operation: "none", conversion: 0, round: -1 }
) {
  let increment = 1;
  if (method === "backward" || method === "b") {
    increment = -1;
  }
  const series = [];
  const startValue = value;
  let startDate = new Date(start[0], start[1], start[2]);
  const endDate = new Date(end[0], end[1], end[2]);
  const datePlusPlus = getDateFunction(frequency);
  startDate = new Date(datePlusPlus(startDate, -1));
  const addFunction = addRow(transform, increment, datePlusPlus);
  while (startDate < endDate) {
    const { dateNew, valueNew } = addFunction(startValue, startDate);
    series.push([dateNew, valueNew]);
    startDate = new Date(dateNew);
  }
  return series;
}
