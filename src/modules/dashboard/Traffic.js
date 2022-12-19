/**
 * @file Contains functionality for building the classic traffic combination chart (throughput as area, capacity as line) chart
 * and a new five-year average chart. The five-year average chart and series is generated dynamically from the same data as the first
 * chart to save on code-size.
 *
 * Data pre-processing in ../data_management/traffic.py handles alot of the highcharts series parameters, and creates the metadata for the
 * key point buttons and initially selected key point.
 *
 * The Trans Mountain corner case is handled throughout this file with the "tm" boolean variable contained in the "chartParams" object. Trans Mountain
 * is a corner case because they file one capacity number for the system, but also report throughput at multiple key points. Therefore a
 * radio multi-select has to be used instead of the buttons on other key points.
 */

import Highcharts from "highcharts";
import HighchartsMore from "highcharts/highcharts-more.js";
import {
  cerPalette,
  arrAvg,
  visibility,
  sortJsonAlpha,
  listOrParagraph,
  equalizeHeight,
  btnGroupClick,
  removeAllSeries,
} from "../util.js";
import {
  addSeriesParams,
  addUnitsAndSetup,
  addUnitsDisclaimer,
  isCapacity,
} from "../../dashboards/dashboardUtil.js";
import { createFiveYearSeries, fiveYearTrend } from "../fiveYear.js";
import { KeyPointMap } from "./KeyPointMap.js";

HighchartsMore(Highcharts);

const sharedHcParams = {
  legend: {
    alignColumns: false,
    margin: 3,
    padding: 0,
    itemDistance: 15,
    symbolPadding: 2,
    labelFormatter() {
      return this.name;
    },
  },
  plotOptions: {
    series: {
      animation: false,
      connectNulls: true,
      states: {
        inactive: {
          opacity: 1,
        },
      },
    },
  },
  labelFormatter: (val, params, lang) =>
    lang.numberFormat(val, params.commodity === "oil" ? 0 : 1),
  title: (text) => ({
    align: "left",
    x: 7,
    margin: 5,
    text,
    style: {
      fontWeight: "normal",
    },
  }),
};

export class Traffic {
  constructor({
    trafficData,
    metaData,
    lang,
    rounding = 2,
    pipelineShape = undefined,
  }) {
    this.trafficData = trafficData;
    this.metaData = metaData;
    this.lang = lang;
    this.rounding = rounding;
    this.pipelineShape = pipelineShape;
    this.params = this.getDashboardParameters();
    this.sharedHcParams = sharedHcParams;
  }

  getKeyPoint(defaultId) {
    try {
      return { id: defaultId, name: this.lang.points[defaultId][0] };
    } catch (err) {
      return { id: defaultId, name: "" };
    }
  }

  getPointList(meta) {
    return sortJsonAlpha(
      meta.keyPoints.map((point) => ({
        id: point.KeyPointID,
        name: this.lang.points[point.KeyPointID][0],
        loc: point.loc,
      })),
      "name"
    );
  }

  resize(chart = undefined) {
    const mainTrafficDiv = document.getElementById("traffic-hc");
    if (this.params.hasImports) {
      // user is on a gas profile, but there are imports that hide five year avg
      mainTrafficDiv.classList.remove("traffic-hc-shared");
      mainTrafficDiv.classList.add("traffic-hc-single-gas");
      visibility(["traffic-hc-range"], "hide");
    } else {
      if (!mainTrafficDiv.classList.contains("traffic-hc-shared")) {
        mainTrafficDiv.classList.add("traffic-hc-shared");
      }
      visibility(["traffic-hc-range"], "show");
    }
    if (chart) {
      chart.reflow();
      chart.redraw(true);
    }
  }

