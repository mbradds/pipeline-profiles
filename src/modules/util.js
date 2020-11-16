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

export const getData = (Url) => {
  var Httpreq = new XMLHttpRequest(); // a new request
  Httpreq.open("GET", Url, false);
  Httpreq.send(null);
  return Httpreq.responseText;
};

const applyId = (data) => {
  data = data.map((v) => {
    v.id = v["Instrument Number"] + " - " + v["Condition Number"];
    return v;
  });
  data = data.filter((row) => row["Short Project Name"] !== "SAM/COM");
  return data;
};

export const sortResults = (result, level) => {
  if (level == "Company") {
    result.sort(function (a, b) {
      return b.y - a.y;
    });
  } else if (level == "Project" || level == "Theme") {
    result.map((v, i) => {
      v.data.sort(function (a, b) {
        return b.y - a.y;
      });
    });
  }

  return result;
};

export const sortSeriesData = (data) => {
  data.sort(function (a, b) {
    return b.y - a.y;
  });
  return data;
};

const totalsFromSeriesGeneration = (companiesNum, projectsNum) => {
  document.getElementById("companies_number").innerText = companiesNum;
  document.getElementById("projects_number").innerText = projectsNum;
};

//One pass series generation
//TODO: when looping though, generate an object that contains a list of valid select options. This could probably be added to the series
export const createConditionSeries = (data, filters) => {
  data = applyId(data);
  const addEfectivePoint = (row, y) => {
    return {
      name: row.id,
      x: row["Effective Date"],
      x2: row["Effective Date"] + 86400000 * 5,
      y: y,
      color: "#054169",
      onClickText: row["Condition"],
    };
  };

  const addSunsetPoint = (row, y) => {
    if (row["Sunset Date"] != null) {
      return {
        name: row.id,
        x: row["Sunset Date"],
        x2: row["Sunset Date"] + 86400000 * 5,
        y: y,
        color: "#FF821E",
      };
    } else {
      return false;
    }
  };
  const objectToList = (obj, level) => {
    var unorderedSeries = [];
    var ddSeries = {};
    if (level == "Company") {
      for (const [key, value] of Object.entries(obj)) {
        unorderedSeries.push({
          name: key,
          y: value,
          drilldown: key,
          xAxis: "id_category",
          yAxis: "id_yLinear",
        });
      }
      return unorderedSeries;
    } else if (level == "Project") {
      for (const [pName, pObj] of Object.entries(obj)) {
        var projData = [];
        for (const [key, value] of Object.entries(pObj)) {
          projData.push({ name: key, y: value, drilldown: key });
        }
        ddSeries[pName] = {
          name: pName,
          id: pName,
          data: projData,
          xAxis: "id_category",
          yAxis: "id_yLinear",
        };
      }
      return ddSeries;
    } else if (level == "Theme") {
      for (const [pName, pObj] of Object.entries(obj)) {
        var themeData = [];
        for (const [key, value] of Object.entries(pObj)) {
          themeData.push({
            name: key,
            y: value,
            drilldown: pName + " - " + key,
          });
        }
        ddSeries[pName] = {
          name: pName,
          id: pName,
          data: themeData,
          xAxis: "id_category",
          yAxis: "id_yLinear",
        };
      }
      return ddSeries;
    } else if (level == "id") {
      for (const [pNameTheme, tObj] of Object.entries(obj)) {
        ddSeries[pNameTheme] = {
          name: pNameTheme,
          type: "xrange",
          pointWidth: 20,
          id: pNameTheme,
          data: tObj.data,
          xAxis: "id_datetime",
          yAxis: "id_yCategory",
        };
      }
      return ddSeries;
    }
  };

  for (const [key, value] of Object.entries(filters)) {
    if (value !== "All") {
      data = data.filter((row) => row[key] == value);
    }
  }

  var [companies, projects, themes, id, idSunset] = [{}, {}, {}, {}, {}];
  var [companyCount, projectCount] = [0, 0];
  var statusSet = new Set();
  data.map((row, rowNum) => {
    statusSet.add(row["Condition Status"]);
    var companyName = row.Company;
    if (companies.hasOwnProperty(companyName)) {
      companies[companyName]++;
    } else {
      companyCount++;
      companies[companyName] = 1;
    }

    var projName = row["Short Project Name"];
    if (projects.hasOwnProperty(companyName)) {
      if (projects[companyName].hasOwnProperty(projName)) {
        projects[companyName][projName]++;
      } else {
        projects[companyName][projName] = 1;
        projectCount++;
      }
    } else {
      projectCount++;
      projects[companyName] = { [projName]: 1 };
    }

    var themeName = row["Theme(s)"];
    if (themes.hasOwnProperty(projName)) {
      if (themes[projName].hasOwnProperty(themeName)) {
        themes[projName][themeName]++;
      } else {
        themes[projName][themeName] = 1;
      }
    } else {
      themes[projName] = { [themeName]: 1 };
    }

    var projTheme = projName + " - " + themeName;
    if (id.hasOwnProperty(projTheme)) {
      id[projTheme].categories.add(row.id);
      var y = id[projTheme].categories.size - 1;
      id[projTheme].data.push(addEfectivePoint(row, y));
      var sunset = addSunsetPoint(row, y);
      if (sunset) {
        id[projTheme].data.push(sunset);
      }
    } else {
      id[projTheme] = {
        categories: new Set(),
        name: row.id,
        pointWidth: 20,
        data: [addEfectivePoint(row, 0)],
      };
      id[projTheme].categories.add(row[id]);
      var sunset = addSunsetPoint(row, 0);
      if (sunset) {
        id[projTheme].data.push(sunset);
      }
    }
  });
  totalsFromSeriesGeneration(companyCount, projectCount);
  companies = sortResults(objectToList(companies, "Company"), "Company");
  projects = objectToList(projects, "Project");
  themes = objectToList(themes, "Theme");
  id = objectToList(id, "id");

  var seriesData = [
    {
      name: "Conditions by Company",
      colorByPoint: false,
      data: companies,
      xAxis: "id_category",
      yAxis: "id_yLinear",
    },
  ];

  return [seriesData, projects, themes, id];
};
