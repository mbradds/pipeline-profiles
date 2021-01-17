import { cerPalette } from "../../modules/util";

export const incidentBar = (data, map) => {
  function seriesify(name, series, colors) {
    let seriesList = [];
    for (const [key, value] of Object.entries(series[name])) {
      seriesList.push({
        name: key,
        data: [{ name: name, y: value.count }],
        color: colors[name][key],
      });
    }
    return seriesList;
  }

  function createBar(div, name, series, colors) {
    return new Highcharts.chart(div, {
      chart: {
        type: "bar",
        //spacingRight: 0,
        //spacingLeft: 0,
        spacongTop: 0,
        spacingBottom: 0,
        animation: false,
      },
      colors: ["#CCCCCC", "#999999", "#666666", "#333333", "#000000"],
      title: {
        text: `${name}:`,
        padding: 0,
        margin: -15,
      },
      credits: {
        text: "",
      },
      xAxis: {
        visible: false,
        categories: true,
        gridLineWidth: 0,
      },
      yAxis: {
        maxPadding: 0,
        visible: true,
        plotLines: [
          {
            color: "white",
            value: 0,
            width: 1,
            zIndex: 5,
          },
        ],
        labels: {
          enabled: false,
        },
        gridLineWidth: 0,
        startOnTick: false,
        endOnTick: false,
        min: 0,
        title: {
          text: "",
        },
      },
      legend: {
        //enabled: true,
        padding: 0,
        margin: 0,
        y: -15,
        itemWidth: 180,
        // symbolWidth: 5,
        // symbolHeight: 5,
        // itemStyle: {
        //   fontSize: 1,
        // },
      },
      tooltip: {
        shared: false,
      },
      plotOptions: {
        bar: {
          maxPointWidth: 35,
        },
        series: {
          animation: false,
          stacking: "normal",
          grouping: false,
          shadow: false,
          borderWidth: 0,
          states: {
            inactive: {
              opacity: 1,
            },
          },
          events: {
            legendItemClick: function () {
              return false;
            },
          },
        },
      },
      series: seriesify(name, series, colors),
    });
  }

  function prepareData(data) {
    var [substance, status, province] = [{}, {}, {}];
    const addToSeries = (series, row, name) => {
      if (series.hasOwnProperty(row[name])) {
        series[row[name]].count += 1;
        series[row[name]].volume += row["Approximate Volume Released"];
      } else {
        series[row[name]] = {
          count: 1,
          volume: row["Approximate Volume Released"],
        };
      }
      return series;
    };

    data.map((row) => {
      substance = addToSeries(substance, row, "Substance");
      status = addToSeries(status, row, "Status");
      province = addToSeries(province, row, "Province");
    });

    return { Substance: substance, Status: status, Province: province };
  }

  function deactivateChart(chart, div) {
    let greyColors = ["#CCCCCC", "#999999", "#666666", "#333333", "#000000"];
    chart.series.map((s, i) => {
      chart.series[i].options.color = greyColors[i];
      chart.series[i].update(chart.series[i].options);
    });
    chart.update({
      plotOptions: {
        series: {
          states: {
            hover: {
              enabled: false,
            },
          },
        },
      },
      tooltip: {
        enabled: false,
      },
    });
    let activeDiv = document.getElementById(div);
    activeDiv.style.borderStyle = null;
    activeDiv.style.borderColor = null;
    activeDiv.style.borderRadius = null;
    return chart;
  }

  function activateChart(chart, colors, div) {
    chart.series.map((s, i) => {
      chart.series[i].options.color = colors[s.name];
      chart.series[i].update(chart.series[i].options);
    });
    chart.update({
      chart: {
        backgroundColor: "white",
      },
      plotOptions: {
        series: {
          states: {
            hover: {
              enabled: true,
            },
          },
        },
      },
      tooltip: {
        enabled: true,
      },
    });
    let activeDiv = document.getElementById(div);
    activeDiv.style.borderStyle = "solid";
    activeDiv.style.borderColor = cerPalette["Dim Grey"];
    activeDiv.style.borderRadius = "5px";
  }

  function barEvents(bar, allBars) {
    document.getElementById(bar.div).addEventListener("mouseover", mouseOver);
    document.getElementById(bar.div).addEventListener("mouseout", mouseOut);
    document.getElementById(bar.div).addEventListener("click", click);

    function mouseOver() {
      if (bar.status !== "activated") {
        bar.chart.update({
          chart: {
            backgroundColor: "#FCFFC5",
          },
        });
      }
    }

    function mouseOut() {
      bar.chart.update({
        chart: {
          backgroundColor: "white",
        },
      });
    }

    function click() {
      // deactivate current active bar
      allBars.deactivateBar(allBars.currentActive.name);
      allBars.currentActive.status = "deactivated";
      // activate the clicked bar
      bar.status = "activated";
      allBars.activateBar(bar.name);
    }
  }

  let series = prepareData(data);
  const bars = {
    Substance: {
      chart: createBar("substance-bar", "Substance", series, map.colors),
      status: "activated",
      div: "substance-bar",
      name: "Substance",
    },
    Status: {
      chart: createBar("status-bar", "Status", series, map.colors),
      status: "deactivated",
      div: "status-bar",
      name: "Status",
    },
    Province: {
      chart: createBar("province-bar", "Province", series, map.colors),
      status: "deactivated",
      div: "province-bar",
      name: "Province",
    },

    currentActive: undefined,

    set active(newActive) {
      this.currentActive = newActive;
    },

    deactivateBar: function (barName) {
      deactivateChart(this[barName].chart, this[barName].div);
    },
    activateBar: function (barName) {
      activateChart(
        this[barName].chart,
        map.colors[barName],
        this[barName].div
      );
      this.active = this[barName];
      map.fieldChange(barName);
    },
    divEvents: function () {
      barEvents(this.Substance, this);
      barEvents(this.Status, this);
      barEvents(this.Province, this);
    },
  };

  bars.deactivateBar("Status");
  bars.deactivateBar("Province");
  bars.activateBar("Substance");
  bars.divEvents();
};