  getDashboardParameters() {
    const defaultPoint = this.getKeyPoint(this.metaData.defaultPoint);
    const chartParams = addUnitsAndSetup(
      this.metaData.units,
      defaultPoint,
      this.lang.units,
      "traffic",
      this.metaData.frequency
    );
    chartParams.frequency = this.metaData.frequency;
    chartParams.defaultPoint = defaultPoint;
    chartParams.points = this.getPointList(this.metaData);
    chartParams.companyName = this.metaData.companyName;
    chartParams.directions = this.metaData.directions;
    chartParams.trendText = this.metaData.trendText;
    return chartParams;
  }

  addPointButtons() {
    const btnGroup = document.getElementById("traffic-points-btn");
    if (this.params.defaultPoint.id !== "KP0003") {
      this.params.points.forEach((point) => {
        const checkTxt =
          point.id === this.params.defaultPoint.id ? " active" : "";
        btnGroup.insertAdjacentHTML(
          "beforeend",
          `<div class="btn-group"><button type="button" value="${point.id}" class="btn btn-default${checkTxt}">${point.name}</button></div>`
        );
      });
    } else {
      this.params.points.forEach((point, i) => {
        btnGroup.insertAdjacentHTML(
          "beforeend",
          `<div class="checkbox-inline">
        <label for="inlineCheck${i}" label><input id="inlineCheck${i}" checked="checked" type="checkbox" value="${point.id}">${point.name}</label>
     </div>`
        );
      });
    }
  }

  createSeries() {
    let firstSeries = [];
    if (this.params.tm) {
      let [capAdded, dateAdded] = [false, false];
      const seriesAdded = {};
      const includeKeys = this.params.points.map((p) => p.id);
      const newData = JSON.parse(JSON.stringify(this.trafficData));
      Object.keys(newData).forEach((key) => {
        if (includeKeys.includes(key)) {
          const keyData = newData[key];
          keyData.forEach((tmPoint) => {
            if (tmPoint.id === "cap" && !capAdded) {
              capAdded = true;
              firstSeries.push(tmPoint);
            } else if (tmPoint.id === "date" && !dateAdded) {
              firstSeries.push(tmPoint);
              dateAdded = true;
            } else if (tmPoint.id !== "cap" && tmPoint.id !== "date") {
              if (
                Object.prototype.hasOwnProperty.call(seriesAdded, tmPoint.id)
              ) {
                const newData2 = tmPoint.data;
                seriesAdded[tmPoint.id].data = seriesAdded[tmPoint.id].data.map(
                  (v, i) => v + newData2[i]
                );
              } else {
                seriesAdded[tmPoint.id] = {
                  data: tmPoint.data,
                  yAxis: tmPoint.yAxis,
                  color: tmPoint.color,
                  id: tmPoint.id,
                };
              }
            }
          });
        }
      });
      Object.values(seriesAdded).forEach((value) => {
        firstSeries.push(value);
      });
    } else {
      firstSeries = this.trafficData[this.params.defaultPoint.id];
    }
    return firstSeries;
  }

  buildPointMap() {
    let pointMap;
    if (this.params.defaultPoint.id !== "KP0000") {
      const { pipelineShape } = this;
      pointMap = new KeyPointMap({
        points: this.params.points,
        selected: !this.params.tm
          ? [this.params.defaultPoint]
          : this.params.points,
        companyName: this.params.companyName,
        pipelineShape,
      });
      // KP0000 = system. These pipelines should be using trafficNoMap.hbs
      if (this.params.points.length === 1) {
        visibility(["traffic-points-btn", "key-point-title"], "hide");
      } else {
        this.addPointButtons();
      }
      pointMap.addBaseMap();
      pointMap.addPoints();
    }
    return pointMap;
  }

  tmTitle() {
    let text = "";
    this.params.points.forEach((point) => {
      text += `${point.name} `;
    });
    return text;
  }

