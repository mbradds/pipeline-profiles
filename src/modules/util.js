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

//TODO: this is how you add to a set on creation:
//const set1 = new Set([1, 2, 3, 4, 5]);

export const getToday = () => {
  var today = new Date(),
    day = 1000 * 60 * 60 * 24;

  // Set to 00:00:00:000 today
  today.setUTCHours(0);
  today.setUTCMinutes(0);
  today.setUTCSeconds(0);
  today.setUTCMilliseconds(0);
  return [today, day];
};

export const getData = (Url) => {
  var Httpreq = new XMLHttpRequest(); // a new request
  Httpreq.open("GET", Url, false);
  Httpreq.send(null);
  return Httpreq.responseText;
};

const addToDrop = (drop_name, optionValue, optionText) => {
  $(drop_name).append(
    $("<option>", {
      value: optionValue,
      text: optionText,
    })
  );
};

export const updateSelect = (options, selectName, from = "object") => {
  var currentOption = $(selectName).val();
  if ($(selectName).is(":enabled")) {
    $(selectName).empty();
    addToDrop(selectName, "All", "All");
    if (from == "object") {
      for (const [key, value] of Object.entries(options)) {
        addToDrop(selectName, value.name, value.name);
      }
    } else if (from == "array") {
      options.map((option) => {
        addToDrop(selectName, option, option);
      });
    }
  }
  $(selectName).selectpicker("refresh");
  $(selectName).val(currentOption).change();
};

export const updateAllSelects = (filters, currentSelect) => {
  for (const [key, value] of Object.entries(filters)) {
    if (key == "conditionStatus") {
      var selectName = "#select-status";
    } else if (key == "projectStatus") {
      var selectName = "#select-status-project";
    } else if (key == "conditionPhase") {
      var selectName = "#select-phase";
    }
    if (selectName !== currentSelect) {
      // && $(selectName).val() == "All") {
      updateSelect(Array.from(value), selectName, "array");
    }
  }
};

