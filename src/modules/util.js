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
  "Bcf/d to Million m3/d": 28.32,
  "Mb/d to Thousand m3/d": 159,
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
  section = "traffic"
) {
  const minDate = seriesWithDate[0].min;
  let series = seriesWithDate.slice(1);
  series = sortJsonAlpha(series, "name");

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

  const addRow = (units, freq, seriesName, buildFiveYr) => {
    const incremendDate = (f) => {
      if (f === "daily") {
        return function (date) {
          return date.setDate(date.getDate() + 1);
        };
      }
      return function (date) {
        return date.setMonth(date.getMonth() + 1);
      };
    };

    const calcRowUnits = (u) => {
      if (u.base !== u.current) {
        return function (row) {
          return row ? row * u.conversion : null;
        };
      }
      return function (row) {
        return row;
      };
    };

    const dateFunction = incremendDate(freq);
    const rowFunction = calcRowUnits(units);
    if (!isCapacity(seriesName)) {
      if (buildFiveYr) {
        return function (row, startDate) {
          const nextDate = dateFunction(startDate);
          return [nextDate, rowFunction(row)];
        };
      }
      return function (row, startDate) {
        const nextDate = dateFunction(startDate);
        return [nextDate, rowFunction(row)];
      };
    }
    return function (row, startDate) {
      const nextDate = dateFunction(startDate);
      return [nextDate, rowFunction(row)];
    };
  };

  const fiveYearData = {};
  const newSeries = series.map((s) => {
    const nextSeries = {};
    const startd = new Date(minDate[0], minDate[1], minDate[2]);

    nextSeries.id = s.name;
    Object.keys(s).forEach((key) => {
      const value = s[key];
      if (key !== "data") {
        nextSeries[key] = value;
      }
    });

    const addFunction = addRow(unitsHolder, frequency, s.name, buildFive);
    nextSeries.data = s.data.map((row) => {
      const [nextDate, rowCalc] = addFunction(row, startd);
      fiveYearData[nextDate] = rowCalc;
      fiveYearData.lastDate = nextDate;
      return [nextDate, rowCalc];
    });

    if (section === "traffic") {
      if (isCapacity(nextSeries.name)) {
        nextSeries.type = "line";
        nextSeries.zIndex = 6;
        nextSeries.lineWidth = 3;
      } else {
        nextSeries.type = "area";
        nextSeries.zIndex = 5;
        nextSeries.lineWidth = 1;
      }
    } else if (section === "apportionment") {
      if (nextSeries.type === "line") {
        nextSeries.zIndex = 6;
        nextSeries.lineWidth = 3;
        nextSeries.color = cerPalette.Sun;
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
  if (defaultUnit === "Bcf/d") {
    secondUnit = "Million m3/d";
    const fiveYearDiv = document.createElement("div");
    fiveYearDiv.setAttribute("id", "traffic-hc-range");
    document.getElementById("traffic-hc-column").appendChild(fiveYearDiv);
    if (defaultPoint.id === "7") {
      // 7 = St. Stephen
      hasImports = true;
    }
    buildFive = true;

    unitsHolder.conversion = conversions["Bcf/d to Million m3/d"];
  } else if (defaultUnit === "Mb/d") {
    secondUnit = "Thousand m3/d";
    unitsHolder.conversion = conversions["Mb/d to Thousand m3/d"];
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
