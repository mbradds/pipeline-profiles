const getData = (Url) => {
  var Httpreq = new XMLHttpRequest(); // a new request
  Httpreq.open("GET", Url, false);
  Httpreq.send(null);
  return Httpreq.responseText;
};

const conditionsData = JSON.parse(
  getData("/src/conditions_drill/conditions.json")
);

const getUnique = (items, filterColumns) => {
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

const applyId = (data) => {
  data = data.map((v) => {
    v.id = v["Instrument Number"] + "_" + v["Condition Number"];
    return v;
  });
  data = data.filter((row) => row["Short Project Name"] !== "SAM/COM");
  return data;
};

const conditionsFilters = {
  "Project Status": "All",
  "Condition Status": "All",
  Company: "All",
  "Short Project Name": "All",
  "Theme(s)": "All",
};

const conditionsFiltersDrill = {
  "Project Status": "All",
  "Condition Status": "All",
  Company: "All",
  "Short Project Name": "All",
  "Theme(s)": "All",
};

const sortResults = (result, level) => {
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

//One pass series generation
const createConditionSeries = (data, filters) => {
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
  data.map((row, rowNum) => {
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
  // console.log(companies);
  // console.log(projects);
  // console.log(themes);
  var seriesData = [
    {
      name: "Conditions by Company",
      colorByPoint: false,
      data: companies,
    },
  ];
  return [seriesData, projects.concat(themes).concat(subThemes)];
};

const createLastSeries = (data, filters) => {
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

const updateFiltersOnDrill = (level, name) => {
  if (level == 1) {
    conditionsFiltersDrill["Short Project Name"] = "All";
    //console.log('top level')
  } else if (level == 2) {
    conditionsFiltersDrill.Company = name;
    //console.log('update company ',name)
  } else if (level == 3) {
    conditionsFiltersDrill["Short Project Name"] = name;
    //console.log('update project ',name)
  } else if (level == 4) {
    conditionsFiltersDrill["Theme(s)"] = name;
    //console.log('update theme ',name)
  }
};

//one pass timing
var t0Single = performance.now();
var [seriesData, drilldownSeries] = createConditionSeries(
  conditionsData,
  conditionsFilters
);
var t1Single = performance.now();
console.log("Single Pass: " + (t1Single - t0Single) + " milliseconds.");
var lastLevelContainer = document.getElementById("container-last");
var drillContainer = document.getElementById("container-chart")

var conditionTextContainer = document.getElementById("container_text")
const setConditionText = (onClickText) => {
    conditionTextContainer.innerText = onClickText
}


const createLastChart = (series, categories) => {
  return new Highcharts.chart("container-last", {
    chart: {
      type: "xrange",
      zoomType: "y",
      animation: true,
      height: 700,
      width: 1000,
    },
    title: {
      text: "",
    },

    xAxis: {
      type: "datetime",
    },

    yAxis: {
      title: {
        text: "",
      },
      type: "category",
      categories: categories,
      reversed: true,
      labels: {
        events: {
          click: function () {
            //console.log(this.value);
            //console.log(this)
            //console.log(this.axis.pos,"y axis number")
            console.log(this.axis.series[0].data[this.pos]['onClickText'])
            //setConditionText(this.axis.series[0].data[this.pos]['onClickText'])
          },
        },
      },
    },
    series: series,
  });
};


const createGraph = (seriesData, drilldownSeries) => {
  var level = 1;
  return new Highcharts.chart("container-chart", {
    chart: {
      //height: 700,
      type: "bar",
      zoomType: "x",
      animation: true,
      events: {
        load: function () {
          this.credits.element.onclick = function () {
            window.open(
              "https://www.cer-rec.gc.ca/index-eng.html",
              "_blank" // <- This is what makes it open in a new window.
            );
          };
        },
        drilldown: function (e) {
          //console.log(e.seriesOptions.name,"drilldown")
          if (level < 4) {
            level++;
            updateFiltersOnDrill(level, e.seriesOptions.name);
          }
          if (level == 4) {
            this.update({
              chart: { height: 75 },
              xAxis: { visible: false },
              yAxis: { visible: false },
            });
            //make the last level chart container larger
            lastLevelContainer.style.display = "block"
            drillContainer.style.height = 75
            lastLevelContainer.style.height = 700 - 75;
            const [lastSeries, categories] = createLastSeries(
              conditionsData,
              conditionsFiltersDrill
            );
            createLastChart(lastSeries,categories)
          }
          // updateFiltersOnDrill(level, e.seriesOptions.name);
          console.log(conditionsFiltersDrill);
        },
        drillup: function (e) {
          //console.log(e.seriesOptions.name,"drillup")
          if (level == 4) {
            this.update({
              chart: { height: 700 },
              yAxis: { visible: true },
              xAxis: { visible: true },
            });
            //lastLevelContainer.style.height = 25;
            //lastLevelContainer.style.display = "none"
          }
          level--;
          updateFiltersOnDrill(level, e.seriesOptions.name);
          lastLevelContainer.style.display = "none"
          console.log(conditionsFiltersDrill);
        },
      },
    },

    title: {
      text: null,
    },

    plotOptions: {
      series: {
        cropThreshold: 800, //solution to axis getting messed up on drillup: https://www.highcharts.com/forum/viewtopic.php?t=40702
        pointWidth: 20,
        events: {
          legendItemClick: function () {
            return false;
          },
        },
      },
    },

    credits: {
      text: "Canada Energy Regulator",
      href: "https://www.cer-rec.gc.ca/index-eng.html",
    },

    xAxis: {
      type: "category",
      title: {
        text: null,
      },
    },

    yAxis: {
      showEmpty: false,
      title: {
        text: "Number of Conditions",
      },
    },

    series: seriesData,

    drilldown: {
      series: drilldownSeries,
    },
  });
};

var chart = createGraph(seriesData, drilldownSeries);

var select_status = document.getElementById("select_status");
select_status.addEventListener("change", (select_status) => {
  conditionsFilters["Condition Status"] = select_status.target.value;
  conditionsFiltersDrill["Condition Status"] = select_status.target.value;
  var [seriesData, drilldownSeries, counts] = createConditionSeries(
    conditionsData,
    conditionsFilters
  );

  chart.update({
    drilldown: {
      series: drilldownSeries,
    },
  });

  var ddCurrent = chart.series[0].userOptions.id; //gets the current level of the drilldown
  var ddSeries = chart.options.drilldown.series;
  if (ddCurrent == undefined) {
    //chart.series[0].setData(chart.options.series[0].data);
    chart.update({
      series: seriesData,
    });
  } else {
    for (var i = 0, ie = ddSeries.length; i < ie; ++i) {
      if (ddSeries[i].id === ddCurrent) {
        chart.series[0].setData(ddSeries[i].data);
      }
    }
  }
  // how to update data after drilldown:
  // https://www.highcharts.com/forum/viewtopic.php?t=40389
  // http://jsfiddle.net/06oesrs1/
});
