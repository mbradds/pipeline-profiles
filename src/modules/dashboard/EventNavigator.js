/**
 * @file Class definition for a "sidebar" navigation button group placed next to an EventMap or EventTrend instance.
 * This class uses a polymorphism pattern to update an EventMap (leaflet) or EventTrend (highcharts) instance.
 *
 * When paired with an optional "data" parameter, the navigator can load a single highcharts horizontal bar to
 * serve as a legend/total indicator.
 */

import Highcharts from "highcharts";
import { cerPalette } from "../util.js";

/**
 * Class responsible for creating a navigation sidebar next to either a leaflet map, or highcharts bar chart.
 * The navigator has "pills" that can be clicked to control the chart or map, and can be filled with a horizontal
 * bar to act as a map legend/total visualization.
 */
export class EventNavigator {
  /**
   * Used alongside an EventMap or EventTrend instance to control which data columns the user can filter through.
   * @param {Object} constr - EventNavigator constructor
   * @param {Object} constr.plot - EventMap(leaflet) or EventTrend(highcharts) instance.
   * @param {Object} constr.numberOfPills - The total number of navigation pills. Used to calculate pill height dynamically.
   * @param {Object} constr.langPillTitles - {titles: {id: "pill name"}, click: ""} pairs for handling custom pill titles & language switching. When click paramter is defined and not "", then this text will append to the pill name.
   * @param {number} [constr.fixedPillHeight=undefined] - Height in px of each pill navigation button. Overrides calculated height.
   * @param {(undefined | Object[])} [constr.data=undefined] - The same dataset used in the EventMap. When true, this will add a horizontal bar chart inside pills.
   */
  constructor({
    plot,
    numberOfPills,
    langPillTitles,
    fixedPillHeight = undefined,
    data = undefined,
  }) {
    this.plot = plot;
    this.numberOfPills = numberOfPills;
    this.langPillTitles = langPillTitles;
    this.currentActive = undefined;
    this.barList = [];
    this.bars = {};
    this.barSeries = {};
    this.barColors = plot.colors;
    this.allDivs = [];
    this.fixedPillHeight = fixedPillHeight;
    this.data = data;
    this.pillHeight = this.calculatePillHeight();
  }

  calculatePillHeight() {
    return Math.floor(
      (this.plot.plotHeight - (this.numberOfPills - 1) * 5) / this.numberOfPills
    );
  }

  static get greyTheme() {
    return [
      "#101010",
      "#181818",
      "#202020",
      "#282828",
      "#303030",
      "#383838",
      "#404040",
      "#484848",
      "#505050",
      "#585858",
      "#606060",
      "#686868",
      "#696969",
      "#707070",
      "#787878",
      "#808080",
      "#888888",
      "#909090",
      "#989898",
      "#A0A0A0",
      "#A8A8A8",
      "#A9A9A9",
      "#B0B0B0",
      "#B8B8B8",
      "#BEBEBE",
      "#C0C0C0",
      "#C8C8C8",
      "#D0D0D0",
      "#D3D3D3",
      "#D8D8D8",
      "#DCDCDC",
      "#E0E0E0",
      "#E8E8E8",
      "#F0F0F0",
      "#F5F5F5",
      "#F8F8F8",
    ];
  }

  seriesify(name, series, yVal) {
    const seriesProps = (colors) => {
      if (colors) {
        return function hasColors(key, value) {
          let colorName = key;
          if (colors[key]) {
            colorName = Object.prototype.hasOwnProperty.call(colors[key], "n")
              ? colors[key].n
              : key;
          }
          return {
            name: colorName,
            id: key,
            data: [{ name, y: value[yVal] }],
            filter: yVal,
          };
        };
      }
      return function noColors(key, value) {
        return {
          name: key,
          id: key,
          data: [{ name, y: value[yVal] }],
          filter: yVal,
        };
      };
    };

    return Object.keys(series[name]).map((key) => {
      const seriesParams = seriesProps(this.barColors[name]);
      return seriesParams(key, series[name][key], name, this.barColors[name]);
    });
  }

