import {
  cerPalette,
  conversions,
  visibility,
  sortJsonAlpha,
  arrAvg,
  listOrParagraph,
} from "../modules/util";
import { KeyPointMap } from "../modules/dashboard";

export async function mainTraffic(trafficData, metaData, lang) {
  const rounding = 2;
  function addPointButtons(meta, defaultSelect) {
    const btnGroup = $("#traffic-points-btn");
    if (defaultSelect.id !== "35") {
      meta.points.forEach((point) => {
        const checkTxt = point.id === defaultSelect.id ? " active" : "";
        btnGroup.append(
          `<div class="btn-group btn-point"><button type="button" value="${point.id}" class="btn btn-default${checkTxt}">${point.name}</button></div>`
        );
      });
    } else {
      meta.points.forEach((point, i) => {
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
      point.name = pointName;
      return {
        id: point["Key Point"],
        name: pointName,
      };
    });
    return sortJsonAlpha(pointList, "name");
  }

  function addUnitsAndSetup(defaultUnit, defaultPoint) {
    metaData.commodity = defaultUnit === "Mb/d" ? "oil" : "gas";
    const unitsHolder = {
      base: lang.units[defaultUnit],
      current: lang.units[defaultUnit],
    };

    const radioBtn = (unit, checked, i) => {
      let checkhtml = " ";
      if (checked) {
        checkhtml = 'checked="checked"';
      }
      return `<label for="units${i}" class="radio-inline">
    <input id="units${i}" value="${unit}" type="radio"${checkhtml}name="trafficUnits" />
    ${unit}</label>`;
    };
    let [buildFive, hasImports] = [false, false];
    let secondUnit = "";
    if (defaultUnit === "Bcf/d") {
      secondUnit = "Million m3/d";
      const fiveYearDiv = document.createElement("div");
      fiveYearDiv.setAttribute("id", "traffic-hc-range");
      document.getElementById("traffic-hc-column").appendChild(fiveYearDiv);
      if (defaultPoint.id === "7") {
        // 7 = St. Stephen
        hasImports = true;
      }
      buildFive = true;

      unitsHolder.conversion = conversions["Bcf/d to Million m3/d"];
    } else if (defaultUnit === "Mb/d") {
      secondUnit = "Thousand m3/d";
      unitsHolder.conversion = conversions["Mb/d to Thousand m3/d"];
    }

    let buttonHTML = "";
    [
      [lang.units[defaultUnit], true],
      [lang.units[secondUnit], false],
    ].forEach((unit, i) => {
      buttonHTML += radioBtn(unit[0], unit[1], i);
    });
    document.getElementById("select-units-radio").innerHTML = buttonHTML;
    const tm = defaultPoint.id === "35"; // 35 = Burnaby
    return [unitsHolder, buildFive, hasImports, tm];
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

  const createSeries = (data, defaultPoint, includeList = [], tm) => {
    let firstSeries = [];
    if (tm) {
      let [capAdded, dateAdded] = [false, false];
      const seriesAdded = {};
      const includeKeys = includeList.map((p) => p.id);
      for (const [key, keyData] of Object.entries(
        JSON.parse(JSON.stringify(data))
      )) {
        if (includeKeys.includes(key)) {
          keyData.map((data) => {
            if (data.name == "Capacity" && !capAdded) {
              capAdded = true;
              firstSeries.push(data);
            } else if (data.name == "date" && !dateAdded) {
              firstSeries.push(data);
              dateAdded = true;
            } else if (data.name !== "Capacity" && data.name !== "date") {
              if (
                Object.prototype.hasOwnProperty.call(seriesAdded, data.name)
              ) {
                const newData = data.data;
                seriesAdded[data.name].data = seriesAdded[data.name].data.map(
                  (v, i) => v + newData[i]
                );
              } else {
                seriesAdded[data.name] = {
                  data: data.data,
                  yAxis: data.yAxis,
                  color: data.color,
                  name: data.name,
                };
              }
            }
          });
        }
      }
      for (const [key, value] of Object.entries(seriesAdded)) {
        firstSeries.push(value);
      }
    } else {
      firstSeries = data[defaultPoint.id];
    }
    return firstSeries;
  };

  function createFiveYearSeries(data) {
    const lastYear = new Date(data.lastDate).getFullYear(); // the last year in the dataset
    const firstYear = lastYear - 6; // the first year of the five year average
    delete data.lastDate;
    // the first year in the dataset
    const startYear = new Date(
      parseInt(Object.keys(data)[0], 10)
    ).getFullYear();

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
    for (const [date, value] of Object.entries(data)) {
      const dateInt = new Date(parseInt(date, 10));
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
    }

    for (const [x, value] of Object.entries(months)) {
      fiveYrRange.data.push([
        lang.months[x],
        Math.min(...value),
        Math.max(...value),
      ]);
      fiveYrAvg.data.push([lang.months[x], arrAvg(value)]);
    }
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

  function addSeriesParams(seriesWithDate, unitsHolder, buildFive) {
    const minDate = seriesWithDate[0].min;
    let series = seriesWithDate.slice(1);
    series = sortJsonAlpha(series, "name");

    const isCapacity = (seriesName) => {
      if (
        seriesName === "Capacity" ||
        seriesName === "Import Capacity" ||
        seriesName === "Export Capacity"
      ) {
        return true;
      }
      return false;
    };

    const addRow = (units, frequency, seriesName, buildFiveYr) => {
      const incremendDate = (f) => {
        if (f === "daily") {
          return function (date) {
            return date.setDate(date.getDate() + 1);
          };
        }
        return function (date) {
          return date.setMonth(date.getMonth() + 1);
        };
      };

      const calcRowUnits = (u) => {
        if (u.base !== u.current) {
          return function (row) {
            return row ? row * u.conversion : null;
          };
        }
        return function (row) {
          return row;
        };
      };

      const dateFunction = incremendDate(frequency);
      const rowFunction = calcRowUnits(units);
      if (!isCapacity(seriesName)) {
        if (buildFiveYr) {
          return function (row, startDate, five) {
            const nextDate = dateFunction(startDate);
            if (nextDate in five) {
              five[nextDate] += rowFunction(row);
            } else {
              five[nextDate] = rowFunction(row);
            }
            five.lastDate = nextDate;
            return [[nextDate, rowFunction(row)], five];
          };
        }
        return function (row, startDate, five) {
          const nextDate = dateFunction(startDate);
          return [[nextDate, rowFunction(row)], five];
        };
      }
      return function (row, startDate, five) {
        const nextDate = dateFunction(startDate);
        return [[nextDate, rowFunction(row)], five];
      };
    };

    const fiveYearData = {};
    const newSeries = series.map((s) => {
      const nextSeries = {};
      const startd = new Date(minDate[0], minDate[1], minDate[2]);

      nextSeries.id = s.name;
      for (const [key, value] of Object.entries(s)) {
        if (key !== "data") {
          nextSeries[key] = value;
        }
      }

      const addFunction = addRow(
        unitsHolder,
        metaData.frequency,
        s.name,
        buildFive
      );
      nextSeries.data = s.data.map((row) => {
        const next = addFunction(row, startd, fiveYearData);
        return next[0];
      });

      if (isCapacity(nextSeries.name)) {
        nextSeries.type = "line";
        nextSeries.zIndex = 6;
        nextSeries.lineWidth = 3;
      } else {
        nextSeries.type = "area";
        nextSeries.zIndex = 5;
        nextSeries.lineWidth = 1;
      }
      nextSeries.marker = { enabled: false };
      return nextSeries;
    });

    if (buildFive) {
      return [newSeries, createFiveYearSeries(fiveYearData)];
    }
    return [newSeries, undefined];
  }

  const addToolRow = (p, unit, round, extraStyle = "") => {
    let colorCircle = "";
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
    if (unit !== "%" || p.series.name !== "Total") {
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
      x: 10,
      margin: 5,
      text,
      style: {
        fontWeight: "normal",
      },
    }),
  };

  function createFiveYearChart(series, point, units) {
    return new Highcharts.chart("traffic-hc-range", {
      chart: {
        type: "line",
        marginRight: 0,
        spacingTop: 5,
        spacingBottom: 5,
      },
      title: sharedHcParams.title(setTitle(point.name, undefined, false, true)),
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
        title: { text: units },
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
          return fiveYearTooltipText(this, units);
        },
      },
      plotOptions: sharedHcParams.plotOptions,
      series,
    });
  }

  function buildTrafficChart(series, title, units, div = "traffic-hc") {
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
            text: units,
          },
          min: 0,
          startOnTick: true,
          endOnTick: false,
          tickPixelInterval: 40,
          labels: {
            formatter() {
              return lang.numberFormat(
                this.value,
                metaData.commodity == "oil" ? 0 : 1
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
          return tooltipText(this, units);
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

  const hasImportsRedraw = (chart, btnValue, meta, units) => {
    chart.update(
      {
        title: {
          text: setTitle(btnValue.name, meta.directions[btnValue.id]),
        },
        yAxis: [
          {
            title: {
              text: `Exports (${units})`,
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
              text: `Imports (${units})`,
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

  function resize(buildFive, hasImports) {
    const mainTrafficDiv = document.getElementById("traffic-hc");
    const mainMap = document.getElementById("traffic-map");
    if (buildFive && hasImports) {
      // user is on a gas profile, but there are imports that hide five year avg
      mainTrafficDiv.classList.remove("traffic-hc-shared");
      mainTrafficDiv.classList.add("traffic-hc-single-gas");
      mainMap.classList.add("traffic-map-shared");
      visibility(["traffic-hc-range"], "hide");
    } else if (!buildFive) {
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
        hasImports = true;
      }
    });
    if (returnImports) {
      return [chart, hasImports];
    }
    return chart;
  };

  function getKeyPoint(defaultId) {
    return { id: defaultId, name: lang.points[defaultId][0] };
  }

  function displayPointDescription(points) {
    const pointsText = points.map((p) => {
      p.textCol = lang.points[p.id][1];
      return p;
    });
    document.getElementById(
      "traffic-point-description"
    ).innerHTML = listOrParagraph(pointsText, "textCol");
  }

  function buildDashboard() {
    try {
      let defaultPoint = getKeyPoint(metaData.defaultPoint);
      // TODO: add buildFive, hasImports, and tm into a "chartConfig" object
      let [unitsHolder, buildFive, hasImports, tm] = addUnitsAndSetup(
        metaData.units,
        defaultPoint
      );

      resize(buildFive, hasImports);
      metaData.points = getPointList(metaData);
      if (defaultPoint.id !== "0") {
        // 0 = system
        if (metaData.points.length === 1) {
          // eg, Keystone
          ["traffic-points-btn", "key-point-title"].map((hideDiv) => {
            document.getElementById(hideDiv).style.display = "none";
          });
        } else {
          addPointButtons(metaData, defaultPoint);
        }

        var pointMap = new KeyPointMap({
          points: metaData.keyPoints,
          selected: !tm ? [defaultPoint] : metaData.points,
          companyName: metaData.companyName,
        });
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
        createSeries(trafficData, defaultPoint, metaData.points, tm),
        unitsHolder,
        buildFive
      );

      let trafficChart = buildTrafficChart(
        timeSeries,
        !tm
          ? setTitle(defaultPoint.name, metaData.directions[defaultPoint.id])
          : setTitle(metaData.points, undefined, tm),
        unitsHolder.current
      );

      // only m&np should meet this criteria on load
      if (hasImports) {
        hasImportsRedraw(
          trafficChart,
          defaultPoint,
          metaData,
          unitsHolder.current
        );
        trafficChart.redraw(true);
      } else if (buildFive && !hasImports) {
        // user is on gas profile that isnt m&np
        var fiveChart = createFiveYearChart(
          fiveSeries,
          defaultPoint,
          unitsHolder.current
        );
      } else {
        // user is on oil profile
        var fiveChart = false;
      }
      metaData.fiveTrend = fiveYearTrend(fiveSeries, hasImports);
      lang.dynamicText(
        metaData,
        defaultPoint,
        unitsHolder,
        tm,
        lang.numberFormat
      );
      if (!tm) {
        displayPointDescription([defaultPoint]);
      } else {
        displayPointDescription(metaData.points);
      }

      // user selects key point
      if (!tm) {
        $("#traffic-points-btn button").on("click", function () {
          $(".btn-point > .btn").removeClass("active");
          const keyBtn = $(this).addClass("active");
          hasImports = false;
          defaultPoint = getKeyPoint(keyBtn.val());
          [timeSeries, fiveSeries] = addSeriesParams(
            trafficData[defaultPoint.id],
            unitsHolder,
            buildFive
          );

          [trafficChart, hasImports] = updateSeries(
            trafficChart,
            timeSeries,
            hasImports,
            true
          );

          if (hasImports) {
            hasImportsRedraw(
              trafficChart,
              defaultPoint,
              metaData,
              unitsHolder.current
            );
          } else {
            trafficChart.update(
              {
                title: {
                  text: setTitle(
                    defaultPoint.name,
                    metaData.directions[defaultPoint.id]
                  ),
                },
                yAxis: [
                  {
                    height: "100%",
                    max: undefined,
                    title: {
                      text: unitsHolder.current,
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
                    text: setTitle(defaultPoint.name, undefined, false, true),
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
          resize(buildFive, hasImports);
          trafficChart.redraw(true);
          trafficChart.reflow();
          pointMap.pointChange([defaultPoint]);
          metaData.fiveTrend = fiveYearTrend(fiveSeries, hasImports);
          lang.dynamicText(
            metaData,
            defaultPoint,
            unitsHolder,
            tm,
            lang.numberFormat
          );
          displayPointDescription([defaultPoint]);
        });
      } else {
        // user is on trans mountain profile
        $("#traffic-points-btn input[type=checkbox]").on("change", function () {
          const pointId = $(this).val();
          if ($(this).is(":checked")) {
            metaData.points.push({
              id: pointId,
              name: lang.points[pointId][0],
            });
          } else {
            metaData.points = metaData.points.filter(
              (point) => point.id !== pointId
            );
          }

          while (trafficChart.series.length) {
            trafficChart.series[0].remove(false, false, false);
          }

          if (metaData.points.length > 0) {
            [timeSeries, fiveSeries] = addSeriesParams(
              createSeries(trafficData, defaultPoint, metaData.points, tm),
              unitsHolder,
              buildFive
            );

            timeSeries.map((newS) => {
              trafficChart.addSeries(newS, false, false);
            });

            trafficChart.update({
              title: {
                text: setTitle(metaData.points, undefined, tm),
              },
            });
            pointMap.pointChange(metaData.points);
          }
          displayPointDescription(metaData.points);
          lang.dynamicText(
            metaData,
            defaultPoint,
            unitsHolder,
            tm,
            lang.numberFormat
          );
        });
      }

      // user selects units
      $("#select-units-radio input[name='trafficUnits']").click(() => {
        unitsHolder.current = $("input:radio[name=trafficUnits]:checked").val();
        [timeSeries, fiveSeries] = addSeriesParams(
          createSeries(trafficData, defaultPoint, metaData.points, tm),
          unitsHolder,
          buildFive
        );
        trafficChart.update(
          {
            series: timeSeries,
            yAxis: [
              {
                title: { text: unitsHolder.current },
              },
            ],
            tooltip: {
              formatter() {
                return tooltipText(this, unitsHolder.current);
              },
            },
          },
          true,
          false,
          false
        );
        if (hasImports) {
          hasImportsRedraw(
            trafficChart,
            defaultPoint,
            metaData,
            unitsHolder.current
          );
          trafficChart.redraw(false);
        }
        if (fiveChart) {
          fiveChart.update(
            {
              series: fiveSeries,
              tooltip: {
                formatter() {
                  return fiveYearTooltipText(this, unitsHolder.current);
                },
              },
              yAxis: {
                title: { text: unitsHolder.current },
              },
            },
            true,
            false,
            false
          );
        }
        lang.dynamicText(
          metaData,
          defaultPoint,
          unitsHolder,
          tm,
          lang.numberFormat
        );
      });

      // update map zoom
      $("#key-point-zoom-btn button").on("click", function () {
        $(".btn-map > .btn").removeClass("active");
        const inOutBtn = $(this);
        inOutBtn.addClass("active");
        const zoomResponse = inOutBtn.val();
        if (zoomResponse == "zoom-in") {
          pointMap.reZoom(true);
        } else {
          pointMap.reZoom(false);
        }
      });
    } catch (err) {
      console.log(err);
    }
  }

  function buildDecision(trafficData) {
    if (trafficData && Object.keys(trafficData).length === 0) {
      document.getElementById("traffic-section").style.display = "none";
    } else {
      return buildDashboard();
    }
  }
  return buildDecision(trafficData);
}

// export { mainTraffic as default };
