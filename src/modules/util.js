import { mapDates } from "./datestone";

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

export const sortJson = (obj, colName = "value") =>
  obj.slice().sort((a, b) => b[colName] - a[colName]);

export function sortJsonAlpha(lst, col) {
  function compareStrings(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
  }
  return lst.sort((a, b) => compareStrings(a[col], b[col]));
}

export function visibility(divList, status) {
  divList.forEach((div) => {
    const x = document.getElementById(div);
    if (status === "hide") {
      if (x.style.display !== "none") {
        x.style.display = "none";
      }
    } else if (status === "show") {
      if (x.style.display !== "block") {
        x.style.display = "block";
      }
    }
  });
}

export const arrAvg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

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

export function addSeriesParams(
  seriesWithDate,
  unitsHolder,
  buildFive,
  frequency = "monthly",
  section = "traffic",
  sorted = true
) {
  const minDate = seriesWithDate[0].min;
  let series = seriesWithDate.slice(1);
  if (sorted) {
    series = sortJsonAlpha(series, "name");
  }

  const isCapacity = (seriesName) => {
    if (
      seriesName === "Capacity" ||
      seriesName === "Import Capacity" ||
      seriesName === "Export Capacity"
    ) {
      return true;
    }
    return false;
  };

  const fiveYearData = {};
  const newSeries = series.map((s) => {
    const nextSeries = {};
    const startd = new Date(minDate[0], minDate[1] + 1, minDate[2]);

    nextSeries.id = s.name;
    Object.keys(s).forEach((key) => {
      const value = s[key];
      if (key !== "data") {
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
      if (isCapacity(nextSeries.name)) {
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
  if (section === "traffic") {
    const fiveYearDiv = document.createElement("div");
    fiveYearDiv.setAttribute("id", "traffic-hc-range");
    document.getElementById("traffic-hc-column").appendChild(fiveYearDiv);
  }

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
  document.getElementById(
    `select-units-radio-${section}`
  ).innerHTML = buttonHTML;
  const tm = defaultPoint.id === "35";
  return { unitsHolder, buildFive, hasImports, tm, commodity };
}

export function calculateFiveYrAvg(lastDate, dataObj) {
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

export function addUnitsDisclaimer(div, commodity, textFunction) {
  const unitsDisclaimer = document.getElementById(div);
  unitsDisclaimer.innerHTML = textFunction(commodity);
}
