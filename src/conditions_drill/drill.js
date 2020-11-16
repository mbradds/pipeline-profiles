import { getData, createConditionSeries,sortSeriesData } from "../modules/util.js";

const conditionsData = JSON.parse(
  getData("/src/conditions_drill/conditions.json")
);

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

const updateFiltersOnDrill = (level, name) => {
  if (level == 1) {
    conditionsFiltersDrill["Short Project Name"] = "All";
  } else if (level == 2) {
    conditionsFiltersDrill.Company = name;
  } else if (level == 3) {
    conditionsFiltersDrill["Short Project Name"] = name;
  } else if (level == 4) {
    conditionsFiltersDrill["Theme(s)"] = name;
  }
};

//contain DOM objects
var lastLevelContainer = document.getElementById("container-last");
var drillContainer = document.getElementById("container-chart");
var conditionTextContainer = document.getElementById("container_text");

const setConditionText = (onClickText) => {
  conditionTextContainer.innerText = onClickText;
};

var currentPoint = { company: null, project: null };
var currentLevel = { level: 0 };
const createGraph = () => {
  return new Highcharts.chart("container-chart", {
    chart: {
      inverted: true,
      type: "column",
      zoomType: "x",
      animation: false,
      events: {
        drilldown: function (e) {
          currentLevel.level++;
          if (!e.seriesOptions) {
            var chart = this;
            if (currentLevel.level == 1) {
              var series = levels.projects[e.point.name];
              currentPoint.company = e.point.name;
            } else if (currentLevel.level == 2) {
              var series = levels.themes[e.point.name];
              currentPoint.project = e.point.name
            }

            series.data = sortSeriesData(series.data)
            setTimeout(function () {
              chart.addSeriesAsDrilldown(e.point, series);
            }, 0);
          }
        },
        drillup: function (e) {
          currentLevel.level--;
          if (currentLevel.level == 0) {
            this.series[1].setData(sortSeriesData(levels.series[0].data));
            this.series[0].setData(sortSeriesData(levels.series[0].data));
          } else if (currentLevel.level == 1) {
            this.series[1].setData(sortSeriesData(levels.projects[currentPoint.company].data));
            this.series[0].setData(sortSeriesData(levels.projects[currentPoint.company].data));
          }
        },
      },
    },

    title: {
      text: null,
    },

    plotOptions: {
      series: {
        grouping: false,
        cropThreshold: 1000, //solution to axis getting messed up on drillup: https://www.highcharts.com/forum/viewtopic.php?t=40702
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

    xAxis: [
      {
        id: "id_datetime",
        type: "datetime",
        title: {
          text: null,
        },
      },
      {
        id: "id_category",
        type: "category",
        title: {
          text: null,
        },
      },
    ],

    yAxis: [
      {
        id: "id_yLinear",
        type: "linear",
        showEmpty: false,
        title: {
          text: "Number of Conditions",
        },
      },
      {
        id: "id_yCategory",
        type: "category",
        title: {
          text: "",
        },
        labels: {
          events: {
            click: function () {
              setConditionText(
                this.axis.series[0].data[this.pos]["onClickText"]
              );
            },
          },
        },
      },
    ],

    series: levels.series,

    drilldown: {
      series: [],
    },
  });
};

const levels = {};
var [seriesData, projects, themes] = createConditionSeries(
  conditionsData,
  conditionsFilters
);
levels.series = seriesData;
levels.projects = projects;
levels.themes = themes;
var chart = createGraph();

var select_status = document.getElementById("select_status");
select_status.addEventListener("change", (select_status) => {
  conditionsFilters["Condition Status"] = select_status.target.value;
  conditionsFiltersDrill["Condition Status"] = select_status.target.value;
  [seriesData, projects, themes] = createConditionSeries(
    conditionsData,
    conditionsFilters
  );
  levels.series = seriesData;
  levels.projects = projects;
  levels.themes = themes;
  if (currentLevel.level == 0) {
    chart.update({
      series: levels.series,
    });
  } else if (currentLevel.level == 1) {
    console.log(levels.projects)
    chart.series[0].setData(sortSeriesData(levels.projects[currentPoint.company].data));
  } else if (currentLevel.level == 2) {
    chart.series[0].setData(sortSeriesData(levels.themes[currentPoint.project].data));
  }

});
