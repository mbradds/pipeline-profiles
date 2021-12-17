/**
 * @file TODO: replace this file with the relevant npm package: https://www.npmjs.com/package/datestone
 */

const changeValue = (u) => {
  const dontConvert = (row) => row;
  const convertNoRound = (row) => row * u.conversion;
  const convertWithRound = (row) =>
    parseFloat((row * u.conversion).toFixed(u.round));
  const rowFunction = u.round >= 0 ? convertWithRound : convertNoRound;
  if (u.convert) {
    if (["*", "/", "+", "-"].includes(u.operation)) {
      return (row) => (row ? rowFunction(row) : null);
    }
    return dontConvert;
  }
  return dontConvert;
};
const getDateFunction = (frequency) => {
  if (frequency === "daily" || frequency === "d") {
    return (d, i) => d.setDate(d.getDate() + i);
  }
  if (frequency === "yearly" || frequency === "y") {
    return (d, i) => d.setFullYear(d.getFullYear() + i);
  }
  return (d, i) => d.setMonth(d.getMonth() + i);
};
const addRow = (units, increment, datePlusPlus) => (row, startDate) => ({
  dateNew: datePlusPlus(startDate, increment),
  valueNew: changeValue(units)(row),
});
const determineIncrement = (method) =>
  method === "backward" || method === "b" ? -1 : 1;
/**
 * Converts an array of numeric data into a multi-dimensional array of [[date, value]] pairs starting with an input date.
 * @param {Array} series Input list of numeric data.
 * @param {Date} date The start date [method=forward] or end date [method=backward] for the new date column.
 * @param {string} [frequency=monthly] daily/d, monthly/m, or yearly/y time interval applied ascending [method=forward] or descending [method=backward] to each date.
 * @param {string} [method=forward] Fills the date column with ascending dates starting with input date.
 * @param {Object} [transform={ convert: false, operation: "none", conversion: 0, round: -1 }] Apply a transformation/unit conversion to each value in the input series.
 * @returns {Array}
 */
const mapDates = (
  series,
  date,
  frequency = "monthly",
  method = "forward",
  transform = { convert: false, operation: "none", conversion: 0, round: -1 }
) => {
  // date needs to be de-incremented by one unit to avoid if statement checking for first date addition
  const datePlusPlus = getDateFunction(frequency);
  const dateMinusOne = new Date(datePlusPlus(date, -1));
  const addFunction = addRow(
    transform,
    determineIncrement(method),
    datePlusPlus
  );
  return series.map((row) => {
    const { dateNew, valueNew } = addFunction(row, dateMinusOne);
    return [dateNew, valueNew];
  });
};
/**
 * Adds a date column to a JSON dataset based on a given start or end date.
 * @param {Array} series The input JSON data without a date column.
 * @param {Date} date The start date [method=forward] or end date [method=backward] for the new date column.
 * @param {string} valueCol The column name of the numeric data.
 * @param {string} [dateCol=date] The column name/key to be assigned to the new date column.
 * @param {string} [frequency=monthly] daily/d, monthly/m, or yearly/y time interval applied ascending [method=forward] or descending [method=backward] to each date.
 * @param {string} [method=forward] Fills the date column with ascending dates starting with input date.
 * @param {Object} [transform={ convert: false, operation: "none", conversion: 0, round: -1 }] Apply a transformation/unit conversion to each value in valueCol.
 * @returns {Array} JSON style array with new date column and optional conversion on numeric data column.
 */
const mapDatesToJson = (
  series,
  date,
  valueCol,
  dateCol = "date",
  frequency = "monthly",
  method = "forward",
  transform = { convert: false, operation: "none", conversion: 0, round: -1 }
) => {
  // date needs to be de-incremented by one unit to avoid if statement checking for first date addition
  const datePlusPlus = getDateFunction(frequency);
  const dateMinusOne = new Date(datePlusPlus(date, -1));
  const addFunction = addRow(
    transform,
    determineIncrement(method),
    datePlusPlus
  );
  return series.map((row) => {
    const value = row[valueCol];
    const newRow = row;
    const { dateNew, valueNew } = addFunction(value, dateMinusOne);
    newRow[dateCol] = dateNew;
    newRow[valueCol] = valueNew;
    return newRow;
  });
};
/**
 * Generate a nested array of [[start date], [end date], value] for a given start date, end date, and value.
 * @param {Array} start Start date [year, month, day]
 * @param {Array} end End date [year, month, day]
 * @param {number} value Numeric value applied to each period between start and end.
 * @param {string} [frequency=daily] daily/d, monthly/m, or yearly/y time intervals required between start and end.
 * @param {string} [method=forward] fill the array beginning with start (forward) to end, or from end descending to start (backward).
 * @param {Object} [transform={ convert: false, operation: "none", conversion: 0, round: -1 }] Apply a transformation/unit conversion to value.
 * @returns {Array}
 */
const fillBetween = (
  start,
  end,
  value,
  frequency = "daily",
  method = "forward",
  transform = { convert: false, operation: "none", conversion: 0, round: -1 }
) => {
  const series = [];
  const startValue = value;
  let startDate = new Date(start[0], start[1], start[2]);
  const endDate = new Date(end[0], end[1], end[2]);
  const datePlusPlus = getDateFunction(frequency);
  startDate = new Date(datePlusPlus(startDate, -1));
  const addFunction = addRow(
    transform,
    determineIncrement(method),
    datePlusPlus
  );
  while (startDate < endDate) {
    const { dateNew, valueNew } = addFunction(startValue, startDate);
    series.push([dateNew, valueNew]);
    startDate = new Date(dateNew);
  }
  return series;
};
export { mapDates, mapDatesToJson, fillBetween };