  setTitle(fiveYr) {
    let pointText = "";
    let dirLangList = [false];
    if (this.params.tm) {
      pointText = this.tmTitle();
    } else {
      dirLangList = this.params.directions[this.params.defaultPoint.id].map(
        (dir) => {
          if (Object.prototype.hasOwnProperty.call(this.lang.directions, dir)) {
            return this.lang.directions[dir];
          }
          return "";
        }
      );
      pointText = this.params.defaultPoint.name;
    }
    if (fiveYr) {
      return this.lang.fiveYrTitle(pointText);
    }
    return this.lang.trafficTitle(
      pointText,
      dirLangList,
      this.params.frequency
    );
  }

  addToolRow(p, unit, round, extraStyle = "") {
    const yVal = (pnt) => {
      if (
        Object.prototype.hasOwnProperty.call(pnt.point, "low") &&
        Object.prototype.hasOwnProperty.call(pnt.point, "high")
      ) {
        return (p2) =>
          `${this.lang.numberFormat(p2.point.low)} - ${this.lang.numberFormat(
            p2.point.high
          )}`;
      }
      return (p2) => `${this.lang.numberFormat(p2.y, round)}`;
    };

    const yFunction = yVal(p);
    const colorCircle =
      unit !== "%" && p.series.name !== "Total"
        ? `<span style="color: ${p.color}">&#11044</span>&nbsp;`
        : " ";
    return `<tr style="${extraStyle}"><th>${colorCircle}${
      p.series.name
    }:</th><th>&nbsp;${yFunction(p)} ${unit}</th></tr>`;
  }

  tooltipText(event, units) {
    const addTable = (section) => {
      let toolText = '<table class="mrgn-tp-sm">';
      let total = 0;
      section.traffic.forEach((row) => {
        toolText += row[0];
        total += row[1];
      });
      if (section.traffic.length >= 2) {
        toolText += this.addToolRow(
          {
            color: cerPalette["Cool Grey"],
            series: { name: "Total" },
            y: total,
            point: {},
          },
          units,
          this.rounding,
          "border-top: 1px dashed grey"
        );
      }
      if (
        Object.prototype.hasOwnProperty.call(section, "capacity") &&
        section.capacity[0]
      ) {
        toolText += section.capacity[0];
        toolText += this.addToolRow(
          {
            color: cerPalette["Cool Grey"],
            series: { name: this.lang.util },
            y: (total / section.capacity[1]) * 100,
            point: {},
          },
          "%",
          0,
          "border-top: 1px solid grey"
        );
      }
      toolText += "</table>";
      return toolText;
    };

    const textHolder = {
      imports: { traffic: [], capacity: 0 },
      other: { traffic: [] },
    };
    let hasImports = false;
    event.points.forEach((p) => {
      if (p.series.options.bidirectional) {
        hasImports = true;
      }
      if (
        hasImports &&
        p.series.options.data_type === "throughput" &&
        p.series.options.yAxis === 1
      ) {
        textHolder.imports.traffic.push([
          this.addToolRow(p, units, this.rounding),
          p.y,
        ]);
      } else if (p.series.options.data_type === "capacity-2") {
        textHolder.imports.capacity = [
          this.addToolRow(p, units, this.rounding),
          p.y,
        ];
      } else if (p.series.options.data_type === "capacity") {
        textHolder.other.capacity = [
          this.addToolRow(p, units, this.rounding),
          p.y,
        ];
      } else {
        textHolder.other.traffic.push([
          this.addToolRow(p, units, this.rounding),
          p.y,
        ]);
      }
    });

    // tooltip header
    let toolText = "";
    // TODD: add frequency to this.params
    if (this.metaData.frequency === "monthly") {
      toolText = `<strong>${Highcharts.dateFormat("%b, %Y", event.x)}</strong>`;
    } else {
      // remove this when frequency is decided!
      toolText = `<strong>${Highcharts.dateFormat(
        "%b %e, %Y",
        event.x
      )}</strong>`;
    }

    toolText += addTable(textHolder.other);
    if (hasImports) {
      toolText += addTable(textHolder.imports);
    }
    return toolText;
  }

