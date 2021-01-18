import { cerPalette } from "../../modules/util";

export const incidentBar = (data, map) => {
  function seriesify(name, series, colors, yVal) {
    const seriesProps = (colors) => {
      if (colors) {
        return function (key, value, name, yVal, colors) {
          return {
            name: key,
            data: [{ name: name, y: value[yVal] }],
            color: colors[name][key],
          };
        };
      } else {
        return function (key, value, name, yVal, colors) {
          return { name: key, data: [{ name: name, y: value[yVal] }] };
        };
      }
    };

    var seriesParams = seriesProps(colors);
    let seriesList = [];
    for (const [key, value] of Object.entries(series[name])) {
      seriesList.push(seriesParams(key, value, name, yVal, colors));
    }

    return seriesList;
  }

  function createBar(div, name, series, colors) {
    function barTitle(name) {
      if (name == "Status") {
        return `CER ${name}`;
      } else {
        return `${name}`;
      }
    }
    return new Highcharts.chart(div, {
      chart: {
        type: "bar",
        //spacingRight: 0,
        //spacingLeft: 0,
        spacongTop: 0,
        spacingBottom: 0,
        animation: false,
      },

      title: {
        text: barTitle(name),
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
        padding: 0,
        margin: 0,
        y: -20,
      },

      tooltip: {
        headerFormat: "",
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
            hover: {
              enabled: false,
            },
          },
          events: {
            legendItemClick: function () {
              return false;
            },
          },
        },
      },

      series: seriesify(name, series, colors, "frequency"),
    });
  }

  function prepareData(data) {
    var [substance, status, province] = [{}, {}, {}];
    const addToSeries = (series, row, name) => {
      if (series.hasOwnProperty(row[name])) {
        series[row[name]].frequency += 1;
        series[row[name]].volume += row["Approximate Volume Released"];
      } else {
        series[row[name]] = {
          frequency: 1,
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
    activeDiv.style.borderStyle = "solid";
    activeDiv.style.borderColor = cerPalette["Dim Grey"];
    activeDiv.style.borderRadius = "5px";
    activeDiv.style.opacity = 0.6;
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
    activeDiv.style.borderColor = cerPalette["Cool Grey"];
    activeDiv.style.borderRadius = "5px";
    activeDiv.style.opacity = 1;
  }

  function barEvents(bar, allBars) {
    var barDiv = document.getElementById(bar.div);
    barDiv.addEventListener("mouseover", mouseOver);
    barDiv.addEventListener("mouseout", mouseOut);
    barDiv.addEventListener("click", click);

    function mouseOver() {
      if (bar.status !== "activated") {
        barDiv.style.opacity = 1;
        bar.chart.update({
          chart: {
            //backgroundColor: "#FCFFC5",
            backgroundColor: "#F0F8FF",
          },
        });
      }
    }

    function mouseOut() {
      if (bar.status !== "activated") {
        barDiv.style.opacity = 0.6;
        bar.chart.update({
          chart: {
            backgroundColor: "white",
          },
        });
      }
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

  // function styleNearMe() {
  //   let activeDiv = document.getElementById("incidents-near-me");
  //   activeDiv.style.borderStyle = "solid";
  //   activeDiv.style.borderColor = cerPalette["Dim Grey"];
  //   activeDiv.style.borderRadius = "5px";
  // }
  // styleNearMe();

  const bars = {
    barColors: undefined,
    currentActive: undefined,
    barList: [],
    set active(newActive) {
      this.currentActive = newActive;
    },

    makeBar: function (barName, div, status) {
      this[barName] = {
        chart: createBar(div, barName, this.barSeries, this.barColors),
        status: status,
        div: div,
        name: barName,
      };
      this.barList.push(this[barName]);
    },

    switchY: function (newY) {
      this.barList.map((bar) => {
        let newSeries = seriesify(
          bar.name,
          this.barSeries,
          undefined,
          //this.barColors,
          newY
        );

        bar.chart.update({
          series: newSeries,
        });
      });
    },

    deactivateBar: function (barName) {
      deactivateChart(this[barName].chart, this[barName].div);
    },
    activateBar: function (barName) {
      activateChart(
        this[barName].chart,
        this.barColors[barName],
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
  bars.barSeries = prepareData(data);
  bars.barColors = map.colors;
  bars.makeBar("Substance", "substance-bar", "activated");
  bars.makeBar("Status", "status-bar", "deactivated");
  bars.makeBar("Province", "province-bar", "deactivated");
  bars.activateBar("Substance");
  bars.deactivateBar("Status");
  bars.deactivateBar("Province");
  bars.divEvents();
  return bars;
};
