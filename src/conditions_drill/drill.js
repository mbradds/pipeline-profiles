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

const applyId = (data, status) => {
  data = data.map((v) => {
    v.id = v["Instrument Number"] + "_" + v["Condition Number"];
    return v;
  });
  data = data.filter((row) => row["Short Project Name"] !== "SAM/COM");
  if (status !== "All") {
    data = data.filter((row) => row["Condition Status"] == status);
  }
  return data;
};

const applyId2 = (data) => {
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
  "Condition Type": "All",
};

const themeFilter = (row, t) => {
  return row["Theme(s)"] == t;
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

const applySummary = (series, counts = false) => {
  const conditionStatus = getUnique(series, "Condition Status");

  statusCount = {};
  conditionStatus.map((v, i) => {
    currStatus = series.filter((row) => row["Condition Status"] == v);
    statusCount[v] = currStatus.length;
  });

  document.getElementById("open_conditions_number").innerText =
    statusCount["In Progress"];
  document.getElementById("closed_conditions_number").innerText =
    statusCount["Closed"];

  if (counts) {
    document.getElementById("companies_number").innerText = counts.companies;
    document.getElementById("projects_number").innerText = counts.projects;
  }

  return statusCount; //TODO: this function doesnt need to return anything
};

const groupBy = (data, status, returnCounts = false) => {
  var companyCount = null;
  var projectCount = null;

  data = applyId(data, status);
  var companyResult = [];
  var projectResult = [];
  var themeResult = [];
  const companies = getUnique(data, "Company");
  companyCount = companies.length;

  companies.map((c) => {
    const company = data.filter((row) => row.Company == c);

    companyResult.push({
      name: c,
      y: company.length,
      drilldown: c,
    });
    const projects = getUnique(company, "Short Project Name");
    projectCount = projectCount + projects.length;
    const projectData = [];
    projects.map((p) => {
      const project = company.filter((row) => row["Short Project Name"] == p);

      projectData.push({
        name: p,
        y: project.length,
        drilldown: p,
      });

      const themes = getUnique(company, "Theme(s)");
      const themeData = [];
      themes.map((t, it) => {
        const theme = project.filter((row) => row["Theme(s)"] == t); //all rows should go through here. Use this for sumamry counts
        themeData.push({
          name: t,
          y: theme.length,
        });
      });

      themeResult.push({
        name: p,
        id: p,
        data: themeData,
      });
    });

    projectResult.push({
      name: c,
      id: c,
      data: projectData,
    });
  });

  companyResult = sortResults(companyResult, "Company");
  projectResult = sortResults(projectResult, "Project");
  themeResult = sortResults(themeResult, "Theme");

  var seriesData = [
    {
      name: "Conditions by Company",
      colorByPoint: false,
      data: companyResult,
    },
  ];

  //return [seriesData, projectResult.concat(themeResult), counts];

  if (returnCounts) {
    const counts = { companies: companyCount, projects: projectCount };
    return [seriesData, projectResult.concat(themeResult), counts];
  } else {
    return [seriesData, projectResult.concat(themeResult)];
  }
};



//One pass series generation
const createConditionSeries = (data, filters) => {
  data = applyId2(data);

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
    } else if (level == "Theme"){
      for (const [pName, pObj] of Object.entries(obj)) {
        var themeData = [];
        for (const [key, value] of Object.entries(pObj)) {
          themeData.push({ name: key, y: value}); //could add another drilldown layer here.
        }
        unorderedSeries.push({ name: pName, id: pName, data: themeData });
      }
    }
    return unorderedSeries;
  };

  for (const [key, value] of Object.entries(filters)) {
    if (value !== "All") {
      data = data.filter((row) => row[key] == value);
    }
  }

  var [companies, projects, themes] = [{}, {}, {}];
  data.map((row, rowNum) => {
    var companyName = row.Company
    if (companies.hasOwnProperty(companyName)) {
      companies[companyName]++;
    } else {
      companies[companyName] = 1;
    }

    var projName = row["Short Project Name"];
    if (projects.hasOwnProperty(companyName)) {
      if (projects[companyName].hasOwnProperty(projName)) {
        projects[companyName][projName]++;
      } else {
        projects[companyName][projName] = 1;
      }
    } else {
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

  companies = sortResults(objectToList(companies, "Company"), "Company");
  projects = sortResults(objectToList(projects, "Project"),"Project");
  themes = sortResults(objectToList(themes,"Theme"),"Theme")
  var seriesData = [
    {
      name: "Conditions by Company",
      colorByPoint: false,
      data: companies,
    },
  ];
  return [seriesData, projects.concat(themes)];
};


//multiple pass timing
var t0Multiple = performance.now();
var [seriesData, drilldownSeries] = groupBy(conditionsData, "All",false);
var t1Multiple = performance.now();
console.log(
  "Multiple Pass: " + (t1Multiple - t0Multiple) + " milliseconds."
);

//one pass timing
var t0Single = performance.now();
var [seriesData, drilldownSeries] = createConditionSeries(
  conditionsData,
  conditionsFilters
);
var t1Single = performance.now();
console.log(
  "Single Pass: " + (t1Single - t0Single) + " milliseconds."
);



const createGraph = (seriesData, drilldownSeries) => {
  return new Highcharts.chart("container", {
    chart: {
      height: 700,
      type: "bar",
      zoomType: "x", //allows the user to focus in on the x or y (x,y,xy)
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
          //console.log('drilldown',this.series[0].userOptions) //use this to calculate the summary measures that will populate the html
          //console.log(e)
        },
        drillup: function (e) {
          //console.log(e)
          //console.log(e.seriesOptions.data)
          //console.log('drillup',this.series[0])
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

//var stat = applySummary(conditionsData, counts);
var chart = createGraph(seriesData, drilldownSeries);

var select_status = document.getElementById("select_status");
select_status.addEventListener("change", (select_status) => {
  var status = select_status.target.value;
  var [seriesData, drilldownSeries, counts] = createSeries(
    conditionsData,
    status
  );
  var stat = applySummary(conditionsData, counts);
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