  createTrafficChart(series, title, div = "traffic-hc") {
    const currentDashboard = this;
    return Highcharts.chart({
      chart: {
        renderTo: div,
        zoomType: "x",
        marginRight: 0,
        spacingTop: 5,
        spacingBottom: 5,
      },
      title: this.sharedHcParams.title(title),
      xAxis: {
        type: "datetime",
        crosshair: true,
      },
      yAxis: [
        {
          title: {
            text: this.params.unitsHolder.current,
          },
          min: 0,
          startOnTick: true,
          endOnTick: false,
          tickPixelInterval: 40,
          labels: {
            formatter() {
              return currentDashboard.sharedHcParams.labelFormatter(
                this.value,
                currentDashboard.params,
                currentDashboard.lang
              );
            },
          },
        },
        { visible: false },
      ],
      tooltip: {
        shared: true,
        borderColor: cerPalette["Dim Grey"],
        useHTML: true,
        formatter() {
          return currentDashboard.tooltipText(
            this,
            currentDashboard.params.unitsHolder.current
          );
        },
      },
      legend: this.sharedHcParams.legend,
      plotOptions: this.sharedHcParams.plotOptions,
      series,
    });
  }

  fiveYearTooltipText(event, units) {
    let toolText = `<strong>${this.lang.months[event.x + 1]}</strong><table>`;
    event.points.forEach((p) => {
      p.series.name = p.series.name.split("(")[0].trim();
      toolText += this.addToolRow(p, units, this.rounding);
    });
    toolText += "</table>";
    return toolText;
  }

  createFiveYearChart(series) {
    const currentDashboard = this;
    if (!series) {
      return false;
    }
    return Highcharts.chart({
      chart: {
        renderTo: "traffic-hc-range",
        type: "line",
        marginRight: 0,
        spacingTop: 5,
        spacingBottom: 5,
      },
      title: this.sharedHcParams.title(this.setTitle(true)),
      xAxis: {
        crosshair: true,
        tickInterval: 1,
        labels: {
          step: 1,
          formatter() {
            return currentDashboard.lang.months[this.value + 1];
          },
        },
      },
      legend: this.sharedHcParams.legend,
      yAxis: {
        startOnTick: true,
        endOnTick: false,
        title: { text: this.params.unitsHolder.current },
        tickPixelInterval: 40,
        labels: {
          formatter() {
            return currentDashboard.sharedHcParams.labelFormatter(
              this.value,
              currentDashboard.params,
              currentDashboard.lang
            );
          },
        },
      },
      lang: {
        noData: this.lang.fiveYr.notEnough,
      },
      tooltip: {
        shared: true,
        borderColor: cerPalette["Dim Grey"],
        useHTML: true,
        formatter() {
          return currentDashboard.fiveYearTooltipText(
            this,
            currentDashboard.params.unitsHolder.current
          );
        },
      },
      plotOptions: this.sharedHcParams.plotOptions,
      series,
    });
  }

  hasImportsRedraw() {
    const currentDashboard = this;
    const chart = this.trafficChart;
    const getAxisTitle = (axis) => {
      let axisName = "";
      chart.yAxis[axis].series.forEach((s) => {
        if (s.userOptions.data_type === "throughput" && s.visible) {
          axisName = s.name;
        }
      });
      return axisName;
    };

    chart.update(
      {
        title: {
          text: this.setTitle(false),
        },
        yAxis: [
          {
            title: {
              text: `${getAxisTitle(0)} (${this.params.unitsHolder.current})`,
            },
            height: "45%",
            max: undefined,
          },
          {
            visible: true,
            tickPixelInterval: 40,
            labels: {
              formatter() {
                return currentDashboard.lang.numberFormat(this.value, 1);
              },
            },
            title: {
              text: `${getAxisTitle(1)} (${this.params.unitsHolder.current})`,
            },
            top: "50%",
            height: "45%",
            offset: 0,
            min: 0,
            startOnTick: true,
            endOnTick: false,
            max: undefined,
          },
        ],
      },
      false,
      false,
      false
    );
    chart.redraw(false);
    const maxY = Math.max(chart.yAxis[0].max, chart.yAxis[1].max);
    chart.update(
      {
        yAxis: [
          {
            max: maxY,
          },
          {
            max: maxY,
          },
        ],
      },
      false,
      false,
      false
    );
    chart.redraw(false);
    return chart;
  }

