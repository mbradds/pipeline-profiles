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
  Company: "NOVA Gas Transmission Ltd.",
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
              var inv = true;
              var series = levels.themes[e.point.name];
              currentPoint.project = e.point.name;
            } else if (currentLevel.level == 2) {
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
          var chart = this    
          chart.series[1].options.color=levels.color
          chart.series[1].update(chart.series[1].options);
          chart.series[0].options.color=levels.color
          chart.series[0].update(chart.series[0].options);
          currentLevel.level--;
          if (currentLevel.level == 0) {
            $("#select-company").prop("disabled", false);
            $("#select-company").selectpicker("refresh");
            this.series[1].setData(levels.series[0].data);
            this.series[0].setData(levels.series[0].data);
          } else if (currentLevel.level == 1) {
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
        color:cerPalette['Ocean'],
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
  });
};

//set up initial chart,data structures, and selects
const levels = {};
var [seriesData, themes, id, currentColor] = createConditionSeries(
  conditionsData,
  conditionsFilters
);
levels.series = seriesData;
levels.themes = themes;
levels.id = id;
levels.color = currentColor;
var chart = createGraph();
var initialStatus = ['In Progress','Closed']
updateSelect(initialStatus,"#select-status",'array')
updateSelect(levels.series[0].data, "#select-company");

const updateLevels = (chart, levels) => {

  const updateLevel = (chart,seriesData,color) => {
    chart.series[0].setData(seriesData);
    chart.series[0].options.color=color
    chart.series[0].update(chart.series[0].options);
  }
  if (currentLevel.level == 0) {
    updateLevel(chart,levels.series[0].data,levels.color)
  } else if (currentLevel.level == 1) {
    updateLevel(chart,sortSeriesData(levels.themes[currentPoint.project].data),levels.color)
  } else if (currentLevel.level == 2) {
    var lastLevelData =
      levels.id[currentPoint.project + " - " + currentPoint.id];
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
  }
};

//select condition status
var select_status = document.getElementById("select-status");
select_status.addEventListener("change", (select_status) => {
  conditionsFilters["Condition Status"] = select_status.target.value;
  conditionsFiltersDrill["Condition Status"] = select_status.target.value;
  [seriesData, themes, id, currentColor] = createConditionSeries(
    conditionsData,
    conditionsFilters
  );
  levels.series = seriesData;
  levels.themes = themes;
  levels.id = id;
  levels.color = currentColor;
  updateSelect(levels.series[0].data, "#select-company");
  updateLevels(chart, levels);
});
