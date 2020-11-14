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

// export const getUnique = (items, filterColumns) => {
//   var lookup = {};
//   var result = [];
//   for (var item, i = 0; (item = items[i++]); ) {
//     var name = item[filterColumns];
//     if (!(name in lookup)) {
//       lookup[name] = 1;
//       result.push(name);
//     }
//   }
//   return result;
// };

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

const totalsFromSeriesGeneration = (companiesNum, projectsNum) => {
  document.getElementById("companies_number").innerText = companiesNum;
  document.getElementById("projects_number").innerText = projectsNum;
};

const addToDrop = (drop_name, optionValue, optionText) => {
  $(drop_name).append(
    $("<option>", {
      value: optionValue,
      text: optionText,
    })
  );
};

export const companyDrop = (companies) => {
  var currentCompany = $("#select-company").val();
  if ($("#select-company").is(":enabled")) {
    $("#select-company").empty();
    addToDrop("#select-company", "All", "All");
    for (const [key, value] of Object.entries(companies)) {
      addToDrop("#select-company", value.name, value.name);
    }
  }
  $("#select-company").selectpicker("refresh");
  $("#select-company").val(currentCompany).change();
};

//One pass series generation
export const createConditionSeries = (data, filters) => {
  data = applyId(data);

  const objectToList = (obj, level) => {
    var unorderedSeries = [];

    if (level == "Company") {
      for (const [key, value] of Object.entries(obj)) {
        unorderedSeries.push({ name: key, y: value, drilldown: key });
      }
    } else if (level == "Project") {
      for (const [pName, pObj] of Object.entries(obj)) {
        var projData = [];
        for (const [key, value] of Object.entries(pObj)) {
          projData.push({ name: key, y: value, drilldown: key });
        }
        unorderedSeries.push({ name: pName, id: pName, data: projData });
      }
    } else if (level == "Theme") {
      var themeLevel = [];
      for (const [pName, pObj] of Object.entries(obj)) {
        var themeData = [];
        for (const [key, value] of Object.entries(pObj)) {
          themeData.push({ name: key, y: value, drilldown: pName + "_" + key }); //could add another drilldown layer here.
          themeLevel.push({
            name: key,
            id: pName + "_" + key,
            data: [{ name: key, y: value }],
          });
        }
        unorderedSeries.push({ name: pName, id: pName, data: themeData });
      }
      return [unorderedSeries, themeLevel];
    }
    return unorderedSeries;
  };

  for (const [key, value] of Object.entries(filters)) {
    if (value !== "All") {
      data = data.filter((row) => row[key] == value);
    }
  }

  var [companies, projects, themes, subThemes] = [{}, {}, {}, {}];
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
  });

  totalsFromSeriesGeneration(companyCount, projectCount);
  companies = sortResults(objectToList(companies, "Company"), "Company");
  projects = sortResults(objectToList(projects, "Project"), "Project");
  var [themes, subThemes] = objectToList(themes, "Theme");
  themes = sortResults(themes, "Theme");
  var seriesData = [
    {
      name: "Conditions by Company",
      colorByPoint: false,
      data: companies,
    },
  ];
  return [seriesData, projects.concat(themes).concat(subThemes), companies];
};

export const createLastSeries = (data, filters) => {
  for (const [key, value] of Object.entries(filters)) {
    if (value !== "All") {
      data = data.filter((row) => row[key] == value);
    }
  }
  data = applyId(data);
  var categories = [];
  var seriesEffective = {
    name: "Condition Effective Date",
    pointWidth: 20,
    color: "#054169",
    data: [],
  };
  var seriesSunset = {
    name: "Condition Sunset Date",
    pointWidth: 20,
    color: "#FF821E",
    data: [],
  };
  data.map((row, rowNum) => {
    categories.push(row.id);
    if (row["Sunset Date"] != null) {
      seriesSunset.data.push({
        name: row.id,
        x: row["Sunset Date"],
        x2: row["Sunset Date"] + 86400000 * 5,
        y: rowNum,
        color: "#FF821E",
      });
    }

    seriesEffective.data.push({
      name: row.id,
      x: row["Effective Date"],
      x2: row["Effective Date"] + 86400000 * 5,
      y: rowNum,
      color: "#054169",
      onClickText: row["Condition"],
    });
  });

  if (seriesSunset.data.length > 0) {
    return [[seriesEffective].concat([seriesSunset]), categories];
  } else {
    return [[seriesEffective], categories];
  }
};