export const applyId = (data) => {
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

export const totalsFromSeriesGeneration = (projectsNum) => {
  document.getElementById("projects_number").innerText = projectsNum;
};

export const totalsFromCounts = (counts) => {
  document.getElementById(
    "open_conditions_number"
  ).innerText = counts.conditions.filter(
    (cond) => cond == "In Progress"
  ).length;
  document.getElementById(
    "closed_conditions_number"
  ).innerText = counts.conditions.filter((cond) => cond == "Closed").length;
  document.getElementById("instruments_number").innerText =
    counts.instruments.size;
};

export const relevantValues = (data, filters) => {
  data = data.filter((row) => row.Company == filters.Company);

  var [companyLevel, projectLevel, themeLevel, idLevel] = [{}, {}, {}, {}];
  companyLevel[filters.Company] = {
    conditionStatus: new Set(),
    projectStatus: new Set(),
  };

  data.map((row) => {
    companyLevel[filters.Company].conditionStatus.add(row["Condition Status"]);
    companyLevel[filters.Company].projectStatus.add(row["Project Status"]);

    if (projectLevel.hasOwnProperty(row['Short Project Name'])) {
      projectLevel[row['Short Project Name']].conditionStatus.add(row["Condition Status"])
      projectLevel[row['Short Project Name']].projectStatus.add(row["Project Status"])
    } else {
      projectLevel[row['Short Project Name']] = {
        conditionStatus: new Set(),
        projectStatus: new Set(),
      }
      projectLevel[row['Short Project Name']].conditionStatus.add(row["Condition Status"])
      projectLevel[row['Short Project Name']].projectStatus.add(row["Project Status"])
    }

    var projTheme = row['Short Project Name'] + " - " + row['Theme(s)'];

    if (themeLevel.hasOwnProperty(projTheme)){
      themeLevel[projTheme].conditionStatus.add(row['Condition Status'])
      themeLevel[projTheme].conditionPhase.add(row['Condition Phase'])
    } else {
      themeLevel[projTheme] = {
        conditionStatus: new Set(),
        conditionPhase: new Set(),
      }
      themeLevel[projTheme].conditionStatus.add(row['Condition Status'])
      themeLevel[projTheme].conditionPhase.add(row['Condition Phase'])
    }
  });

  return {'company':companyLevel,'project':projectLevel,'theme':themeLevel};
};

//One pass series generation
//TODO: when looping though, generate an object that contains a list of valid select options. This could probably be added to the series
export const createConditionSeries = (data, filters) => {
  const seriesColor = (filters) => {
    if (filters["Condition Status"] == "All") {
      return cerPalette["Ocean"];
    } else if (filters["Condition Status"] == "In Progress") {
      return cerPalette["Sun"];
    } else if (filters["Condition Status"] == "Closed") {
      return cerPalette["Cool Grey"];
    } else {
      return cerPalette["Forest"];
    }
  };

  var currentColor = seriesColor(filters);

  const addEfectivePoint = (row, y) => {
    return {
      name: row.id,
      x: row["Effective Date"],
      x2: row["Effective Date"] + 86400000 * 15,
      y: y,
      color: currentColor,
      onClickText: row["Condition"],
    };
  };

  const addSunsetPoint = (row, y) => {
    if (row["Sunset Date"] != null) {
      return {
        name: row.id,
        x: row["Sunset Date"],
        x2: row["Sunset Date"] + 86400000 * 15,
        y: y,
        color: cerPalette["Flame"],
      };
    } else {
      return false;
    }
  };
  const objectToList = (obj, level) => {
    var ddSeries = {};
    if (level == "Project") {
      var projData = [];
      for (const [key, value] of Object.entries(obj.data)) {
        projData.push({
          name: key,
          y: value,
          drilldown: key,
          color: currentColor,
          xAxis: "id_category",
          yAxis: "id_yLinear",
        });
      }
      ddSeries.name = filters.Company;
      ddSeries.colorByPoint = false;
      ddSeries.data = projData;
      ddSeries.filters = obj.filters;
      ddSeries.counts = obj.counts;
      ddSeries.xAxis = "id_category";
      ddSeries.yAxis = "id_yLinear";
      return ddSeries;
    } else if (level == "Theme") {
      for (const [pName, pObj] of Object.entries(obj)) {
        var themeData = [];
        for (const [key, value] of Object.entries(pObj.data)) {
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
          filters: pObj.filters,
          counts: pObj.counts,
          //color:currentColor,
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
          categories: Array.from(tObj.categories),
          filters: tObj.filters,
          counts: tObj.counts,
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

  var [projects, themes, id] = [{}, {}, {}];
  projects.data = {};
  projects.filters = {
    conditionStatus: new Set(),
    projectStatus: new Set(),
    conditionPhase: new Set(),
  };
  projects.counts = {
    conditions: [],
    instruments: new Set(),
  };

  var [projectCount] = [0];
  data.map((row, rowNum) => {
    //project level (first)
    var projName = row["Short Project Name"];
    if (projects.data.hasOwnProperty(projName)) {
      projects.data[projName]++;
    } else {
      projectCount++;
      projects.data[projName] = 1;
    }
    projects.filters.conditionStatus.add(row["Condition Status"]);
    projects.filters.projectStatus.add(row["Project Status"]);
    projects.filters.conditionPhase.add(row["Condition Phase"]);
    projects.counts.conditions.push(row["Condition Status"]);
    projects.counts.instruments.add(row["Instrument Number"]);

    //theme level (second)
    var themeName = row["Theme(s)"];
    if (themes.hasOwnProperty(projName)) {
      if (themes[projName].data.hasOwnProperty(themeName)) {
        themes[projName].data[themeName]++;
      } else {
        themes[projName].data[themeName] = 1;
      }
      themes[projName].filters.conditionStatus.add(row["Condition Status"]);
      themes[projName].filters.projectStatus.add(row["Project Status"]);
      themes[projName].filters.conditionPhase.add(row["Condition Phase"]);
      themes[projName].counts.conditions.push(row["Condition Status"]);
      themes[projName].counts.instruments.add(row["Instrument Number"]);
    } else {
      themes[projName] = {
        data: { [themeName]: 1 },
        filters: {
          conditionStatus: new Set(),
          projectStatus: new Set(),
          conditionPhase: new Set(),
        },
        counts: {
          conditions: [],
          instruments: new Set(),
        },
      };
      themes[projName].filters.conditionStatus.add(row["Condition Status"]);
      themes[projName].filters.projectStatus.add(row["Project Status"]);
      themes[projName].filters.conditionPhase.add(row["Condition Phase"]);
      themes[projName].counts.conditions.push(row["Condition Status"]);
      themes[projName].counts.instruments.add(row["Instrument Number"]);
    }

    var projTheme = projName + " - " + themeName;
    if (id.hasOwnProperty(projTheme)) {
      id[projTheme].categories.add(row.id);
      id[projTheme].filters.conditionStatus.add(row["Condition Status"]);
      id[projTheme].filters.projectStatus.add(row["Project Status"]);
      id[projTheme].filters.conditionPhase.add(row["Condition Phase"]);
      id[projTheme].counts.conditions.push(row["Condition Status"]);
      id[projTheme].counts.instruments.add(row["Instrument Number"]);
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
        filters: {
          conditionStatus: new Set(),
          projectStatus: new Set(),
          conditionPhase: new Set(),
        },
        counts: {
          conditions: [],
          instruments: new Set(),
        },
      };
      id[projTheme].categories.add(row.id);
      id[projTheme].filters.conditionStatus.add(row["Condition Status"]);
      id[projTheme].filters.projectStatus.add(row["Project Status"]);
      id[projTheme].filters.conditionPhase.add(row["Condition Phase"]);
      id[projTheme].counts.conditions.push(row["Condition Status"]);
      id[projTheme].counts.instruments.add(row["Instrument Number"]);
      var sunset = addSunsetPoint(row, 0);
      if (sunset) {
        id[projTheme].data.push(sunset);
      }
    }
  });

  projects = objectToList(projects, "Project");
  themes = objectToList(themes, "Theme");
  id = objectToList(id, "id");
  return [[projects], themes, id, currentColor, projectCount];
};
