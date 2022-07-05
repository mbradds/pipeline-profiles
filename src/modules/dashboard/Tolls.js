import Highcharts from "highcharts";
import {
  cerPalette,
  btnGroupClick,
  visibility,
  removeAllSeries,
} from "../util.js";
import { addRenderer } from "../../dashboards/dashboardUtil.js";
import { fillBetween } from "../datestone.js";

export class Tolls {
  constructor({ tollsData, metaData, lang, chartDiv }) {
    this.tollsData = tollsData;
    this.metaData = metaData;
    this.lang = lang;
    this.chartDiv = chartDiv;
    this.currentSplit = metaData.split.default ? metaData.split.default : false;
    this.unitsSelector = 0;
    this.onlySystem = false;
    this.folder = undefined;
    this.download = undefined;
    this.tollOrder = undefined;
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

    const getPointsList = (data) => [
      data.map((d) => [`${d.receiptPoint}-${d.deliveryPoint}`, d.selected]),
      data.map((d) => [
        `${this.substituteTranslation(
          d.receiptPoint
        )}-${this.substituteTranslation(d.deliveryPoint)}`,
        d.selected,
      ]),
    ];

    if (this.currentSplit) {
      this.currentProduct = getProduct(
        this.metaData.products[this.currentSplit]
      );
      this.currentService = getProduct(
        this.metaData.services[this.currentSplit]
      );
      this.currentUnits = this.metaData.units[this.currentSplit];
      this.defaultUnits = this.metaData.units[this.currentSplit];
      this.seriesCol = this.metaData.seriesCol[this.currentSplit];
      this.tollNum = tollNumDates(this.metaData.tollNum[this.currentSplit]);
      this.unitsFilter = this.metaData.unitsFilter[this.currentSplit];
      [this.points, this.displayPoints] = getPointsList(
        this.tollsData[this.currentSplit]
      );
      this.products = this.metaData.products[this.currentSplit];
      this.services = this.metaData.services[this.currentSplit];
      this.currentData = this.tollsData[this.currentSplit];
    } else {
      this.currentProduct = getProduct(this.metaData.products);
      this.currentService = getProduct(this.metaData.services);
      this.currentUnits = this.metaData.units;
      this.defaultUnits = this.metaData.units;
      this.seriesCol = this.metaData.seriesCol;
      this.tollNum = tollNumDates(this.metaData.tollNum);
      this.unitsFilter = this.metaData.unitsFilter;
      [this.points, this.displayPoints] = getPointsList(this.tollsData);
      this.products = this.metaData.products;
      this.services = this.metaData.services;
      this.currentData = this.tollsData;
    }
  }