  displayPointDescription() {
    try {
      const points = !this.params.tm
        ? [this.params.defaultPoint]
        : this.params.points;

      const pointList =
        points.length > 1 ? sortJsonAlpha(points, "name") : points;

      const pointsText = pointList.map((p) => {
        const textCol =
          points.length > 1
            ? `<strong>${p.name}</strong> - ${this.lang.points[p.id][1]}`
            : `${this.lang.points[p.id][1]}`;
        return { ...p, textCol };
      });
      document.getElementById("traffic-point-description").innerHTML =
        listOrParagraph(pointsText, "textCol");
    } catch (err) {
      document.getElementById(
        "traffic-point-description"
      ).innerHTML = `<p>No key point description provided.</p>`;
    }
  }

  tableRound(v) {
    const val = v;
    let round = 0;
    if (val > 100 || val <= 0) {
      round = 0;
    } else if (val > 1) {
      round = 1;
    } else {
      round = 2;
    }
    return this.lang.numberFormat(val, round, "");
  }

  calculateAnnualAvg(series) {
    const annualSeries = [];
    const total = {};
    let seriesCounter = 0;
    series.forEach((s) => {
      if (!isCapacity(s.data_type)) {
        seriesCounter += 1;
        const annual = {};
        s.data.forEach((row) => {
          const date = new Date(row[0]);
          const year = date.getFullYear();
          if (Object.prototype.hasOwnProperty.call(annual, year)) {
            annual[year].push(row[1]);
          } else {
            annual[year] = [row[1]];
          }
        });

        const annualAvg = {};
        Object.keys(annual).forEach((yr) => {
          let yearlyAvg = arrAvg(annual[yr]);
          if (Object.prototype.hasOwnProperty.call(total, yr)) {
            total[yr] += yearlyAvg;
          } else {
            total[yr] = yearlyAvg;
          }
          yearlyAvg = this.tableRound(yearlyAvg);
          annualAvg[yr] = yearlyAvg;
        });
        annualSeries.push({ name: s.name, data: annualAvg });
      }
    });

    const yearList = Object.keys(total);
    yearList.unshift("");
    Object.keys(total).forEach((yr) => {
      total[yr] = this.tableRound(total[yr]);
    });
    if (seriesCounter > 1) {
      annualSeries.push({ name: this.lang.total, data: total });
    }
    return { annualSeries, yearList };
  }

  buildAnnualTable(series) {
    try {
      if (series[0]) {
        const { annualSeries, yearList } = this.calculateAnnualAvg(series);
        let tableHtml = `<table class="table table-condensed"><thead><tr>`;
        yearList.forEach((yr) => {
          tableHtml += `<th scope="col">${yr}</th>`;
        });
        tableHtml += `</tr></thead><tbody>`;
        annualSeries.forEach((product) => {
          const rowValues = Object.values(product.data);
          rowValues.unshift(product.name);
          let tr = `<tr>`;
          rowValues.forEach((annualValue, i) => {
            if (i === 0) {
              tr += `<td><strong>${annualValue}</strong></td>`;
            } else {
              tr += `<td>${annualValue}</td>`;
            }
          });
          tableHtml += `${tr}</tr>`;
        });
        tableHtml += `</tbody></table>`;

        const pointText = this.params.tm
          ? this.tmTitle()
          : this.params.defaultPoint.name;
        const titleText = `${this.lang.annualTitle} ${pointText} (${this.params.unitsHolder.current})`;
        document.getElementById("annual-traffic-table-title").innerText =
          titleText;
        document.getElementById("annual-traffic-table").innerHTML = tableHtml;
      } else {
        const titleText = `${this.lang.annualTitle}`;
        document.getElementById("annual-traffic-table-title").innerText =
          titleText;
        document.getElementById("annual-traffic-table").innerHTML = "";
      }
    } catch (err) {
      document.getElementById(
        "annual-traffic-table"
      ).parentElement.style.display = "none";
    }
  }

