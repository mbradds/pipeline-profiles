import Highcharts from "highcharts";
import { cerPalette, btnGroupClick, visibility } from "../util.js";
import { fillBetween } from "../datestone.js";

export class Tolls {
  constructor({ tollsData, metaData, lang, chartDiv }) {
    this.tollsData = tollsData;
    this.metaData = metaData;
    this.lang = lang;
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

    const tollNumDates = (df) =>
      df.map((row) => {
        row.s = new Date(row.s).getTime();
        row.e = new Date(row.e).getTime();
        return row;
      });

    if (this.currentSplit) {
      this.currentProduct = getProduct(
        this.metaData.products[this.currentSplit]
      );
      this.currentService = getProduct(
        this.metaData.services[this.currentSplit]
      );
      [this.currentUnits] = this.metaData.units[this.currentSplit];
      [this.defaultUnits] = this.metaData.units[this.currentSplit];
      this.seriesCol = this.metaData.seriesCol[this.currentSplit];
      this.tollNum = tollNumDates(this.metaData.tollNum[this.currentSplit]);
      this.unitsFilter = this.metaData.unitsFilter[this.currentSplit];
    } else {
      this.currentProduct = getProduct(this.metaData.products);
      this.currentService = getProduct(this.metaData.services);
      [this.currentUnits] = this.metaData.units;
      [this.defaultUnits] = this.metaData.units;
      this.seriesCol = this.metaData.seriesCol;
      this.tollNum = tollNumDates(this.metaData.tollNum);
      this.unitsFilter = this.metaData.unitsFilter;
    }
  }

  static buildSeries(data, units = 0) {
    const processTollsSection = (section) => {
      const seriesLookup = {};
      const colorList = Object.values(cerPalette);
      const usedColors = {};
      section.forEach((path, pathNum) => {
        const fullPath = [];
        path.series.forEach((partialPath, partialNum) => {
          const fullTolls = [];
          partialPath.data.forEach((toll) => {
            fullTolls.push(...fillBetween(toll[0], toll[1], toll[2][units]));
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
            service: partialPath.s,
            data: fullTolls,
            color: currentColor,
            pathName: path.pathName,
            units: partialPath.u,
            product: partialPath.p,
          });
        });
        seriesLookup[path.pathName] = fullPath;
      });
      return seriesLookup;
    };
    return processTollsSection(data);
  }

  toolTipTolls(event, seriesCol) {
    // get the toll number from lookup
    let currentTollOrder = "";
    this.tollNum.forEach((tollOrder) => {
      if (event.x >= tollOrder.s && event.x <= tollOrder.e) {
        currentTollOrder = tollOrder.id;
      }
    });

    const tableRow = (label, value) =>
      `<tr><td>${label}&nbsp;</td><td><strong>${value}</strong></td></tr>`;

    let toolText = `<strong>${Highcharts.dateFormat(
      "%b %d, %Y",
      event.x
    )} - ${currentTollOrder}</strong>`;

    toolText += `<table>`;
    toolText += tableRow(
      this.lang.tooltip.toll,
      `${event.y} (${event.series.userOptions.units})`
    );

    const optionalSections = {
      Path: tableRow(this.lang.tooltip.path, event.series.userOptions.pathName),
      Product: tableRow(
        this.lang.tooltip.product,
        event.series.userOptions.product
      ),
      Service: tableRow(
        this.lang.tooltip.service,
        event.series.userOptions.service
      ),
    };
    Object.keys(optionalSections).forEach((row) => {
      if (row !== seriesCol) {
        toolText += optionalSections[row];
      }
    });
    toolText += tableRow(seriesCol, event.series.userOptions.name);
    toolText += `</table>`;
    return toolText;
  }

  chartYaxisTitle() {
    return `${this.lang.yAxis} (${this.currentUnits})`;
  }

  buildTollsChart(series) {
    const dashboard = this;
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
            return Highcharts.numberFormat(
              this.value,
              dashboard.metaData.decimals ? 2 : 0
            );
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
          connectNulls: false,
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
          return dashboard.toolTipTolls(this, dashboard.seriesCol);
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
      btnGroupPaths = setUpButtons(this.lang.filters.path, "tolls-path-btn");
      btnGroupPaths = addEachButton(
        points,
        btnGroupPaths,
        this.metaData.pathFilter[1],
        "point"
      );
    } else if (this.currentService && services) {
      btnGroupServices = setUpButtons(
        this.lang.filters.service,
        "tolls-path-btn"
      );
      btnGroupServices = addEachButton(
        services,
        btnGroupServices,
        "radio",
        "service"
      );
    }

    let btnGroupProducts;
    if (this.currentProduct && products) {
      btnGroupProducts = setUpButtons(
        this.lang.filters.product,
        "tolls-product-btn"
      );
      btnGroupProducts = addEachButton(
        products,
        btnGroupProducts,
        "radio",
        "product"
      );
      this.listener(btnGroupProducts, series, "product");
    }