  static buildSeries(data, units = 0) {
    const processTollsSection = (section) => {
      const seriesLookup = {};
      const colorList = Object.values(cerPalette);
      const usedColors = {};
      section.forEach((path, pathNum) => {
        const fullPath = [];
        const fullPathName = `${path.receiptPoint}-${path.deliveryPoint}`;
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
            id: `${partialPath.id}-${fullPathName}`,
            name: partialPath.id,
            service: partialPath.s,
            data: fullTolls,
            color: currentColor,
            receipt: path.receiptPoint,
            delivery: path.deliveryPoint,
            units: partialPath.u,
            product: partialPath.p,
          });
        });
        seriesLookup[fullPathName] = fullPath;
      });
      return seriesLookup;
    };
    return processTollsSection(data);
  }

  toolTipTolls(event, seriesCol) {
    let currentTollOrder = "";
    this.tollNum.forEach((tollOrder) => {
      if (event.x >= tollOrder.s && event.x <= tollOrder.e) {
        this.tollOrder = tollOrder.id;
        this.folder = tollOrder.f;
        this.download = tollOrder.d;
      }
    });
    currentTollOrder = ` - ${this.tollOrder}`;

    if (this.metaData.commodity !== "Liquid") {
      currentTollOrder = "";
    }

    // get the toll number from lookup
    const tableRow = (label, value) =>
      `<tr><td>${label}${this.lang.tooltip.space}&nbsp;</td><td><strong>${value}</strong></td></tr>`;

    let toolText = `<strong>${Highcharts.dateFormat(
      "%b %d, %Y",
      event.x
    )}${currentTollOrder}</strong>`;

    toolText += `<table>`;
    toolText += tableRow(
      this.lang.tooltip.toll,
      `${this.lang.numberFormat(event.y)} (${this.currentUnits})`
    );

    const optionalSections = {
      Path: tableRow(
        this.lang.tooltip.path,
        `${this.substituteTranslation(
          event.series.userOptions.receipt
        )}-${this.substituteTranslation(event.series.userOptions.delivery)}`
      ),
      Product: tableRow(
        this.lang.tooltip.product,
        this.substituteTranslation(event.series.userOptions.product)
      ),
      Service: tableRow(
        this.lang.tooltip.service,
        this.substituteTranslation(event.series.userOptions.service)
      ),
    };
    Object.keys(optionalSections).forEach((row) => {
      if (row !== seriesCol) {
        toolText += optionalSections[row];
      }
    });
    if (!this.onlySystem) {
      toolText += tableRow(
        seriesCol,
        this.substituteTranslation(event.series.userOptions.name)
      );
    }
    toolText += `</table>`;
    toolText += `<i>Click chart for REGDOCS info</i>`;
    return toolText;
  }

  chartYaxisTitle() {
    return `${this.lang.yAxis} (${this.currentUnits})`;
  }

  substituteTranslation(id) {
    if (this.lang.lang === "e") {
      return id;
    }
    try {
      if (
        Object.prototype.hasOwnProperty.call(this.metaData.translations, id)
      ) {
        return this.metaData.translations[id];
      }
      return id;
    } catch (err) {
      return id;
    }
  }

  buildTollsChart(series) {
    function regdocsClick(chart, dashboard) {
      if (chart.customTooltip) {
        chart.customTooltip.destroy();
      }
      const folderLink = `<a href="https://apps.cer-rec.gc.ca/REGDOCS/Item/View/${dashboard.folder}" target="_blank">Folder</a>`;
      const downloadLink = `<a href="https://apps.cer-rec.gc.ca/REGDOCS/File/Download/${dashboard.download}" target="_blank">Download</a>`;
      const text = `REGDOCS (${dashboard.tollOrder}): ${folderLink} ${downloadLink}`;
      chart.customTooltip = addRenderer(chart, text, "black");
    }

    const dashboard = this;
    let legend = {
      title: {
        text: dashboard.seriesCol,
      },
      labelFormatter() {
        return dashboard.substituteTranslation(this.name);
      },
    };

    if (this.onlySystem) {
      legend = { enabled: false };
    }

    this.chart = Highcharts.chart({
      chart: {
        renderTo: dashboard.chartDiv,
        zoomType: "x",
        animation: false,
        events: {
          click() {
            regdocsClick(this, dashboard);
          },
        },
      },
      title: { text: "" },
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
            return Highcharts.numberFormat(this.value, 2);
          },
        },
      },
      legend,
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
            click() {
              regdocsClick(this.chart, dashboard);
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

  addFilterBtns() {
    const addCheckbox = (point, btnGroup, i, type, section) => {
      const checked = point[1] ? `checked="checked"` : "";
      const displayValue = this.substituteTranslation(point[0]);
      btnGroup.insertAdjacentHTML(
        "beforeend",
        `<div class="${type}">
        <label for="inlineCheck${i}${section}" label>
        <input id="inlineCheck${i}${section}" ${checked} type="${type}" name="optradio${section}" value="${displayValue}">${this.substituteTranslation(
          displayValue
        )}
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

    const createBtn = (div, display, options, conditional, type, section) => {
      let btnGroup = setUpButtons(display, div);
      if (conditional) {
        visibility([div], "show");
        btnGroup = addEachButton(options, btnGroup, type, section);
      } else {
        visibility([div], "hide");
      }
      return btnGroup;
    };

    const btnGroupPaths = createBtn(
      "tolls-path-btn",
      this.lang.filters.path,
      this.displayPoints,
      this.metaData.pathFilter[0] && this.displayPoints,
      this.metaData.pathFilter[1],
      "point"
    );

    const btnGroupServices = createBtn(
      "tolls-service-btn",
      this.lang.filters.service,
      this.services,
      this.currentService && this.services,
      "radio",
      "service"
    );

    const btnGroupProducts = createBtn(
      "tolls-product-btn",
      this.lang.filters.product,
      this.products,
      this.currentProduct && this.products,
      "radio",
      "product"
    );

    const btnGroupUnits = createBtn(
      "tolls-units-btn",
      this.lang.filters.units,
      this.unitsFilter,
      this.unitsFilter,
      "radio",
      "units"
    );
    return [btnGroupPaths, btnGroupProducts, btnGroupServices, btnGroupUnits];
  }

  addSplitButtons() {
    if (this.currentSplit && this.metaData.split.buttons.length > 1) {
      const btnGroup = document.getElementById("tolls-split-btn");
      this.metaData.split.buttons.forEach((point) => {
        btnGroup.insertAdjacentHTML(
          "beforeend",
          `<div class="btn-group"><button type="button" value="${point}" class="btn btn-default${
            point === this.metaData.split.default ? " active" : ""
          }">${point}</button></div>`
        );
      });
      btnGroup.addEventListener("click", (event) => {
        if (event.target) {
          this.unitsSelector = 0;
          this.currentPath = undefined;
          btnGroupClick("tolls-split-btn", event);
          this.currentSplit = event.target.value;
          this.getDefaults();
          this.applySplitDescription();
          this.addFilterBtns();
          this.updateAllSeries(this.selectedSeries(0));
          const dashboard = this;
          this.chart.update({
            tooltip: {
              formatter() {
                return dashboard.toolTipTolls(this, dashboard.seriesCol);
              },
            },
            yAxis: {
              title: {
                text: dashboard.chartYaxisTitle(),
              },
            },
            legend: {
              title: {
                text: dashboard.seriesCol,
              },
            },
          });
        }
      });
    } else if (this.currentSplit && this.metaData.split.buttons.length === 1) {
      console.warn("tolls split but only one option detected");
    } else {
      visibility(["tolls-split-btn"], "hide");
    }
  }

  selectedSeries(units) {
    const addAll = (path, fullSeries) => {
      const seriesList = [];
      path.forEach((p) => {
        if (p[1]) {
          seriesList.push(...fullSeries[p[0]]);
        }
      });
      return seriesList;
    };

    const paths = this.currentPath ? [[this.currentPath, true]] : this.points;
    const series = Tolls.buildSeries(this.currentData, units);
    let selected = addAll(paths, series);
    this.onlySystem = !!(paths.length === 1 && paths[0][0] === "System-System");

    if (this.currentProduct) {
      selected = selected.filter((s) => s.product === this.currentProduct);
    }
    if (this.currentService) {
      selected = selected.filter((s) => s.service === this.currentService);
    }
    return selected;
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
            removeAllSeries(this.chart);
          }

          if (section === "path") {
            this.currentPath = currentValue;
          } else if (section === "product") {
            this.currentProduct = currentValue;
          } else if (section === "service") {
            this.currentService = currentValue;
          }

          const currentLegend = getChartLegend(this.chart);
          this.selectedSeries(this.unitsSelector).forEach((s) => {
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
          series.forEach((s) => {
            if (s.id.includes(currentValue)) {
              this.chart.get(s.id).remove();
            }
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

  unitsListener(btnGroup) {
    if (btnGroup) {
      btnGroup.addEventListener("click", (event) => {
        if (event.target && event.target.tagName === "INPUT") {
          this.currentUnits = event.target.value;
          if (this.currentUnits !== this.defaultUnits) {
            this.unitsSelector = 1;
          } else {
            this.unitsSelector = 0;
          }
          this.updateAllSeries(this.selectedSeries(this.unitsSelector));
          this.chart.update({
            yAxis: {
              title: {
                text: this.chartYaxisTitle(),
              },
            },
          });
        }
      });
    }
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

  updateAllSeries(newSeries) {
    removeAllSeries(this.chart);
    newSeries.forEach((newS) => {
      this.chart.addSeries(newS, false, false);
    });
    return this.chart;
  }

  buildDashboard() {
    this.addSplitButtons();
    const series = this.selectedSeries(this.unitsSelector);
    this.buildTollsChart(series);
    this.pathTotalsDisclaimer();
    this.applySplitDescription();
    const [pathBtns, productBtns, serviceBtns, unitsBtn] = this.addFilterBtns();
    this.listener(pathBtns, series, "path");
    this.listener(serviceBtns, series, "service");
    this.listener(productBtns, series, "product");
    this.unitsListener(unitsBtn);
    return this.chart;
  }
}
