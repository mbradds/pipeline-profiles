import {
  getData,
  getToday,
  createConditionSeries,
  sortSeriesData,
  updateSelect,
  updateAllSelects,
  cerPalette,
  applyId,
} from "../modules/util.js";

const [today, day] = getToday();
const conditionsData = applyId(
  JSON.parse(getData("/src/conditions_drill/conditions.json"))
);

const conditionsFilters = {
  "Project Status": "All",
  "Condition Status": "All",
  Company: "NOVA Gas Transmission Ltd.",
  "Short Project Name": "All",
  "Condition Phase": "All",
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
          $("#select-project").prop("disabled", "disabled");
          $("#select-project").selectpicker("refresh");
          $("#select-status-project").prop("disabled", "disabled");
          $("#select-status-project").selectpicker("refresh");
          var chart = this;
          currentLevel.level++;
          if (!e.seriesOptions) {
            var chart = this;
            if (currentLevel.level == 1) {
              var inv = true;
              var series = levels.themes[e.point.name];
              currentPoint.project = e.point.name;
            } else if (currentLevel.level == 2) {
              $("#select-phase").prop("disabled", false);
              $("#select-phase").selectpicker("refresh");
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
            updateAllSelects(series.filters, null);
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
          var chart = this;
          chart.series[1].options.color = levels.color;
          chart.series[1].update(chart.series[1].options);
          chart.series[0].options.color = levels.color;
          chart.series[0].update(chart.series[0].options);
          currentLevel.level--;
          if (currentLevel.level == 0) {
            $("#select-project").prop("disabled", false);
            $("#select-project").selectpicker("refresh");
            $("#select-status-project").prop("disabled", false);
            $("#select-status-project").selectpicker("refresh");
            this.series[1].setData(sortSeriesData(levels.series[0].data));
            this.series[0].setData(sortSeriesData(levels.series[0].data));
          } else if (currentLevel.level == 1) {
            conditionsFilters["Condition Phase"] = "All"
            generateNewSeries(conditionsData,conditionsFilters)
            $("#select-phase").val("All").change()
            $("#select-phase").prop("disabled", "disabled");
            $("#select-phase").selectpicker("refresh");
            setConditionText(null);
            chart.yAxis[0].setExtremes();
            chart.yAxis[1].setExtremes();
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
        color: cerPalette["Ocean"],
        cropThreshold: 1000, //solution to axis getting messed up on drillup: https://www.highcharts.com/forum/viewtopic.php?t=40702
        pointWidth: 20,
        events: {
          legendItemClick: function () {
            return false;
          },createConditionSeries
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
            format: "%Y-%m" + " (current year-month)",
            align: "left",
            rotation: 90,
            verticalAlign: "middle",
          },
          zIndex: 5,
        },
        tickInterval: 30 * 24 * 3600 * 1000,
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
    lang: {
      noData: "No conditions to display for chosen filters",
    },
    noData: {
      style: {
        fontWeight: "bold",
        fontSize: "15px",
        color: "#303030",
      },
    },
  });
};

//set up initial chart,data structures, and selects
const levels = {}
const generateNewSeries = (data,filters) => {
  var [seriesData, themes, id, currentColor] = createConditionSeries(
    data,
    filters
  );
  levels.series = seriesData;
  levels.series[0].data = sortSeriesData(levels.series[0].data);
  levels.themes = themes;
  levels.id = id;
  levels.color = currentColor;
}

generateNewSeries(conditionsData,conditionsFilters)
var chart = createGraph();
updateAllSelects(levels.series[0].filters);
updateSelect(levels.series[0].data, "#select-project");
$("#select-phase").prop("disabled", "disabled");
$("#select-phase").selectpicker("refresh");

const updateLevels = (chart, levels, currentSelect) => {
  const updateLevel = (chart, newSeries, color) => {
    try {
      chart.series[0].setData(sortSeriesData(newSeries.data));
      chart.series[0].options.color = color;
      chart.series[0].update(chart.series[0].options);
      updateAllSelects(newSeries.filters, currentSelect);
    } catch (err) {
      chart.series[0].setData([]);
    }
  };
  if (currentLevel.level == 0) {
    updateLevel(chart, levels.series[0], levels.color);
    if (currentSelect !== "#select-project") {
      updateSelect(levels.series[0].data, "#select-project", "object");
    }
  } else if (currentLevel.level == 1) {
    updateLevel(chart, levels.themes[currentPoint.project], levels.color);
  } else if (currentLevel.level == 2) {
    var lastLevelData =
      levels.id[currentPoint.project + " - " + currentPoint.id];
    try {
      chart.series[0].setData(lastLevelData.data);
      chart.update(
        {
          chart: { zoomType: "y" },
          yAxis: [
            {
              id: "id_yCategory",
              categories: lastLevelData.categories,
              title: {
                text: "Instrument Number - Condition Number",
              },
            },
          ],
        },
        true
      );
    } catch (err) {
      chart.series[0].setData([]);
    }
  }
};

//select condition status
var select_status = document.getElementById("select-status");
select_status.addEventListener("change", (select_status) => {
  conditionsFilters["Condition Status"] = select_status.target.value;
  generateNewSeries(conditionsData,conditionsFilters)
  updateLevels(chart, levels, "#select-status");
});

//select project status
var select_status_project = document.getElementById("select-status-project");
select_status_project.addEventListener("change", (select_status_project) => {
  conditionsFilters["Project Status"] = select_status_project.target.value;
  generateNewSeries(conditionsData,conditionsFilters)
  updateLevels(chart, levels, "#select-status-project");
});

//select condition phase
var select_phase = document.getElementById("select-phase");
select_phase.addEventListener("change", (select_phase) => {
  conditionsFilters["Condition Phase"] = select_phase.target.value;
  generateNewSeries(conditionsData,conditionsFilters)
  updateLevels(chart, levels, "#select-phase");
});

//select project
var select_project = document.getElementById("select-project");
select_project.addEventListener("change", (select_project) => {
  conditionsFilters["Short Project Name"] = select_project.target.value;
  generateNewSeries(conditionsData,conditionsFilters)
  updateLevels(chart, levels, "#select-project");
});
