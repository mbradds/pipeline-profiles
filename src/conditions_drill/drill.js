import {
  getData,
  sortResults,
  createConditionSeries,
  createLastSeries,
  companyDrop,
} from "../modules/util.js";

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

const createLastChart = (series, categories) => {
  return new Highcharts.chart("container-last", {
    chart: {
      type: "xrange",
      zoomType: "y",
      animation: true,
    },
    title: {
      text: "",
    },

    xAxis: {
      type: "datetime",
    },

    plotOptions: {
      series: {
        grouping: false,
      },
    },

    yAxis: {
      title: {
        text: "",
      },
      categories: categories,
      reversed: true,
      labels: {
        events: {
          click: function () {
            setConditionText(this.axis.series[0].data[this.pos]["onClickText"]);
          },
        },
      },
    },
    series: series,
  });
};

var level = 1;
const createGraph = (seriesData, drilldownSeries) => {
  return new Highcharts.chart("container-chart", {
    chart: {
      inverted: true,
      type: "column",
      zoomType: "x",
      animation: true,
      events: {
        drilldown: function (e) {
          $("#select-company").prop("disabled", "disabled");
          $("#select-company").selectpicker("refresh");
          if (level < 4) {
            level++;
            //updateFiltersOnDrill(level, e.seriesOptions.name);
          }
          if (level == 4) {
            var chart = this;
            setTimeout(function () {
              chart.update({
                chart: { inverted: false },
                yAxis: {
                  type: "category",
                  labels: {
                    formatter: function(){
                      return this.axis.series[0].data[this.value].name
                    },
                    events: {
                      click: function () {
                        setConditionText(this.axis.series[0].data[this.pos]["onClickText"]);
                      },
                    },
                  },
                },
                // xAxis: {
                //   type: "datetime",
                // },
              });
            }, 0);
          }
        },
        drillup: function (e) {
          var chart = this;
          if (level == 4) {
            console.log('drilling up')
            setTimeout(function () {
              chart.update({
                yAxis: {
                  type: "linear",
                  labels: {
                    formatter: function(){
                      return this.value
                    }
                  }
                },
                xAxis: {
                  type: "category",
                  labels: {
                    formatter: function(){
                      return this.value
                    }
                  }
                },
                chart: { inverted: true },
              });
            }, 0);
          }
          level--;
          if (level == 1) {
            $("#select-company").prop("disabled", false);
            $("#select-company").selectpicker("refresh");
          }
          updateFiltersOnDrill(level, e.seriesOptions.name);
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
      //type: "category",
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

const updateChartAfterDrill = (chart, seriesData) => {
  // how to update data after drilldown:
  // https://www.highcharts.com/forum/viewtopic.php?t=40389
  // http://jsfiddle.net/06oesrs1/
  var ddCurrent = chart.series[0].userOptions.id; //gets the current level of the drilldown
  var ddSeries = chart.options.drilldown.series;
  if (ddCurrent == undefined) {
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
};

var [seriesData, drilldownSeries, companies] = createConditionSeries(
  conditionsData,
  conditionsFilters
);
companyDrop(companies);
var chart = createGraph(seriesData, drilldownSeries);

//select status
var select_status = document.getElementById("select_status");
select_status.addEventListener("change", (select_status) => {
  conditionsFilters["Condition Status"] = select_status.target.value;
  conditionsFiltersDrill["Condition Status"] = select_status.target.value;
  var [seriesData, drilldownSeries, companies] = createConditionSeries(
    conditionsData,
    conditionsFilters
  );
  companyDrop(companies);
  chart.update({
    drilldown: {
      series: drilldownSeries,
    },
  });
  updateChartAfterDrill(chart, seriesData);
});

//select company
var select_company = document.getElementById("select-company");
select_company.addEventListener("change", (select_company) => {
  conditionsFilters["Company"] = select_company.target.value;
  conditionsFiltersDrill["Company"] = select_company.target.value;
  var [seriesData, drilldownSeries] = createConditionSeries(
    conditionsData,
    conditionsFilters
  );
  chart.update({
    drilldown: {
      series: drilldownSeries,
    },
  });
  updateChartAfterDrill(chart, seriesData);
});
