import Highcharts from "highcharts";
import {
  cerPalette,
  btnGroupClick,
  visibility,
  equalizeHeight,
} from "../util.js";
import { fillBetween } from "../datestone.js";

export class Tolls {
  constructor({ tollsData, metaData, chartDiv }) {
    this.tollsData = tollsData;
    this.metaData = metaData;
    this.chartDiv = chartDiv;
    this.currentSplit = metaData.split.default ? metaData.split.default : false;
    this.getDefaults();
  }

  getDefaults() {
    const getProduct = (prodList) => {
      let found = false;
      if (!prodList) {
        return found;
      }
      prodList.forEach((p) => {
        if (p[1]) {
          [found] = p;
        }
      });
      return found;
    };
    if (this.currentSplit) {
      this.currentProduct = getProduct(
        this.metaData.products[this.currentSplit]
      );
      this.currentService = getProduct(
        this.metaData.services[this.currentSplit]
      );
      [this.currentUnits] = this.metaData.units[this.currentSplit];
      this.seriesCol = this.metaData.seriesCol[this.currentSplit];
    } else {
      this.currentProduct = getProduct(this.metaData.products);
      this.currentService = getProduct(this.metaData.services);
      [this.currentUnits] = this.metaData.units;
      this.seriesCol = this.metaData.seriesCol;
    }
  }

  buildSeries() {
    const processTollsSection = (section) => {
      const seriesLookup = {};
      const colorList = Object.values(cerPalette);
      const usedColors = {};
      section.forEach((path, pathNum) => {
        const fullPath = [];
        path.series.forEach((partialPath, partialNum) => {
          const fullTolls = [];
          partialPath.data.forEach((toll) => {
            fullTolls.push(...fillBetween(toll[0], toll[1], toll[2]));
          });
          let currentColor = colorList[pathNum + partialNum];
          if (usedColors[partialPath.id]) {
            currentColor = usedColors[partialPath.id];
          } else {
            usedColors[partialPath.id] = currentColor;
          }
          fullPath.push({
            id: `${partialPath.id}-${path.pathName}`,
            name: partialPath.id,
            service: partialPath.service,
            data: fullTolls,
            color: currentColor,
            pathName: path.pathName,
            units: partialPath.units,
            product: partialPath.product,
          });
        });
        seriesLookup[path.pathName] = fullPath;
      });
      return seriesLookup;
    };

    const seriesLookup = {};
    if (this.metaData.split.default) {
      Object.keys(this.tollsData).forEach((section) => {
        seriesLookup[section] = processTollsSection(this.tollsData[section]);
      });
    } else {
      return processTollsSection(this.tollsData);
    }
    return seriesLookup;
  }

  static toolTipTolls(event, seriesCol) {
    let toolText = `<strong>${Highcharts.dateFormat(
      "%b %d, %Y",
      event.x
    )}</strong>`;
    toolText += `<table><tr><td>Toll:&nbsp;</td><td><strong>${event.y} (${event.series.userOptions.units})</strong></td></tr>`;
    const optionalSections = {
      Path: `<tr><td>Path:&nbsp;</td><td><strong>${event.series.userOptions.pathName}</strong></td></tr>`,
      Product: `<tr><td>Product:&nbsp;</td><td><strong>${event.series.userOptions.product}</strong></td></tr>`,
      Service: `<tr><td>Service:&nbsp;</td><td><strong>${event.series.userOptions.service}</strong></td></tr>`,
    };
    Object.keys(optionalSections).forEach((row) => {
      if (row !== seriesCol) {
        toolText += optionalSections[row];
      }
    });
    toolText += `<tr><td>${seriesCol}:&nbsp;</td><td><strong>${event.series.userOptions.name}</strong></td></tr></table>`;
    return toolText;
  }

  chartYaxisTitle() {
    return `Toll (${this.currentUnits})`;
  }

  buildTollsChart(series) {
    const dashboard = this;
    const rounding = this.metaData.decimals ? 2 : 0;
    this.chart = new Highcharts.chart(this.chartDiv, {
      chart: {
        zoomType: "x",
        animation: false,
      },
      title: "",
      xAxis: {
        type: "datetime",
        crosshair: true,
      },
      yAxis: {
        title: {
          text: dashboard.chartYaxisTitle(),
        },
        labels: {
          formatter() {
            return Highcharts.numberFormat(this.value, rounding);
          },
        },
      },
      legend: {
        title: {
          text: dashboard.seriesCol,
        },
      },
      plotOptions: {
        series: {
          marker: {
            symbol: "circle",
          },
          events: {
            legendItemClick() {
              return false;
            },
          },
          states: {
            inactive: {
              opacity: 1,
            },
          },
        },
      },
      tooltip: {
        shadow: false,
        useHTML: true,
        animation: true,
        borderColor: cerPalette["Dim Grey"],
        formatter() {
          return Tolls.toolTipTolls(this, dashboard.seriesCol);
        },
      },
      series,
    });
  }

