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
import HighchartsMore from "highcharts/highcharts-more";
import {
  cerPalette,
  arrAvg,
  visibility,
  sortJsonAlpha,
  listOrParagraph,
  equalizeHeight,
  loadChartError,
  btnGroupClick,
} from "../modules/util";
import {
  addSeriesParams,
  addUnitsAndSetup,
  addUnitsDisclaimer,
  isCapacity,
} from "./dashboardUtil";
import { createFiveYearSeries, fiveYearTrend } from "../modules/fiveYear";
import { KeyPointMap } from "../modules/dashboard/KeyPointMap";

HighchartsMore(Highcharts);

export async function mainTraffic(trafficData, metaData, lang) {
  const rounding = 2;

  function addPointButtons(params) {
    const btnGroup = document.getElementById("traffic-points-btn");
    if (params.defaultPoint.id !== "35") {
      params.points.forEach((point) => {
        const checkTxt = point.id === params.defaultPoint.id ? " active" : "";
        btnGroup.insertAdjacentHTML(
          "beforeend",
          `<div class="btn-group"><button type="button" value="${point.id}" class="btn btn-default${checkTxt}">${point.name}</button></div>`
        );
      });
    } else {
      params.points.forEach((point, i) => {
        btnGroup.insertAdjacentHTML(
          "beforeend",
          `<div class="checkbox-inline">
        <label for="inlineCheck${i}" label><input id="inlineCheck${i}" checked="checked" type="checkbox" value="${point.id}">${point.name}</label>
     </div>`
        );
      });
    }
  }

  function getPointList(meta) {
    return sortJsonAlpha(
      meta.keyPoints.map((point) => {
        const pointName = lang.points[point["Key Point"]][0];
        return {
          id: point["Key Point"],
          name: pointName,
          loc: point.loc,
        };
      }),
      "name"
    );
  }

  const tmTitle = (params) => {
    let text = "";
    params.points.forEach((point) => {
      text += `${point.name} `;
    });
    return text;
  };

  const setTitle = (params, fiveYr) => {
    let pointText = "";
    let dirLangList = [false];
    if (params.tm) {
      pointText = tmTitle(params);
    } else {
      dirLangList = params.directions[params.defaultPoint.id].map((dir) => {
        if (Object.prototype.hasOwnProperty.call(lang.directions, dir)) {
          return lang.directions[dir];
        }
        return "";
      });
      pointText = params.defaultPoint.name;
    }
    if (fiveYr) {
      return lang.fiveYrTitle(pointText);
    }
    return lang.trafficTitle(pointText, dirLangList);
  };

  const createSeries = (data, params) => {
    let firstSeries = [];
    if (params.tm) {
      let [capAdded, dateAdded] = [false, false];
      const seriesAdded = {};
      const includeKeys = params.points.map((p) => p.id);
      const newData = JSON.parse(JSON.stringify(data));
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
      firstSeries = data[params.defaultPoint.id];
    }
    return firstSeries;
  };

  const addToolRow = (p, unit, round, extraStyle = "") => {
    const yVal = (pnt) => {
      if (
        Object.prototype.hasOwnProperty.call(pnt.point, "low") &&
        Object.prototype.hasOwnProperty.call(pnt.point, "high")
      ) {
        return (p2) =>
          `${lang.numberFormat(p2.point.low)} - ${lang.numberFormat(
            p2.point.high
          )}`;
      }
      return (p2) => `${lang.numberFormat(p2.y, round)}`;
    };

    const yFunction = yVal(p);
    let colorCircle = "";
    if (unit !== "%" && p.series.name !== "Total") {
      colorCircle = `<span style="color: ${p.color}">&#11044</span>&nbsp;`;
    }
    return `<tr style="${extraStyle}"><th>${colorCircle}${
      p.series.name
    }:</th><th>&nbsp;${yFunction(p)} ${unit}</th></tr>`;
  };

  function tooltipText(event, units) {
    const addTable = (section) => {
      let toolText = '<table class="mrgn-tp-sm">';
      let total = 0;
      section.traffic.forEach((row) => {
        toolText += row[0];
        total += row[1];
      });
      if (section.traffic.length >= 2) {
        toolText += addToolRow(
          {
            color: cerPalette["Cool Grey"],
            series: { name: "Total" },
            y: total,
            point: {},
          },
          units,
          rounding,
          "border-top: 1px dashed grey"
        );
      }
      if (Object.prototype.hasOwnProperty.call(section, "capacity")) {
        toolText += section.capacity[0];
        toolText += addToolRow(
          {
            color: cerPalette["Cool Grey"],
            series: { name: lang.util },
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
      if (p.series.options.id === "im") {
        hasImports = true;
        textHolder.imports.traffic.push([addToolRow(p, units, rounding), p.y]);
      } else if (p.series.options.id === "icap") {
        textHolder.imports.capacity = [addToolRow(p, units, rounding), p.y];
      } else if (
        p.series.options.id === "cap" ||
        p.series.options.id === "ecap"
      ) {
        textHolder.other.capacity = [addToolRow(p, units, rounding), p.y];
      } else {
        textHolder.other.traffic.push([addToolRow(p, units, rounding), p.y]);
      }
    });

    // tooltip header
    let toolText = "";
    if (metaData.frequency === "monthly") {
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

  function fiveYearTooltipText(event, units) {
    const currMonth = lang.months[event.x + 1];
    let toolText = `<strong>${currMonth}</strong><table>`;
    event.points.forEach((p) => {
      const cleanPoint = p;
      cleanPoint.series.name = p.series.name.split("(")[0].trim();
      toolText += addToolRow(cleanPoint, units, rounding);
    });
    toolText += "</table>";
    return toolText;
  }

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
    labelFormatter: (val, params) =>
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

  function createFiveYearChart(series, params) {
    if (!series) {
      return false;
    }
    return new Highcharts.chart("traffic-hc-range", {
      chart: {
        type: "line",
        marginRight: 0,
        spacingTop: 5,
        spacingBottom: 5,
      },
      title: sharedHcParams.title(setTitle(params, true)),
      xAxis: {
        crosshair: true,
        tickInterval: 1,
        labels: {
          step: 1,
          formatter() {
            return lang.months[this.value + 1];
          },
        },
      },
      legend: sharedHcParams.legend,
      yAxis: {
        startOnTick: true,
        endOnTick: false,
        title: { text: params.unitsHolder.current },
        tickPixelInterval: 40,
        labels: {
          formatter() {
            return sharedHcParams.labelFormatter(this.value, params);
          },
        },
      },
      lang: {
        noData: lang.fiveYr.notEnough,
      },
      tooltip: {
        shared: true,
        borderColor: cerPalette["Dim Grey"],
        useHTML: true,
        formatter() {
          return fiveYearTooltipText(this, params.unitsHolder.current);
        },
      },
      plotOptions: sharedHcParams.plotOptions,
      series,
    });
  }

  function createTrafficChart(series, title, params, div = "traffic-hc") {
    return new Highcharts.chart(div, {
      chart: {
        zoomType: "x",
        marginRight: 0,
        spacingTop: 5,
        spacingBottom: 5,
      },
      title: sharedHcParams.title(title),
      xAxis: {
        type: "datetime",
        crosshair: true,
      },
      yAxis: [
        {
          title: {
            text: params.unitsHolder.current,
          },
          min: 0,
          startOnTick: true,
          endOnTick: false,
          tickPixelInterval: 40,
          labels: {
            formatter() {
              return sharedHcParams.labelFormatter(this.value, params);
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
          return tooltipText(this, params.unitsHolder.current);
        },
      },
      legend: sharedHcParams.legend,
      plotOptions: sharedHcParams.plotOptions,
      series,
    });
  }

  const hasImportsRedraw = (chart, params) => {
    chart.update(
      {
        title: {
          text: setTitle(params, false),
        },
        yAxis: [
          {
            title: {
              text: lang.exportAxis(params.unitsHolder.current),
            },
            height: "45%",
            max: undefined,
          },
          {
            visible: true,
            tickPixelInterval: 40,
            labels: {
              formatter() {
                return lang.numberFormat(this.value, 1);
              },
            },
            title: {
              text: lang.importAxis(params.unitsHolder.current),
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
  };

  function resize(params, chart = undefined) {
    const mainTrafficDiv = document.getElementById("traffic-hc");
    if (params.hasImports) {
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

  const updateSeries = (chart, newSeries, hasImports, returnImports) => {
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
      if (newS.id === "im") {
        updateImports = true;
      }
    });

    if (returnImports) {
      return [chart, updateImports];
    }
    return chart;
  };

  function getKeyPoint(defaultId) {
    return { id: defaultId, name: lang.points[defaultId][0] };
  }

  function displayPointDescription(params) {
    const points = !params.tm ? [params.defaultPoint] : params.points;

    const pointList =
      points.length > 1 ? sortJsonAlpha(points, "name") : points;

    const pointsText = pointList.map((p) => {
      const textCol =
        points.length > 1
          ? `<strong>${p.name}</strong> - ${lang.points[p.id][1]}`
          : `${lang.points[p.id][1]}`;
      return { ...p, textCol };
    });
    document.getElementById("traffic-point-description").innerHTML =
      listOrParagraph(pointsText, "textCol");
  }

  function updateFiveYearChart(fiveSeries, fiveChart, chartParams) {
    const series = fiveSeries
      ? createFiveYearSeries(fiveSeries, lang)
      : undefined;
    let newChart;
    if (fiveChart) {
      newChart = updateSeries(fiveChart, series, undefined, false);
      newChart.update(
        {
          title: {
            text: setTitle(chartParams, true),
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
    return [series, newChart];
  }

  const tableRound = (v) => {
    const val = v;
    let round = 0;
    if (val > 100 || val <= 0) {
      round = 0;
    } else if (val > 1) {
      round = 1;
    } else {
      round = 2;
    }
    return lang.numberFormat(val, round, "");
  };

  function calculateAnnualAvg(series) {
    const annualSeries = [];
    const total = {};
    let seriesCounter = 0;
    series.forEach((s) => {
      if (!isCapacity(s.id)) {
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
          yearlyAvg = tableRound(yearlyAvg);
          annualAvg[yr] = yearlyAvg;
        });
        annualSeries.push({ name: s.name, data: annualAvg });
      }
    });

    const yearList = Object.keys(total);
    yearList.unshift("");
    Object.keys(total).forEach((yr) => {
      total[yr] = tableRound(total[yr]);
    });
    if (seriesCounter > 1) {
      annualSeries.push({ name: lang.total, data: total });
    }
    return { annualSeries, yearList };
  }

  function buildAnnualTable(series, titleParams) {
    try {
      if (series[0]) {
        const { annualSeries, yearList } = calculateAnnualAvg(series);
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

        let pointText = "";
        if (titleParams.tm) {
          pointText = tmTitle(titleParams);
        } else {
          pointText = titleParams.defaultPoint.name;
        }
        const titleText = `Annual Average Throughput: ${pointText} (${titleParams.unitsHolder.current})`;
        document.getElementById("annual-traffic-table-title").innerText =
          titleText;
        document.getElementById("annual-traffic-table").innerHTML = tableHtml;
      } else {
        const titleText = `Annual Average Throughput:`;
        document.getElementById("annual-traffic-table-title").innerText =
          titleText;
        document.getElementById("annual-traffic-table").innerHTML = "";
      }
    } catch (err) {
      console.log("traffic table error", err);
    }
  }

  function updateDynamicComponents(params, timeSeries, runDescription = true) {
    lang.dynamicText(params, lang.numberFormat, lang.series);
    if (runDescription) {
      displayPointDescription(params);
    }
    equalizeHeight("eq-ht-1", "eq-ht-2");
    buildAnnualTable(timeSeries, params);
  }

  function buildDashboard() {
    const defaultPoint = getKeyPoint(metaData.defaultPoint);
    const chartParams = addUnitsAndSetup(
      metaData.units,
      defaultPoint,
      lang.units,
      "traffic"
    );

    chartParams.defaultPoint = defaultPoint;
    chartParams.points = getPointList(metaData);
    chartParams.companyName = metaData.companyName;
    chartParams.directions = metaData.directions;
    chartParams.trendText = metaData.trendText;
    resize(chartParams);
    addUnitsDisclaimer(
      "conversion-disclaimer-traffic",
      chartParams.commodity,
      lang.unitsDisclaimerText
    );

    let pointMap;
    if (chartParams.defaultPoint.id !== "0") {
      pointMap = new KeyPointMap({
        points: chartParams.points,
        selected: !chartParams.tm
          ? [chartParams.defaultPoint]
          : chartParams.points,
        companyName: chartParams.companyName,
      });
      // 0 = system. These pipelines should be using trafficNoMap.hbs
      if (chartParams.points.length === 1) {
        visibility(["traffic-points-btn", "key-point-title"], "hide");
      } else {
        addPointButtons(chartParams);
      }
      pointMap.addBaseMap();
      pointMap.addPoints();
    }

    let [timeSeries, fiveSeries] = addSeriesParams(
      createSeries(trafficData, chartParams),
      chartParams.unitsHolder,
      chartParams.buildFive,
      lang.series
    );

    if (fiveSeries) {
      fiveSeries = createFiveYearSeries(fiveSeries, lang);
      chartParams.fiveTrend = fiveYearTrend(fiveSeries, chartParams.hasImports);
    } else {
      chartParams.fiveTrend = false;
    }

    let trafficChart = createTrafficChart(
      timeSeries,
      setTitle(chartParams, false),
      chartParams
    );

    let fiveChart = createFiveYearChart(fiveSeries, chartParams);

    // only m&np should meet this criteria on load
    if (chartParams.hasImports) {
      hasImportsRedraw(trafficChart, chartParams);
    }

    updateDynamicComponents(chartParams, timeSeries);

    // user selects key point
    if (!chartParams.tm && chartParams.defaultPoint.id !== "0") {
      document
        .getElementById("traffic-points-btn")
        .addEventListener("click", (event) => {
          btnGroupClick("traffic-points-btn", event);
          chartParams.hasImports = false;
          chartParams.defaultPoint = getKeyPoint(event.target.value);

          [timeSeries, fiveSeries] = addSeriesParams(
            trafficData[chartParams.defaultPoint.id],
            chartParams.unitsHolder,
            chartParams.buildFive,
            lang.series
          );

          [trafficChart, chartParams.hasImports] = updateSeries(
            trafficChart,
            timeSeries,
            chartParams.hasImports,
            true
          );

          if (chartParams.hasImports) {
            trafficChart = hasImportsRedraw(trafficChart, chartParams);
          } else {
            trafficChart.update(
              {
                title: {
                  text: setTitle(chartParams, false),
                },
                yAxis: [
                  {
                    height: "100%",
                    max: undefined,
                    title: {
                      text: chartParams.unitsHolder.current,
                    },
                  },
                  { visible: false },
                ],
              },
              false
            );
            [fiveSeries, fiveChart] = updateFiveYearChart(
              fiveSeries,
              fiveChart,
              chartParams
            );
          }
          resize(chartParams, trafficChart);
          pointMap.pointChange([chartParams.defaultPoint]);
          chartParams.fiveTrend = fiveYearTrend(
            fiveSeries,
            chartParams.hasImports
          );
          updateDynamicComponents(chartParams, timeSeries);
        });
    } else if (chartParams.defaultPoint.id !== "0") {
      // user is on trans mountain profile
      document
        .getElementById("traffic-points-btn")
        .addEventListener("click", (event) => {
          if (event.target) {
            const pointId = event.target.value;
            if (event.target.checked) {
              chartParams.points.push({
                id: pointId,
                name: lang.points[pointId][0],
              });
            } else {
              chartParams.points = chartParams.points.filter(
                (point) => point.id !== pointId
              );
            }

            while (trafficChart.series.length) {
              trafficChart.series[0].remove(false, false, false);
            }

            if (chartParams.points.length >= 0) {
              [timeSeries, fiveSeries] = addSeriesParams(
                createSeries(trafficData, chartParams),
                chartParams.unitsHolder,
                chartParams.buildFive,
                lang.series
              );

              timeSeries.forEach((newS) => {
                trafficChart.addSeries(newS, false, false);
              });

              trafficChart.update({
                title: {
                  text: setTitle(chartParams, false),
                },
              });
              [fiveSeries, fiveChart] = updateFiveYearChart(
                fiveSeries,
                fiveChart,
                chartParams
              );
              pointMap.pointChange(chartParams.points);
            }
            updateDynamicComponents(chartParams, timeSeries);
          }
        });
    }

    // user selects units
    document
      .getElementById("select-units-radio-traffic")
      .addEventListener("click", (event) => {
        if (event.target && event.target.value) {
          chartParams.unitsHolder.current = event.target.value;
          [timeSeries, fiveSeries] = addSeriesParams(
            createSeries(trafficData, chartParams),
            chartParams.unitsHolder,
            chartParams.buildFive,
            lang.series
          );

          trafficChart.update(
            {
              series: timeSeries,
              yAxis: [
                {
                  title: { text: chartParams.unitsHolder.current },
                },
              ],
              tooltip: {
                formatter() {
                  return tooltipText(this, chartParams.unitsHolder.current);
                },
              },
            },
            true,
            false,
            false
          );
          if (chartParams.hasImports) {
            hasImportsRedraw(trafficChart, chartParams);
            trafficChart.redraw(false);
          }
          if (fiveChart) {
            fiveChart.update(
              {
                series: createFiveYearSeries(fiveSeries, lang),
                tooltip: {
                  formatter() {
                    return fiveYearTooltipText(
                      this,
                      chartParams.unitsHolder.current
                    );
                  },
                },
                yAxis: {
                  title: { text: chartParams.unitsHolder.current },
                },
              },
              true,
              false,
              false
            );
          }
          updateDynamicComponents(chartParams, timeSeries, false);
        }
      });

    // update map zoom
    if (chartParams.defaultPoint.id !== "0") {
      document
        .getElementById("key-point-zoom-btn")
        .addEventListener("click", (event) => {
          btnGroupClick("key-point-zoom-btn", event);
          if (event.target.value === "zoom-in") {
            pointMap.reZoom(true);
          } else {
            pointMap.reZoom(false);
          }
        });
    }
  }

  function buildDecision() {
    try {
      if (metaData.build) {
        return buildDashboard();
      }
      return undefined;
    } catch (err) {
      console.log(err);
      return loadChartError("traffic-section", lang.dashboardError);
    }
  }
  return buildDecision();
}
