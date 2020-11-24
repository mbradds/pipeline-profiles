import {
  getData,
  getToday,
  createConditionSeries,
  totalsFromSeriesGeneration,
  totalsFromCounts,
  sortSeriesData,
  updateSelect,
  updateAllSelects,
  cerPalette,
  applyId,
  relevantValues,
  dynamicTitle,
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
var conditionTextContainer = document.getElementById("container_text");

const setConditionText = (onClickText) => {
  conditionTextContainer.innerText = onClickText;
};
var relevant = relevantValues(conditionsData, conditionsFilters);
var currentPoint = { project: null, id: null };
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
          totalsFromSeriesGeneration(1);
          $("#select-project").prop("disabled", "disabled");
          $("#select-project").trigger("chosen:updated");
          $("#select-status-project").prop("disabled", "disabled");
          $("#select-staus-project").trigger("chosen:updated");
          var chart = this;
          currentLevel.level++;
          if (!e.seriesOptions) {
            var chart = this;
            if (currentLevel.level == 1) {
              var inv = true;
              var series = levels.themes[e.point.name];
              currentPoint.project = e.point.name;
              updateSelect(
                Array.from(
                  relevant.project[currentPoint.project].conditionStatus
                ),
                "#select-status",
                "array"
              );
            } else if (currentLevel.level == 2) {
              $("#select-phase").prop("disabled", false);
              $("#select-phase").trigger("chosen:updated");
              var inv = false;
              var series =
                levels.id[currentPoint.project + " - " + e.point.name];
              currentPoint.id = e.point.name;
              updateSelect(
                Array.from(
                  relevant.theme[currentPoint.project + " - " + e.point.name]
                    .conditionStatus
                ),
                "#select-status",
                "array"
              );
              updateSelect(
                Array.from(
                  relevant.theme[currentPoint.project + " - " + e.point.name]
                    .conditionPhase
                ),
                "#select-phase",
                "array"
              );
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
            totalsFromCounts(series.counts);
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
          dynamicTitle(conditionsFilters,currentPoint)
          console.log(currentPoint);
        },
        drillup: function (e) {
          var chart = this;
          chart.series[1].options.color = levels.color;
          chart.series[1].update(chart.series[1].options);
          chart.series[0].options.color = levels.color;
          chart.series[0].update(chart.series[0].options);
          currentLevel.level--;
          if (currentLevel.level == 0) {
            currentPoint.project = null;
            totalsFromSeriesGeneration(levels.projectCount);
            totalsFromCounts(levels.series[0].counts);
            $("#select-project").prop("disabled", false);
            $("#select-project").trigger("chosen:updated");
            $("#select-status-project").prop("disabled", false);
            $("#select-status-project").trigger("chosen:updated");
            this.series[1].setData(sortSeriesData(levels.series[0].data));
            this.series[0].setData(sortSeriesData(levels.series[0].data));
            updateSelect(
              Array.from(
                relevant.company[conditionsFilters.Company].conditionStatus
              ),
              "#select-status",
              "array"
            );
            updateSelect(
              Array.from(
                relevant.company[conditionsFilters.Company].projectStatus
              ),
              "#select-status-project",
              "array"
            );
            updateSelect(levels.series[0].data, "#select-project");
          } else if (currentLevel.level == 1) {
            currentPoint.id = null;
            updateSelect(
              Array.from(
                relevant.project[currentPoint.project].conditionStatus
              ),
              "#select-status",
              "array"
            );
            conditionsFilters["Condition Phase"] = "All";
            generateNewSeries(conditionsData, conditionsFilters);
            totalsFromCounts(levels.themes[currentPoint.project].counts);
            $("#select-phase").val("All").change();
            $("#select-phase").prop("disabled", "disabled");
            $("#select-phase").trigger("chosen:updated");
            setConditionText(null);
            chart.yAxis[0].setExtremes();
            chart.yAxis[1].setExtremes();
            this.series[1].setData(
              sortSeriesData(levels.themes[currentPoint.project].data)
            );
            this.series[0].setData(
              sortSeriesData(levels.themes[currentPoint.project].data)
            );
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
          }
          dynamicTitle(conditionsFilters,currentPoint)
          console.log(currentPoint);
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
          },
          createConditionSeries,
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
          style: {
            cursor: "pointer",
            color: "#003399",
            fontWeight: "bold",
            textDecoration: "underline",
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
const levels = {};
const generateNewSeries = (data, filters) => {
  var [
    seriesData,
    themes,
    id,
    currentColor,
    projectCount,
  ] = createConditionSeries(data, filters);
  levels.series = seriesData;
  levels.series[0].data = sortSeriesData(levels.series[0].data);
  levels.themes = themes;
  levels.id = id;
  levels.color = currentColor;
  levels.projectCount = projectCount;
};

generateNewSeries(conditionsData, conditionsFilters);
var chart = createGraph();
totalsFromSeriesGeneration(levels.projectCount);
totalsFromCounts(levels.series[0].counts);
updateAllSelects(levels.series[0].filters);
updateSelect(levels.series[0].data, "#select-project");
$("#select-phase").prop("disabled", "disabled");
dynamicTitle(conditionsFilters,currentPoint)

const updateLevels = (chart, levels, currentSelect) => {
  const updateLevel = (chart, newSeries, color) => {
    try {
      chart.series[0].setData(sortSeriesData(newSeries.data));
      chart.series[0].options.color = color;
      chart.series[0].update(chart.series[0].options);
      updateAllSelects(newSeries.filters, currentSelect);
      totalsFromCounts(newSeries.counts);
    } catch (err) {
      chart.series[0].setData([]);
    }
  };
  if (currentLevel.level == 0) {
    totalsFromSeriesGeneration(levels.projectCount);
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
      totalsFromCounts(lastLevelData.counts);
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
  generateNewSeries(conditionsData, conditionsFilters);
  updateLevels(chart, levels, "#select-status");
});

//select project status
var select_status_project = document.getElementById("select-status-project");
select_status_project.addEventListener("change", (select_status_project) => {
  conditionsFilters["Project Status"] = select_status_project.target.value;
  generateNewSeries(conditionsData, conditionsFilters);
  updateLevels(chart, levels, "#select-status-project");
});

//select condition phase
var select_phase = document.getElementById("select-phase");
select_phase.addEventListener("change", (select_phase) => {
  conditionsFilters["Condition Phase"] = select_phase.target.value;
  generateNewSeries(conditionsData, conditionsFilters);
  updateLevels(chart, levels, "#select-phase");
});

//select project
var select_project = document.getElementById("select-project");
select_project.addEventListener("change", (select_project) => {
  conditionsFilters["Short Project Name"] = select_project.target.value;
  generateNewSeries(conditionsData, conditionsFilters);
  updateLevels(chart, levels, "#select-project");
});