  addPathButtons(series) {
    const addCheckbox = (point, btnGroup, i, type, section) => {
      const checked = point[1] ? `checked="checked"` : "";
      btnGroup.insertAdjacentHTML(
        "beforeend",
        `<div class="${type}">
        <label for="inlineCheck${i}${section}" label>
        <input id="inlineCheck${i}${section}" ${checked} type="${type}" name="optradio${section}" value="${point[0]}">${point[0]}
        </label></div>`
      );
      return btnGroup;
    };

    const setUpButtons = (selectText, divId) => {
      const btnGroup = document.getElementById(divId);
      btnGroup.innerHTML = "";
      btnGroup.insertAdjacentHTML(
        "beforeend",
        `<p class="cerlabel">${selectText}</p>`
      );
      return btnGroup;
    };

    const addEachButton = (pointList, group, type, section) => {
      pointList.forEach((point, i) => {
        addCheckbox(point, group, i, type, section);
      });
      return group;
    };

    let [points, products, services] = [[], [], []];
    if (this.currentSplit) {
      points = this.metaData.paths[this.currentSplit];
      products = this.metaData.products[this.currentSplit];
      services = this.metaData.services[this.currentSplit];
    } else {
      points = this.metaData.paths;
      products = this.metaData.products;
      services = this.metaData.services;
    }

    let btnGroupPaths;
    let btnGroupServices;
    if (this.metaData.pathFilter[0] && points) {
      btnGroupPaths = setUpButtons("Select path:", "tolls-path-btn");
      btnGroupPaths = addEachButton(
        points,
        btnGroupPaths,
        this.metaData.pathFilter[1],
        "point"
      );
    } else if (this.currentService && services) {
      // filter for services and paths should not exist together
      btnGroupServices = setUpButtons("Select service:", "tolls-path-btn");
      btnGroupServices = addEachButton(
        services,
        btnGroupServices,
        "radio",
        "service"
      );
    }

    let btnGroupProducts;
    if (this.currentProduct && products) {
      btnGroupProducts = setUpButtons("Select product:", "tolls-product-btn");
      btnGroupProducts = addEachButton(
        products,
        btnGroupProducts,
        "radio",
        "product"
      );
      this.listener(btnGroupProducts, series, "product");
    }
    return [btnGroupPaths, btnGroupProducts, btnGroupServices];
  }

  static addSplitButtons(split) {
    const btnGroup = document.getElementById("tolls-split-btn");
    split.buttons.forEach((point) => {
      const active = point === split.default ? " active" : "";
      btnGroup.insertAdjacentHTML(
        "beforeend",
        `<div class="btn-group"><button type="button" value="${point}" class="btn btn-default${active}">${point}</button></div>`
      );
    });
    return btnGroup;
  }

  selectedSeries(series) {
    const addAll = (path, seriesList, fullSeries) => {
      path.forEach((p) => {
        if (p[1]) {
          seriesList.push(...fullSeries[p[0]]);
        }
      });

      return seriesList;
    };

    // this is a little rough
    let paths = [];
    let selected = [];
    if (!this.currentSplit) {
      if (this.currentPath) {
        paths = [[this.currentPath, true]];
      } else {
        paths = this.metaData.paths;
      }
      selected = addAll(paths, selected, series);
    } else {
      if (this.currentPath) {
        paths = [[this.currentPath, true]];
      } else {
        paths = this.metaData.paths[this.currentSplit];
      }
      selected = addAll(paths, selected, series[this.currentSplit]);
    }
    // filter products and services here
    if (this.currentProduct) {
      selected = selected.filter((s) => s.product === this.currentProduct);
    }
    if (this.currentService) {
      selected = selected.filter((s) => s.service === this.currentService);
    }
    return selected;
  }