  /**
   * usefull for names like "Status" that could use additional description
   * @param {string} name
   * @param {undefined | string} clickText
   * @returns {string}
   */
  pillName(name, clickText = undefined) {
    if (
      this.langPillTitles &&
      Object.prototype.hasOwnProperty.call(this.langPillTitles.titles, name)
    ) {
      return `<span class="h4 mrgn-tp-0 event-title-nav">${
        this.langPillTitles.titles[name]
      }${clickText || ""}</span>`;
    }
    return name;
  }

  createBar(div, name, series) {
    return Highcharts.chart({
      chart: {
        type: "bar",
        spacingRight: 8,
        spacingLeft: 2,
        spacingTop: 8,
        spacingBottom: 8,
        animation: false,
        renderTo: div,
      },

      title: {
        style: {
          fontWeight: "normal",
        },
        margin: 0,
      },

      xAxis: {
        visible: false,
        gridLineWidth: 0,
      },

      yAxis: {
        maxPadding: 0,
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

      tooltip: {
        snap: 0,
        useHTML: true,
        formatter() {
          if (this.series.options.filter === "frequency") {
            return `${this.series.name} - <strong>${this.y}</strong>`;
          }
          if (this.series.options.filter === "volume") {
            return `${this.series.name} - <strong>${Highcharts.numberFormat(
              this.y,
              0,
              "."
            )} m3</strong>`;
          }
          return "";
        },
      },

      legend: {
        alignColumns: false,
        reversed: true,
        margin: 0,
        padding: 4,
        symbolPadding: 2,
        itemStyle: {
          color: "#000000",
          cursor: "default",
          fontSize: "13px",
        },
        itemHoverStyle: {
          color: "#000000",
          cursor: "default",
        },
        navigation: {
          enabled: false,
        },
      },

      plotOptions: {
        bar: {
          pointWidth: 30,
        },
        series: {
          animation: false,
          shadow: false,
          states: {
            inactive: {
              enabled: false,
            },
            hover: {
              enabled: false,
            },
          },
          events: {
            legendItemClick() {
              return false;
            },
          },
        },
      },
      series: this.seriesify(name, series, "frequency"),
    });
  }

  prepareData(barName) {
    // TODO: this would run faster if all series were made in one pass
    const addToSeries = (series, row, name) => {
      if (Object.prototype.hasOwnProperty.call(series, row[name])) {
        series[row[name]].frequency += 1;
        series[row[name]].volume += row.vol;
      } else {
        series[row[name]] = {
          frequency: 1,
          volume: row.vol,
        };
      }
      return series;
    };

    let newBar = {};
    this.data.forEach((row) => {
      newBar = addToSeries(newBar, row, barName);
    });
    this.barSeries[barName] = newBar;
  }

  deactivateChart(bar) {
    const { chart } = bar;
    const activeDiv = document.getElementById(bar.div);
    const clickText =
      this.langPillTitles.click && this.langPillTitles.click !== ""
        ? ` (${this.langPillTitles.click})`
        : "";

    if (chart) {
      const greyIndex = Math.floor(
        EventNavigator.greyTheme.length / chart.series.length
      );
      const everyNth = (arr, nth) => arr.filter((e, i) => i % nth === nth - 1);

      const greyColors =
        chart.series.length > 1
          ? everyNth(EventNavigator.greyTheme, greyIndex).reverse()
          : [EventNavigator.greyTheme[0]];

      chart.series.forEach((s, i) => {
        chart.series[i].options.color = greyColors[i];
        chart.series[i].update(chart.series[i].options);
      });

      chart.update({
        title: {
          text: this.pillName(bar.name, clickText),
          align: "center",
        },
        plotOptions: {
          series: {
            borderWidth: 1,
            borderColor: "#303030",
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
    } else {
      activeDiv.innerHTML = this.pillName(bar.name, clickText);
      activeDiv.style.padding = "5px";
    }
    activeDiv.style.borderStyle = "solid";
    activeDiv.style.borderColor = cerPalette["Dim Grey"];
    activeDiv.style.borderRadius = "5px";
    activeDiv.style.opacity = "0.4";
  }

  activateChart(bar) {
    const { chart } = bar;
    const activeDiv = document.getElementById(bar.div);
    if (chart) {
      const colors = this.barColors[bar.name];
      chart.series.forEach((s, i) => {
        chart.series[i].options.color = colors[s.options.id].c;
        chart.series[i].update(chart.series[i].options);
      });

      chart.update({
        chart: {
          backgroundColor: "white",
        },
        title: {
          text: this.pillName(bar.name),
        },
        plotOptions: {
          series: {
            borderWidth: 1,
            borderColor: "#303030",
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
    } else {
      activeDiv.innerHTML = this.pillName(bar.name);
      activeDiv.style.backgroundColor = "white";
      activeDiv.style.padding = "5px";
    }
    this.currentActive = bar;
    activeDiv.style.borderStyle = "solid";
    activeDiv.style.borderColor = cerPalette["Cool Grey"];
    activeDiv.style.borderRadius = "5px";
    activeDiv.style.opacity = "1";
    this.plot.fieldChange(bar.name);
  }

  barEvents(currentBar) {
    const barDiv = document.getElementById(currentBar.div);
    function mouseOver() {
      if (currentBar.status !== "activated") {
        barDiv.style.opacity = "1";
        if (currentBar.chart) {
          currentBar.chart.update({
            chart: {
              backgroundColor: "#F0F8FF",
            },
          });
        } else {
          barDiv.style.backgroundColor = "#F0F8FF"; // TODO: make these colors into class variables
        }
      }
    }

    function mouseOut() {
      if (currentBar.status !== "activated") {
        barDiv.style.opacity = "0.4";
        if (currentBar.chart) {
          currentBar.chart.update({
            chart: {
              backgroundColor: "white",
            },
          });
        } else {
          barDiv.style.backgroundColor = "white";
        }
      }
    }

    const barNav = this;
    function click() {
      // deactivate current active bar
      barNav.deactivateChart(barNav.currentActive);
      barNav.currentActive.status = "deactivated";
      // activate the clicked bar
      currentBar.status = "activated";
      barNav.activateChart(currentBar);
    }

    barDiv.addEventListener("mouseover", mouseOver);
    barDiv.addEventListener("mouseout", mouseOut);
    barDiv.addEventListener("click", click);
  }

  /**
   * Creates a horizontal bar chart inside the pill if EventNavigator.data is set.
   * @param {string} barName - Bar id that will be used to isolate dataset variable/pill name.
   * @param {string} div - HTML div id of the pill.
   * @param {string} status - Either "activated" or "deactivated". Activate the default dashboard data parameter.
   */
  makeBar(barName, div, status) {
    const height = this.fixedPillHeight
      ? this.fixedPillHeight
      : this.pillHeight;

    const pillSelect = document.getElementById(div);
    pillSelect.style.height = `${height}px`;
    if (this.barList.length !== 0) {
      pillSelect.classList.add("mrgn-tp-sm");
    }
    if (this.data) {
      this.prepareData(barName);
    }

    const newBar = {
      chart: this.data ? this.createBar(div, barName, this.barSeries) : false,
      status,
      div,
      name: barName,
    };
    this.allDivs.push(div);
    this.barList.push(newBar);
    this.bars[barName] = newBar;
    if (status === "activated") {
      this.activateChart(newBar);
    } else if (status === "deactivated") {
      this.deactivateChart(newBar);
    }
  }

  divEvents() {
    this.barList.forEach((bar) => {
      this.barEvents(bar);
    });
  }

  /**
   *
   * @param {string} newY - Updates horizontal bar charts with new data. Commonly used to switch between event count vs event volume.
   */
  switchY(newY) {
    this.barList.forEach((bar) => {
      bar.chart.update({
        series: this.seriesify(bar.name, this.barSeries, newY),
      });
    });
  }
}
