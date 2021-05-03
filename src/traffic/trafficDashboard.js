import {
  cerPalette,
  visibility,
  sortJsonAlpha,
  arrAvg,
  listOrParagraph,
  addSeriesParams,
  addUnitsAndSetup,
  addUnitsDisclaimer,
} from "../modules/util";
import { KeyPointMap } from "../modules/dashboard";

export async function mainTraffic(trafficData, metaData, lang) {
  const rounding = 2;

  function addPointButtons(params) {
    const btnGroup = $("#traffic-points-btn");
    if (params.defaultPoint.id !== "35") {
      params.points.forEach((point) => {
        const checkTxt = point.id === params.defaultPoint.id ? " active" : "";
        btnGroup.append(
          `<div class="btn-group btn-point"><button type="button" value="${point.id}" class="btn btn-default${checkTxt}">${point.name}</button></div>`
        );
      });
    } else {
      params.points.forEach((point, i) => {
        btnGroup.append(
          `<div class="checkbox-inline">
          <label for="inlineCheck${i}" label><input id="inlineCheck${i}" checked="checked" type="checkbox" value="${point.id}">${point.name}</label>
       </div>`
        );
      });
    }
  }

  function getPointList(meta) {
    const pointList = meta.keyPoints.map((point) => {
      const pointName = lang.points[point["Key Point"]][0];
      return {
        id: point["Key Point"],
        name: pointName,
        loc: point.loc,
      };
    });
    return sortJsonAlpha(pointList, "name");
  }

  const setTitle = (point, tradeType, tm = false, fiveYear = false) => {
    if (!tm) {
      if (!fiveYear) {
        return `${point} - monthly ${tradeType[1].join(
          " & "
        )} traffic (Direction of flow: ${tradeType[0].join(" & ")})`;
      }
      return `${point} - Five year average & range`;
    }
    let titleText = "";
    point.forEach((p) => {
      titleText += `${p.name} `;
    });
    return `${titleText} - monthly traffic`;
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
            if (tmPoint.name === "Capacity" && !capAdded) {
              capAdded = true;
              firstSeries.push(tmPoint);
            } else if (tmPoint.name === "date" && !dateAdded) {
              firstSeries.push(tmPoint);
              dateAdded = true;
            } else if (tmPoint.name !== "Capacity" && tmPoint.name !== "date") {
              if (
                Object.prototype.hasOwnProperty.call(seriesAdded, tmPoint.name)
              ) {
                const newData2 = tmPoint.data;
                seriesAdded[tmPoint.name].data = seriesAdded[
                  tmPoint.name
                ].data.map((v, i) => v + newData2[i]);
              } else {
                seriesAdded[tmPoint.name] = {
                  data: tmPoint.data,
                  yAxis: tmPoint.yAxis,
                  color: tmPoint.color,
                  name: tmPoint.name,
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

  function createFiveYearSeries(dataWithDate) {
    const lastDate = dataWithDate.slice(-1)[0][0];
    const lastYear = new Date(lastDate).getFullYear(); // the last year in the dataset
    const firstYear = lastYear - 6; // the first year of the five year average
    const startYear = new Date(dataWithDate[0][0]).getFullYear();

    const lastYrSeries = {
      data: [],
      type: "line",
      zIndex: 5,
      name: `${lastYear} throughput (last year of data)`,
      color: cerPalette.hcRed,
    };

    const fiveYrRange = {
      data: [],
      name: `Five Year Range (${firstYear + 1}-${lastYear - 1})`,
      type: "arearange",
      zIndex: 3,
      marker: {
        enabled: false,
      },
      color: cerPalette.Ocean,
    };

    const fiveYrAvg = {
      data: [],
      name: "Five Year Average",
      type: "line",
      zIndex: 4,
      marker: {
        enabled: false,
      },
      lineWidth: 4,
      color: "black",
    };
    lastYrSeries.id = lastYrSeries.name;
    fiveYrRange.id = fiveYrRange.name;
    fiveYrAvg.id = fiveYrAvg.name;

    const months = {};
    if (startYear > firstYear) {
      return [lastYrSeries, fiveYrAvg, fiveYrRange];
    }

    dataWithDate.forEach((row) => {
      const value = row[1];
      const dateInt = new Date(parseInt(row[0], 10));
      const [month, year] = [dateInt.getMonth() + 1, dateInt.getFullYear()];
      if (year === lastYear) {
        lastYrSeries.data.push([lang.months[month.toString()], value]);
      }
      if (year > firstYear && year < lastYear) {
        if (month in months) {
          months[month].push(value);
        } else {
          months[month] = [value];
        }
      }
    });

    Object.keys(months).forEach((monthNum) => {
      const value = months[monthNum];
      fiveYrRange.data.push([
        lang.months[monthNum],
        Math.min(...value),
        Math.max(...value),
      ]);
      fiveYrAvg.data.push([lang.months[monthNum], arrAvg(value)]);
    });

    return [lastYrSeries, fiveYrAvg, fiveYrRange];
  }

  function fiveYearTrend(fiveSeries, hasImports) {
    if (fiveSeries && !hasImports) {
      const [lastYrSeries, fiveYrAvg] = [fiveSeries[0], fiveSeries[1]];
      const fiveYrTrend = {};
      const lst = [
        [fiveYrAvg, "fiveYrQtr"],
        [lastYrSeries, "lastYrQtr"],
      ];
      lst.forEach((series) => {
        let last3 = series[0].data.slice(-3);
        last3 = last3.map((v) => v[1]);
        fiveYrTrend[series[1]] = arrAvg(last3);
      });
      return fiveYrTrend;
    }
    return undefined;
  }

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
      colorCircle = `<span style="color: ${p.color}">&#11044</span>&nbsp`;
    }
    return `<tr style="${extraStyle}"><th>${colorCircle}${
      p.series.name
    }:</th><th>&nbsp${yFunction(p)} ${unit}</th></tr>`;
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
      if (p.series.name === "import") {
        hasImports = true;
        textHolder.imports.traffic.push([addToolRow(p, units, rounding), p.y]);
      } else if (p.series.name === "Import Capacity") {
        textHolder.imports.capacity = [addToolRow(p, units, rounding), p.y];
      } else if (
        p.series.name === "Capacity" ||
        p.series.name === "Export Capacity"
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
    legend: { alignColumns: false, margin: 0, symbolPadding: 2 },
    plotOptions: {
      series: {
        connectNulls: true,
        states: {
          inactive: {
            opacity: 1,
          },
        },
      },
    },
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
    return new Highcharts.chart("traffic-hc-range", {
      chart: {
        type: "line",
        marginRight: 0,
        spacingTop: 5,
        spacingBottom: 5,
      },
      title: sharedHcParams.title(
        setTitle(params.defaultPoint.name, undefined, false, true)
      ),
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
            return lang.numberFormat(this.value, 1);
          },
        },
      },
      lang: {
        noData: "Not enough data to calculate five-year average",
      },
      noData: {
        style: {
          fontWeight: "bold",
          fontSize: "15px",
          color: "#303030",
        },
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

  function buildTrafficChart(series, title, params, div = "traffic-hc") {
    return new Highcharts.chart(div, {
      chart: {
        zoomType: "x",
        marginRight: 0,
        spacingTop: 5,
        spacingBottom: 5,
        animation: false,
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
              return lang.numberFormat(
                this.value,
                params.commodity === "oil" ? 0 : 1
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
          return tooltipText(this, params.unitsHolder.current);
        },
      },
      legend: {
        alignColumns: false,
        margin: 0,
        symbolPadding: 2,
        labelFormatter() {
          const legendLang = lang.trade[this.name];
          if (legendLang) {
            return legendLang;
          }
          return this.name;
        },
      },
      plotOptions: sharedHcParams.plotOptions,
      series,
    });
  }

  const hasImportsRedraw = (chart, params) => {
    chart.update(
      {
        title: {
          text: setTitle(
            params.defaultPoint.name,
            params.directions[params.defaultPoint.id]
          ),
        },
        yAxis: [
          {
            title: {
              text: `Exports (${params.unitsHolder.current})`,
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
              text: `Imports (${params.unitsHolder.current})`,
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
    return chart;
  };

  function resize(params) {
    const mainTrafficDiv = document.getElementById("traffic-hc");
    const mainMap = document.getElementById("traffic-map");
    if (params.buildFive && params.hasImports) {
      // user is on a gas profile, but there are imports that hide five year avg
      mainTrafficDiv.classList.remove("traffic-hc-shared");
      mainTrafficDiv.classList.add("traffic-hc-single-gas");
      mainMap.classList.add("traffic-map-shared");
      visibility(["traffic-hc-range"], "hide");
    } else if (!params.buildFive) {
      mainTrafficDiv.classList.add("traffic-hc-single");
      mainMap.classList.add("traffic-map-single");
    } else {
      visibility(["traffic-hc-range"], "show");
      mainTrafficDiv.classList.add("traffic-hc-shared");
      mainMap.classList.add("traffic-map-shared");
      mainTrafficDiv.classList.remove("traffic-hc-single-gas");
    }
  }

  const updateSeries = (chart, newSeries, hasImports, returnImports) => {
    const currentIds = chart.series.map((s) => s.userOptions.id);
    const newIds = newSeries.map((s) => s.id);
    let updateImports = hasImports;

    currentIds.forEach((id) => {
      if (!newIds.includes(id)) {
        chart.get(id).remove(false);
      }
    });

    newSeries.forEach((newS) => {
      if (currentIds.includes(newS.id)) {
        chart.get(newS.id).setData(newS.data, false, false, false);
      } else {
        chart.addSeries(newS, false, true);
      }
      if (newS.name === "import") {
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

  function displayPointDescription(points) {
    const pointsText = points.map((p) => {
      let textCol = "";
      if (points.length > 1) {
        textCol = `<strong>${p.name}</strong> - ${lang.points[p.id][1]}`;
      } else {
        textCol = `${lang.points[p.id][1]}`;
      }
      const newP = { ...p, textCol };
      return newP;
    });
    document.getElementById(
      "traffic-point-description"
    ).innerHTML = listOrParagraph(pointsText, "textCol");
  }

  function buildDashboard() {
    try {
      const defaultPoint = getKeyPoint(metaData.defaultPoint);
      const chartParams = addUnitsAndSetup(
        metaData.units,
        defaultPoint,
        lang.units,
        "traffic"
      );
      // TODO: use speread operators here to make copies
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

      const pointMap = new KeyPointMap({
        points: chartParams.points,
        selected: !chartParams.tm
          ? [chartParams.defaultPoint]
          : chartParams.points,
        companyName: chartParams.companyName,
      });
      if (chartParams.defaultPoint.id !== "0") {
        // 0 = system
        if (chartParams.points.length === 1) {
          // eg, Keystone
          ["traffic-points-btn", "key-point-title"].forEach((hideDiv) => {
            document.getElementById(hideDiv).style.display = "none";
          });
        } else {
          addPointButtons(chartParams);
        }
        pointMap.addBaseMap();
        pointMap.addPoints();
      } else {
        visibility(
          ["traffic-points-btn", "traffic-container", "key-point-title"],
          "hide"
        );
        const element = document.getElementById("traffic-hc-column");
        element.className = element.className.replace("col-md-8", "col-md-12");
      }

      let [timeSeries, fiveSeries] = addSeriesParams(
        createSeries(trafficData, chartParams),
        chartParams.unitsHolder,
        chartParams.buildFive
      );
      if (fiveSeries) {
        fiveSeries = createFiveYearSeries(fiveSeries);
      }

      let trafficChart = buildTrafficChart(
        timeSeries,
        !chartParams.tm
          ? setTitle(
              chartParams.defaultPoint.name,
              chartParams.directions[chartParams.defaultPoint.id]
            )
          : setTitle(chartParams.points, undefined, chartParams.tm),
        chartParams
      );

      let fiveChart = false; // TODO: add buildFive and hasImports to createFiveYearChart and return undefined

      // only m&np should meet this criteria on load
      if (chartParams.hasImports) {
        hasImportsRedraw(trafficChart, chartParams);
        trafficChart.redraw(true);
      } else if (chartParams.buildFive && !chartParams.hasImports) {
        // user is on gas profile that isnt m&np
        fiveChart = createFiveYearChart(fiveSeries, chartParams);
      } else {
        // user is on oil profile
        fiveChart = false;
      }
      chartParams.fiveTrend = fiveYearTrend(fiveSeries, chartParams.hasImports);
      // this event listener possibly helps with the equal height not working properly
      window.addEventListener("DOMContentLoaded", () => {
        lang.dynamicText(chartParams, lang.numberFormat);
        if (!chartParams.tm) {
          displayPointDescription([chartParams.defaultPoint]);
        } else {
          displayPointDescription(chartParams.points, chartParams.tm);
        }
      });

      // user selects key point
      if (!chartParams.tm) {
        $("#traffic-points-btn button").on("click", function () {
          $(".btn-point > .btn").removeClass("active");
          const keyBtn = $(this).addClass("active");
          chartParams.hasImports = false;
          chartParams.defaultPoint = getKeyPoint(keyBtn.val());
          [timeSeries, fiveSeries] = addSeriesParams(
            trafficData[chartParams.defaultPoint.id],
            chartParams.unitsHolder,
            chartParams.buildFive
          );

          if (fiveSeries) {
            fiveSeries = createFiveYearSeries(fiveSeries);
          }

          [trafficChart, chartParams.hasImports] = updateSeries(
            trafficChart,
            timeSeries,
            chartParams.hasImports,
            true
          );

          if (chartParams.hasImports) {
            hasImportsRedraw(trafficChart, chartParams);
          } else {
            trafficChart.update(
              {
                title: {
                  text: setTitle(
                    chartParams.defaultPoint.name,
                    chartParams.directions[chartParams.defaultPoint.id]
                  ),
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
            if (fiveChart) {
              fiveChart = updateSeries(fiveChart, fiveSeries, undefined, false);
              fiveChart.update(
                {
                  title: {
                    text: setTitle(
                      chartParams.defaultPoint.name,
                      undefined,
                      false,
                      true
                    ),
                  },
                  yAxis: {
                    visible: true,
                  },
                },
                false,
                false,
                false
              );
              fiveChart.redraw(true);
            }
          }
          resize(chartParams);
          trafficChart.redraw(true);
          trafficChart.reflow();
          pointMap.pointChange([chartParams.defaultPoint]);
          chartParams.fiveTrend = fiveYearTrend(
            fiveSeries,
            chartParams.hasImports
          );
          lang.dynamicText(chartParams, lang.numberFormat);
          displayPointDescription([chartParams.defaultPoint]);
        });
      } else {
        // user is on trans mountain profile
        $("#traffic-points-btn input[type=checkbox]").on("change", function () {
          const pointId = $(this).val();
          if ($(this).is(":checked")) {
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

          if (chartParams.points.length > 0) {
            [timeSeries, fiveSeries] = addSeriesParams(
              createSeries(trafficData, chartParams),
              chartParams.unitsHolder,
              chartParams.buildFive
            );

            timeSeries.forEach((newS) => {
              trafficChart.addSeries(newS, false, false);
            });

            trafficChart.update({
              title: {
                text: setTitle(chartParams.points, undefined, chartParams.tm),
              },
            });
            pointMap.pointChange(chartParams.points);
          }
          displayPointDescription(chartParams.points);
          lang.dynamicText(chartParams, lang.numberFormat);
        });
      }

      // user selects units
      $("#select-units-radio-traffic input[name='trafficUnits']").click(() => {
        chartParams.unitsHolder.current = $(
          "input:radio[name=trafficUnits]:checked"
        ).val();
        [timeSeries, fiveSeries] = addSeriesParams(
          createSeries(trafficData, chartParams),
          chartParams.unitsHolder,
          chartParams.buildFive
        );
        if (fiveSeries) {
          fiveSeries = createFiveYearSeries(fiveSeries);
        }
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
              series: fiveSeries,
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
        lang.dynamicText(chartParams, lang.numberFormat);
      });

      // update map zoom
      $("#key-point-zoom-btn button").on("click", function () {
        $(".btn-map > .btn").removeClass("active");
        const inOutBtn = $(this);
        inOutBtn.addClass("active");
        const zoomResponse = inOutBtn.val();
        if (zoomResponse === "zoom-in") {
          pointMap.reZoom(true);
        } else {
          pointMap.reZoom(false);
        }
      });
    } catch (err) {
      console.log(err);
    }
  }

  function buildDecision() {
    if (metaData.build) {
      return buildDashboard();
    }
    if (document.getElementById("traffic-section")) {
      visibility(["traffic-section"], "hide");
      console.warn("no traffic data but still tried to build");
    }
    return undefined;
  }
  return buildDecision();
}