  updateDynamicComponents(runDescription = true) {
    this.lang.dynamicText(
      this.params,
      this.lang.numberFormat,
      this.lang.series
    );
    if (runDescription) {
      this.displayPointDescription();
    }
    equalizeHeight("eq-ht-1", "eq-ht-2");
    this.buildAnnualTable(this.timeSeries);
  }

  buildDashboard() {
    this.resize();
    addUnitsDisclaimer(
      "conversion-disclaimer-traffic",
      this.params.commodity,
      this.lang.unitsDisclaimerText
    );

    this.pointMap = this.buildPointMap();
    [this.timeSeries, this.fiveSeries] = addSeriesParams(
      this.createSeries(),
      this.params.unitsHolder,
      this.params.buildFive,
      this.lang.series,
      this.params.frequency
    );

    if (this.fiveSeries) {
      this.fiveSeries = createFiveYearSeries(this.fiveSeries, this.lang);
      this.params.fiveTrend = fiveYearTrend(
        this.fiveSeries,
        this.params.hasImports
      );
    } else {
      this.params.fiveTrend = false;
    }

    this.trafficChart = this.createTrafficChart(
      this.timeSeries,
      this.setTitle(false)
    );

    this.fiveChart = this.createFiveYearChart(this.fiveSeries);
    // only m&np should meet this criteria on load
    if (this.params.hasImports) {
      this.hasImportsRedraw();
    }
    this.updateDynamicComponents();
  }

  static updateSeries(chart, newSeries, hasImports, returnImports) {
    const currentIds = chart.series.map((s) => s.userOptions.id);
    const newIds = newSeries.map((s) => s.id);
    let updateImports = hasImports;

    currentIds.forEach((id) => {
      if (!newIds.includes(id)) {
        const selectedSeries = chart.get(id);
        selectedSeries.hide();
        selectedSeries.update({ showInLegend: false }, false);
      }
    });

    newSeries.forEach((newS) => {
      if (currentIds.includes(newS.id)) {
        const selectedSeries = chart.get(newS.id);
        selectedSeries.show();
        selectedSeries.setData(newS.data, false, false, false);
        selectedSeries.update({ showInLegend: true }, false);
      } else {
        chart.addSeries(newS, false, true);
      }
      if (newS.id === "im" || newS.bidirectional) {
        updateImports = true;
      }
    });

    if (returnImports) {
      return [chart, updateImports];
    }
    return chart;
  }

  updateFiveYearChart() {
    const series = this.fiveSeries
      ? createFiveYearSeries(this.fiveSeries, this.lang)
      : undefined;
    let newChart;
    if (this.fiveChart) {
      newChart = Traffic.updateSeries(this.fiveChart, series, undefined, false);
      newChart.update(
        {
          title: {
            text: this.setTitle(this.params, true),
          },
          yAxis: {
            visible: true,
          },
        },
        false,
        false,
        false
      );
      newChart.redraw(true);
    }
    this.fiveSeries = series;
    this.fiveChart = newChart;
  }