    let btnGroupUnits;
    if (this.unitsFilter) {
      btnGroupUnits = setUpButtons("Select Units:", "tolls-units-btn");
      btnGroupUnits = addEachButton(
        this.unitsFilter,
        btnGroupUnits,
        "radio",
        "units"
      );
    }
    return [btnGroupPaths, btnGroupProducts, btnGroupServices, btnGroupUnits];
  }

  static addSplitButtons(split) {
    const btnGroup = document.getElementById("tolls-split-btn");
    split.buttons.forEach((point) => {
      btnGroup.insertAdjacentHTML(
        "beforeend",
        `<div class="btn-group"><button type="button" value="${point}" class="btn btn-default${
          point === split.default ? " active" : ""
        }">${point}</button></div>`
      );
    });
    return btnGroup;
  }

  selectedSeries(units) {
    const addAll = (path, seriesList, fullSeries) => {
      path.forEach((p) => {
        if (p[1]) {
          seriesList.push(...fullSeries[p[0]]);
        }
      });
      return seriesList;
    };

    let selected = [];
    if (!this.currentSplit) {
      const series = Tolls.buildSeries(this.tollsData, units);
      const paths = this.currentPath
        ? [[this.currentPath, true]]
        : this.metaData.paths;
      selected = addAll(paths, selected, series);
    } else {
      const series = Tolls.buildSeries(
        this.tollsData[this.currentSplit],
        units
      );
      const paths = this.currentPath
        ? [[this.currentPath, true]]
        : this.metaData.paths[this.currentSplit];
      selected = addAll(paths, selected, series);
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

          if (section === "path") {
            this.currentPath = currentValue;
          } else if (section === "product") {
            this.currentProduct = currentValue;
          } else if (section === "service") {
            this.currentService = currentValue;
          }

          const currentLegend = getChartLegend(this.chart);
          this.selectedSeries(series).forEach((s) => {
            if (!currentIDs.includes(s.id)) {
              if (currentNames[s.name]) {
                s.color = currentNames[s.name].color;
              }
              if (currentLegend.includes(s.name)) {
                s.showInLegend = false;
              } else {
                s.showInLegend = true;
              }
            }
            this.chart.addSeries(s, false, false);
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
      ).innerHTML = `<div class="alert alert-warning mrgn-tp-sm">${this.lang.pathDisclaimer(
        this.metaData.pathTotals[0],
        this.metaData.pathTotals[1]
      )}</div>`;
    }
  }

  applySplitDescription() {
    const splitDescDiv = document.getElementById("split-description");
    if (
      this.metaData.splitDescription &&
      this.currentSplit &&
      Object.prototype.hasOwnProperty.call(
        this.metaData.splitDescription,
        this.currentSplit
      )
    ) {
      splitDescDiv.innerHTML = `<h3>${this.currentSplit} ${
        this.lang.splitDescription
      }</h3><p>${this.metaData.splitDescription[this.currentSplit]}</p>`;
    } else {
      splitDescDiv.innerHTML = "";
    }
  }

  buildDashboard() {
    const series = this.selectedSeries(0);
    this.buildTollsChart(series);
    this.pathTotalsDisclaimer();
    this.applySplitDescription();
    let [pathBtns, productBtns, serviceBtns, unitsBtn] =
      this.addPathButtons(series);
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

    if (unitsBtn) {
      unitsBtn.addEventListener("click", (event) => {
        if (event.target && event.target.tagName === "INPUT") {
          console.log(event.target.value);
        }
      });
    }

    if (this.currentSplit) {
      Tolls.addSplitButtons(this.metaData.split).addEventListener(
        "click",
        (event) => {
          if (event.target) {
            this.currentPath = undefined;
            btnGroupClick("tolls-split-btn", event);
            this.currentSplit = event.target.value;
            this.getDefaults();
            this.applySplitDescription();
            [pathBtns, productBtns, serviceBtns, unitsBtn] =
              this.addPathButtons(series);
            if (!productBtns) {
              visibility(["tolls-product-btn"], "hide");
            } else {
              visibility(["tolls-product-btn"], "show");
            }
            this.removeAllSeries();
            const newSeries = this.selectedSeries(0);
            newSeries.forEach((newS) => {
              this.chart.addSeries(newS, false, false);
            });
            const dashboard = this;
            this.chart.update({
              tooltip: {
                formatter() {
                  return dashboard.toolTipTolls(this, dashboard.seriesCol);
                },
              },
              yAxis: {
                title: {
                  text: this.chartYaxisTitle(),
                },
              },
              legend: {
                title: {
                  text: dashboard.seriesCol,
                },
              },
            });
            this.chart.redraw(true);
          }
        }
      );
    } else {
      visibility(["tolls-split-btn"], "hide");
    }
    return this.chart;
  }
}
