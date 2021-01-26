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

export const dateFormatString = "%b %d, %Y";

// all conversions are in multiplication format (always multiply the number by the "conversions" value)
export const conversions = { "m3 to bbl": 6.2898, "bbl to m3": 1 / 6.2898 };

export const sortJson = (obj, colName = "value") => {
  return obj.slice().sort((a, b) => b[colName] - a[colName]);
};

export const currentDate = () => {
  var today = new Date();
  today.setUTCHours(0);
  today.setUTCMinutes(0);
  today.setUTCSeconds(0);
  today.setUTCMilliseconds(0);
  return today.getTime();
};

//takes in a json object and checks if the column has data
export const checkIfValid = (data) => {
  let valid = false;
  for (var t = 0; t < data.length; t++) {
    if (data[t]["y"] != null && data[t]["y"] != 0) {
      valid = true;
      break;
    }
  }
  return valid;
};

//gets the unique regions to populate the dropdown
export const getUnique = (items, filterColumns) => {
  var lookup = {};
  var result = [];
  for (var item, i = 0; (item = items[i++]); ) {
    var name = item[filterColumns];
    if (!(name in lookup)) {
      lookup[name] = 1;
      result.push(name);
    }
  }

  return result;
};

export const filterData = (data, filters) => {
  if (filters !== false) {
    for (const [key, value] of Object.entries(filters)) {
      if (!Array.isArray(value)) {
        data = data.filter((row) => row[key] == value);
      } else {
        value.map((filterValue) => {
          data = data.filter((row) => row[key] == filterValue);
        });
      }
    }
  }
  return data;
};

export const creditsClick = (chart, link) => {
  chart.credits.element.onclick = function () {
    window.open(link, "_blank");
  };
};

const symbolHTML = (symbolName) => {
  var symbols = {
    circle: "&#9679",
    diamond: "&#9670",
    square: "&#9632",
    triangle: "&#9650",
    "triangle-down": "&#9660",
  };

  return symbols[symbolName];
};

export const tooltipPoint = (unitsCurrent) => {
  return `<tr><td> <span style="color: {series.color}">&#9679</span> {series.name}: </td><td style="padding:0"><b>{point.y} ${unitsCurrent}</b></td></tr>`;
};

export const tooltipSymbol = (event, unitsCurrent, shared = true) => {
  if (shared) {
    return `<tr><td> <span style="color: ${event.series.color}">${symbolHTML(
      event.point.graphic.symbolName
    )}</span> ${event.series.name}: </td><td style="padding:0"><b>${
      event.point.y
    } ${unitsCurrent}</b></td></tr>`;
  }
};