  keyPointListener() {
    // user selects key point
    if (!this.params.tm && this.params.defaultPoint.id !== "KP0000") {
      document
        .getElementById("traffic-points-btn")
        .addEventListener("click", (event) => {
          btnGroupClick("traffic-points-btn", event);
          this.params.hasImports = false;
          this.params.defaultPoint = this.getKeyPoint(event.target.value);

          [this.timeSeries, this.fiveSeries] = addSeriesParams(
            this.trafficData[this.params.defaultPoint.id],
            this.params.unitsHolder,
            this.params.buildFive,
            this.lang.series,
            this.params.frequency
          );

          [this.trafficChart, this.params.hasImports] = Traffic.updateSeries(
            this.trafficChart,
            this.timeSeries,
            this.params.hasImports,
            true
          );

          if (this.params.hasImports) {
            this.trafficChart = this.hasImportsRedraw();
          } else {
            this.trafficChart.update(
              {
                title: {
                  text: this.setTitle(false),
                },
                yAxis: [
                  {
                    height: "100%",
                    max: undefined,
                    title: {
                      text: this.params.unitsHolder.current,
                    },
                  },
                  { visible: false },
                ],
              },
              false
            );
            this.updateFiveYearChart();
          }
          this.resize(this.trafficChart);
          this.pointMap.pointChange([this.params.defaultPoint]);
          this.params.fiveTrend = fiveYearTrend(
            this.fiveSeries,
            this.params.hasImports
          );
          this.updateDynamicComponents();
        });
    } else if (this.params.tm && this.params.defaultPoint.id !== "KP0000") {
      // user is on trans mountain profile
      document
        .getElementById("traffic-points-btn")
        .addEventListener("click", (event) => {
          if (event.target && event.target.tagName === "INPUT") {
            const pointId = event.target.value;
            if (event.target.checked) {
              this.params.points.push({
                id: pointId,
                name: this.lang.points[pointId][0],
              });
            } else {
              this.params.points = this.params.points.filter(
                (point) => point.id !== pointId
              );
            }

            removeAllSeries(this.trafficChart);

            if (this.params.points.length >= 0) {
              [this.timeSeries, this.fiveSeries] = addSeriesParams(
                this.createSeries(),
                this.params.unitsHolder,
                this.params.buildFive,
                this.lang.series,
                this.params.frequency
              );

              this.timeSeries.forEach((newS) => {
                this.trafficChart.addSeries(newS, false, false);
              });

              this.trafficChart.update({
                title: {
                  text: this.setTitle(false),
                },
              });
              this.updateFiveYearChart();
              this.pointMap.pointChange(this.params.points);
            }
            this.updateDynamicComponents();
          }
        });
    }
  }

  unitsListener() {
    // user selects units
    document
      .getElementById("select-units-radio-traffic")
      .addEventListener("click", (event) => {
        if (event.target && event.target.value) {
          this.params.unitsHolder.current = event.target.value;
          [this.timeSeries, this.fiveSeries] = addSeriesParams(
            this.createSeries(),
            this.params.unitsHolder,
            this.params.buildFive,
            this.lang.series,
            this.params.frequency
          );

          const currentDashboard = this;
          this.trafficChart.update(
            {
              series: this.timeSeries,
              yAxis: [
                {
                  title: { text: this.params.unitsHolder.current },
                },
              ],
              tooltip: {
                formatter() {
                  return currentDashboard.tooltipText(
                    this,
                    currentDashboard.params.unitsHolder.current
                  );
                },
              },
            },
            true,
            false,
            false
          );
          if (this.params.hasImports) {
            this.hasImportsRedraw();
            this.trafficChart.redraw(false);
          }
          if (this.fiveChart) {
            this.fiveChart.update(
              {
                series: createFiveYearSeries(this.fiveSeries, this.lang),
                tooltip: {
                  formatter() {
                    return currentDashboard.fiveYearTooltipText(
                      this,
                      currentDashboard.params.unitsHolder.current
                    );
                  },
                },
                yAxis: {
                  title: { text: this.params.unitsHolder.current },
                },
              },
              true,
              false,
              false
            );
          }
          this.updateDynamicComponents(false);
        }
      });
  }

  mapZoomListener() {
    if (this.params.defaultPoint.id !== "KP0000") {
      document
        .getElementById("key-point-zoom-btn")
        .addEventListener("click", (event) => {
          btnGroupClick("key-point-zoom-btn", event);
          if (event.target.value === "zoom-in") {
            this.pointMap.reZoom(true);
          } else {
            this.pointMap.reZoom(false);
          }
        });
    }
  }
}
