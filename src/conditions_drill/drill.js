import {
  getData,
  getToday,
  createConditionSeries,
  sortSeriesData,
  updateSelect,
  cerPalette,
} from "../modules/util.js";

const [today, day] = getToday();
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
          $("#select-company").prop("disabled", "disabled");
          $("#select-company").selectpicker("refresh");
          var chart = this;
          currentLevel.level++;
          if (!e.seriesOptions) {
            var chart = this;
            if (currentLevel.level == 1) {
              var series = levels.projects[e.point.name];
              var inv = true;
              currentPoint.company = e.point.name;
            } else if (currentLevel.level == 2) {
              var inv = true;
              var series = levels.themes[e.point.name];
              currentPoint.project = e.point.name;
            } else if (currentLevel.level == 3) {
              var inv = false;
              var series =
                levels.id[currentPoint.project + " - " + e.point.name];
              currentPoint.id = e.point.name;
              chart.update(
                {
                  chart: { zoomType: "y" },
                  yAxis: [
                    {
                      id: "id_yCategory",
                      categories: series.categories,
                      title: {
                        text: "Instrument Number - Condition Number",
                      },
                    },
                  ],
                },
                true
              );
            }
            series.data = sortSeriesData(series.data);
            setTimeout(function () {
              chart.addSeriesAsDrilldown(e.point, series);
              chart.update({
                chart: {
                  inverted: inv,
                },
              });
            }, 0);
          }
        },
        drillup: function (e) {
          currentLevel.level--;
          if (currentLevel.level == 0) {
            $("#select-company").prop("disabled", false);
            $("#select-company").selectpicker("refresh");
            this.series[1].setData(sortSeriesData(levels.series[0].data));
            this.series[0].setData(sortSeriesData(levels.series[0].data));
          } else if (currentLevel.level == 1) {
            this.series[1].setData(
              sortSeriesData(levels.projects[currentPoint.company].data)
            );
            this.series[0].setData(
              sortSeriesData(levels.projects[currentPoint.company].data)
            );
          } else if (currentLevel.level == 2) {
            setConditionText(null);
            chart.yAxis[0].setExtremes()
            chart.yAxis[1].setExtremes()
            chart.update(
              {
                chart: {
                  inverted: true,
                  zoomType: "x",
                },
                yAxis: [
                  {
                    id: "id_yCategory",
                    title: {
                      text: "",
                    },
                  },
                ],
              },
              true
            );
            this.series[1].setData(
              sortSeriesData(levels.themes[currentPoint.project].data)
            );
            this.series[0].setData(
              sortSeriesData(levels.themes[currentPoint.project].data)
            );
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
        currentDateIndicator: {
          width: 4,
          color: cerPalette["Cool Grey"],
          label: {
            format: "%Y-%m" +' (current year-month)',
            align:"left",
            rotation:90,
            verticalAlign:"middle"
          },
          zIndex:5
        },
        tickInterval:30 * 24 * 3600 * 1000,
        //max: today.getTime() + 75 * day,
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
        title: {
          text: "",
        },
        labels: {
          formatter: function () {
            return this.value;
          },
          events: {
            click: function () {
              var clickedId = this.value;
              var currentSeries = this.axis.series[0].data;
              currentSeries.map((row) => {
                if (
                  row.name == clickedId &&
                  row.hasOwnProperty("onClickText")
                ) {
                  setConditionText(row["onClickText"]);
                }
              });
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

//set up initial chart,data structures, and selects
const levels = {};
var [seriesData, projects, themes, id] = createConditionSeries(
  conditionsData,
  conditionsFilters
);
levels.series = seriesData;
levels.projects = projects;
levels.themes = themes;
levels.id = id;
var chart = createGraph();
updateSelect(levels.series[0].data, "#select-company");

const updateLevels = (chart, levels) => {
  if (currentLevel.level == 0) {
    chart.update({
      series: levels.series,
    });
  } else if (currentLevel.level == 1) {
    chart.series[0].setData(
      sortSeriesData(levels.projects[currentPoint.company].data)
    );
  } else if (currentLevel.level == 2) {
    chart.series[0].setData(
      sortSeriesData(levels.themes[currentPoint.project].data)
    );
  } else if (currentLevel.level == 3) {
    chart.series[0].setData(
      levels.id[currentPoint.project + " - " + currentPoint.id].data
    );
  }
};

//select condition status
var select_status = document.getElementById("select-status");
select_status.addEventListener("change", (select_status) => {
  conditionsFilters["Condition Status"] = select_status.target.value;
  conditionsFiltersDrill["Condition Status"] = select_status.target.value;
  [seriesData, projects, themes, id] = createConditionSeries(
    conditionsData,
    conditionsFilters
  );
  levels.series = seriesData;
  levels.projects = projects;
  levels.themes = themes;
  levels.id = id;
  updateSelect(levels.series[0].data, "#select-company");
  updateLevels(chart, levels);
});

//select company
var select_company = document.getElementById("select-company");
select_company.addEventListener("change", (select_company) => {
  conditionsFilters["Company"] = select_company.target.value;
  conditionsFiltersDrill["Company"] = select_company.target.value;
  [seriesData, projects, themes, id] = createConditionSeries(
    conditionsData,
    conditionsFilters
  );
  levels.series = seriesData;
  levels.projects = projects;
  levels.themes = themes;
  levels.id = id;
  updateLevels(chart, levels);
});