  updateTollsDescription() {
    const split = this.currentSplit
      ? `<strong> ${this.currentSplit} </strong>`
      : " ";
    document.getElementById(
      "toll-description"
    ).innerHTML = `<p>2-3 sentence description of the${split}toll methodology.</p>`;
    equalizeHeight("tolls-filter-container", "tolls-info");
  }

  removeAllSeries() {
    while (this.chart.series.length) {
      this.chart.series[0].remove(false, false, false);
    }
  }

  listener(btnGroup, series, section) {
    const getChartLegend = (c) => c.legend.allItems.map((l) => l.name);
    btnGroup.addEventListener("click", (event) => {
      if (event.target && event.target.tagName === "INPUT") {
        const currentValue = event.target.value;
        if (event.target.checked) {
          const currentNames = {};
          const currentIDs = this.chart.series.map((s) => {
            currentNames[s.name] = { color: s.color };
            return s.userOptions.id;
          });

          if (
            this.metaData.pathFilter[1] === "radio" ||
            this.currentProduct ||
            this.currentService
          ) {
            this.removeAllSeries();
          }

          const currentLegend = getChartLegend(this.chart);
          if (section === "path") {
            this.currentPath = currentValue;
          } else if (section === "product") {
            this.currentProduct = currentValue;
          } else if (section === "service") {
            this.currentService = currentValue;
          }
          const newSelected = this.selectedSeries(series);
          newSelected.forEach((s) => {
            const newSeries = s;
            if (!currentIDs.includes(s.id)) {
              if (currentNames[s.name]) {
                newSeries.color = currentNames[s.name].color;
              }
              if (currentLegend.includes(s.name)) {
                newSeries.showInLegend = false;
              } else {
                newSeries.showInLegend = true;
              }
            }
            this.chart.addSeries(newSeries, false, false);
          });
          this.chart.redraw(true);
        } else {
          series[currentValue].forEach((s) => {
            this.chart.get(s.id).remove();
          });
          const currentLegend = getChartLegend(this.chart);
          this.chart.series.forEach((s) => {
            if (!currentLegend.includes(s.name)) {
              s.update(
                {
                  showInLegend: true,
                },
                false
              );
            }
          });
          this.chart.redraw(true);
        }
      }
    });
  }

  pathTotalsDisclaimer() {
    if (this.metaData.pathTotals[0] !== this.metaData.pathTotals[1]) {
      document.getElementById(
        "path-discliamer"
      ).innerHTML = `<div class="alert alert-warning mrgn-tp-sm">
      <p>There are <strong>${this.metaData.pathTotals[0]}</strong> tolls paths shown for this system. Take a look at the Open Government dataset for information on all <strong>${this.metaData.pathTotals[1]}</strong> available system paths.</p>
      </div>`;
    }
  }

  buildDashboard() {
    const series = this.buildSeries();
    this.buildTollsChart(this.selectedSeries(series));
    this.pathTotalsDisclaimer();
    let [pathBtns, productBtns, serviceBtns] = this.addPathButtons(series);
    this.updateTollsDescription();
    if (this.metaData.pathFilter[0] && pathBtns) {
      this.listener(pathBtns, series, "path");
    } else if (serviceBtns) {
      this.listener(serviceBtns, series, "service");
    } else {
      visibility(["tolls-path-btn"], "hide");
    }

    if (!productBtns) {
      visibility(["tolls-product-btn"], "hide");
    }

    if (this.currentSplit) {
      const splitBtns = Tolls.addSplitButtons(this.metaData.split);
      splitBtns.addEventListener("click", (event) => {
        if (event.target) {
          this.currentPath = undefined;
          btnGroupClick("tolls-split-btn", event);
          this.currentSplit = event.target.value;
          this.getDefaults();
          [pathBtns, productBtns, serviceBtns] = this.addPathButtons(series);
          if (!productBtns) {
            visibility(["tolls-product-btn"], "hide");
          } else {
            visibility(["tolls-product-btn"], "show");
          }
          this.updateTollsDescription();
          this.removeAllSeries();
          const newSeries = this.selectedSeries(series);
          newSeries.forEach((newS) => {
            this.chart.addSeries(newS, false, false);
          });
          const dashboard = this;
          this.chart.update({
            tooltip: {
              formatter() {
                return Tolls.toolTipTolls(this, dashboard.seriesCol);
              },
            },
            yAxis: {
              title: {
                text: this.chartYaxisTitle(),
              },
            },
          });
          this.chart.redraw(true);
        }
      });
    } else {
      visibility(["tolls-split-btn"], "hide");
    }
    return this.chart;
  }
}
