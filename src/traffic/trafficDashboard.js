import { cerPalette, conversions, visibility } from "../modules/util.js";
import { KeyPointMap } from "../modules/dashboard.js";

export async function mainTraffic(trafficData, metaData, lang) {
  const rounding = 2;
  function addPointButtons(metaData, defaultSelect) {
    let btnGroup = $("#traffic-points-btn");
    if (defaultSelect !== "Burnaby") {
      metaData.points.map((point) => {
        if (point == defaultSelect) {
          var checkTxt = " active";
        } else {
          var checkTxt = "";
        }
        btnGroup.append(
          `<div class="btn-group btn-point"><button type="button" value="${point}" class="btn btn-default${checkTxt}">${point}</button></div>`
        );
      });
    } else {
      metaData.points.map((point, i) => {
        btnGroup.append(
          `<div class="checkbox-inline">
          <label for="inlineCheck${i}" label><input id="inlineCheck${i}" checked="checked" type="checkbox" value="${point}">${point}</label>
       </div>`
        );
      });
    }
  }

  function addUnitsAndSetup(defaultUnit, defaultPoint) {
    var buttonHTML = "";
    const unitsHolder = { base: defaultUnit, current: defaultUnit };
    var tm = defaultPoint == "Burnaby" ? true : false;

    const radioBtn = (unit, checked, i) => {
      if (checked) {
        var checkhtml = 'checked="checked"';
      } else {
        var checkhtml = " ";
      }
      return `<label for="units${i}" class="radio-inline">
    <input id="units${i}" value="${unit}" type="radio"${checkhtml}name="trafficUnits" />
    ${unit}</label>`;
    };
    var [buildFive, hasImports] = [false, false];
    if (defaultUnit == "Bcf/d") {
      var secondUnit = "Million m3/d";
      const fiveYearDiv = document.createElement("div");
      fiveYearDiv.setAttribute("id", "traffic-hc-range");
      document.getElementById("traffic-hc-column").appendChild(fiveYearDiv);
      if (defaultPoint == "St. Stephen") {
        hasImports = true;
      }
      buildFive = true;

      unitsHolder["conversion"] = conversions["Bcf/d to Million m3/d"];
    } else if (defaultUnit == "Mb/d") {
      var secondUnit = "Thousand m3/d";
      unitsHolder["conversion"] = conversions["Mb/d to Thousand m3/d"];
    }

    [
      [defaultUnit, true],
      [secondUnit, false],
    ].map((unit, i) => {
      buttonHTML += radioBtn(unit[0], unit[1], i);
    });
    document.getElementById("select-units-radio").innerHTML = buttonHTML;

    return [unitsHolder, buildFive, hasImports, tm];
  }

  const setTitle = (point, tradeType, tm = false, fiveYear = false) => {
    if (!tm) {
      if (!fiveYear) {
        return `${point} - monthly ${tradeType[1]} traffic (Direction of flow: ${tradeType[0]})`;
      } else {
        return `${point} - Five year average & range`;
      }
    } else {
      return `${point.join("-")} monthly traffic`;
    }
  };

  const createSeries = (trafficData, defaultPoint, includeList = []) => {
    var firstSeries = [];
    if (defaultPoint == "Burnaby") {
      var [capAdded, dateAdded] = [false, false];
      for (const [key, keyData] of Object.entries(
        JSON.parse(JSON.stringify(trafficData))
      )) {
        if (includeList.includes(key)) {
          // todo: clean up tm data in python. Only one date should be shipped
          keyData.map((data) => {
            if (data.name == "Capacity" && !capAdded) {
              capAdded = true;
              firstSeries.push(data);
            } else if (data.name == "date" && !dateAdded) {
              firstSeries.push(data);
              dateAdded = true;
            } else if (data.name !== "Capacity" && data.name !== "date") {
              data.name = data.name + "-" + key;
              firstSeries.push(data);
            }
          });
        }
      }
    } else {
      firstSeries = trafficData[defaultPoint];
    }
    return firstSeries;
  };

  function createFiveYearSeries(data) {
    var lastYear = new Date(data["lastDate"]).getFullYear();
    var firstYear = lastYear - 6;
    delete data["lastDate"];
    const months = {};
    const lastYrSeries = {
      data: [],
      type: "line",
      zIndex: 5,
      name: `${lastYear} throughput (last year of data)`,
      color: cerPalette["hcRed"],
    };
    for (const [date, value] of Object.entries(data)) {
      let dateInt = new Date(parseInt(date, 10));
      let [month, year] = [dateInt.getMonth() + 1, dateInt.getFullYear()];
      if (year == lastYear) {
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
    const fiveYrRange = {
      data: [],
      name: `Five Year Range (${firstYear + 1}-${lastYear - 1})`,
      type: "arearange",
      zIndex: 3,
      marker: {
        enabled: false,
      },
      color: cerPalette["Ocean"],
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
    const arrAvg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
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

  function addSeriesParams(series, unitsHolder, buildFive) {
    function compareStrings(a, b) {
      return a < b ? -1 : a > b ? 1 : 0;
    }
    let minDate = series[0].min;
    series = series.slice(1);

    series.sort(function (a, b) {
      return compareStrings(a.name, b.name);
    });

    const isCapacity = (seriesName) => {
      if (
        seriesName == "Capacity" ||
        seriesName == "Import Capacity" ||
        seriesName == "Export Capacity"
      ) {
        return true;
      } else {
        return false;
      }
    };

    const addRow = (unitsHolder, frequency, seriesName, buildFive) => {
      const incremendDate = (frequency) => {
        if (frequency == "daily") {
          return function (date) {
            return date.setDate(date.getDate() + 1);
          };
        } else {
          return function (date) {
            return date.setMonth(date.getMonth() + 1);
          };
        }
      };

      const calcRowUnits = (unitsHolder) => {
        if (unitsHolder.base !== unitsHolder.current) {
          return function (row) {
            return row ? row * unitsHolder.conversion : null;
          };
        } else {
          return function (row) {
            return row;
          };
        }
      };

      var dateFunction = incremendDate(frequency);
      var rowFunction = calcRowUnits(unitsHolder);
      if (!isCapacity(seriesName)) {
        if (buildFive) {
          return function (row, startDate, five) {
            var nextDate = dateFunction(startDate);
            if (nextDate in five) {
              five[nextDate] += rowFunction(row);
            } else {
              five[nextDate] = rowFunction(row);
            }
            five["lastDate"] = nextDate;
            return [[nextDate, rowFunction(row)], five];
          };
        } else {
          return function (row, startDate, five) {
            var nextDate = dateFunction(startDate);
            return [[nextDate, rowFunction(row)], five];
          };
        }
      } else {
        return function (row, startDate, five) {
          var nextDate = dateFunction(startDate);
          return [[nextDate, rowFunction(row)], five];
        };
      }
    };

    const nextSeries = JSON.parse(JSON.stringify(series));
    let newSeries = [];
    const fiveYearData = {};
    nextSeries.map((s) => {
      let startd = new Date(minDate[0], minDate[1], minDate[2]);
      s.id = s.name;
      var addFunction = addRow(
        unitsHolder,
        metaData.frequency,
        s.name,
        buildFive
      );
      s.data = s.data.map((row) => {
        var next = addFunction(row, startd, fiveYearData);
        return next[0];
      });

      if (isCapacity(s.name)) {
        s.type = "line";
        s.zIndex = 6;
        s.lineWidth = 3;
      } else {
        s.type = "area";
        s.zIndex = 5;
        s.lineWidth = 1;
      }
      s.marker = { enabled: false };
      newSeries.push(s);
    });
    if (buildFive) {
      return [newSeries, createFiveYearSeries(fiveYearData)];
    } else {
      return [newSeries, undefined];
    }
  }

  function getPointList(keyPoints) {
    var pointList = [];
    keyPoints.map((point) => {
      pointList.push(point["Key Point"]);
    });
    return pointList.sort();
  }

  const addToolRow = (p, unit, rounding, extraStyle = "") => {
    const yVal = (p) => {
      if (p.point.hasOwnProperty("low") && p.point.hasOwnProperty("high")) {
        return (p) => {
          return `${lang.numberFormat(p.point.low)} - ${lang.numberFormat(
            p.point.high
          )}`;
        };
      } else {
        return (p) => {
          return `${lang.numberFormat(p.y, rounding)}`;
        };
      }
    };

    var yFunction = yVal(p);
    return `<tr style="${extraStyle}"><th style="color:${p.color}">${
      p.series.name
    }:</th><th>&nbsp${yFunction(p)} ${unit}</th></tr>`;
  };

  function tooltipText(event, units) {
    const addTable = (section) => {
      let toolText = `<table class="mrgn-tp-sm">`;
      let total = 0;
      section.traffic.map((row) => {
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
      if (section.hasOwnProperty("capacity")) {
        toolText += section.capacity[0];
        toolText += addToolRow(
          {
            color: cerPalette["Cool Grey"],
            series: { name: "Utilization" },
            y: (total / section.capacity[1]) * 100,
            point: {},
          },
          "%",
          0,
          "border-top: 1px solid grey"
        );
      }

      toolText += `</table>`;
      return toolText;
    };

    var textHolder = {
      imports: { traffic: [], capacity: 0 },
      other: { traffic: [] },
    };
    var hasImports = false;
    event.points.map((p) => {
      if (p.series.name == "import") {
        hasImports = true;
        textHolder.imports.traffic.push([addToolRow(p, units, rounding), p.y]);
      } else if (p.series.name == "Import Capacity") {
        textHolder.imports.capacity = [addToolRow(p, units, rounding), p.y];
      } else if (
        p.series.name == "Capacity" ||
        p.series.name == "Export Capacity"
      ) {
        textHolder.other.capacity = [addToolRow(p, units, rounding), p.y];
      } else {
        textHolder.other.traffic.push([addToolRow(p, units, rounding), p.y]);
      }
    });

    // tooltip header
    if (metaData.frequency == "monthly") {
      var toolText = `<strong>${Highcharts.dateFormat(
        "%b, %Y",
        event.x
      )}</strong>`;
    } else {
      //remove this when frequency is decided!
      var toolText = `<strong>${Highcharts.dateFormat(
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
    var toolText = `<strong>${lang.months[event.x + 1]}</strong><table>`;
    event.points.map((p) => {
      toolText += addToolRow(p, units, rounding);
    });
    toolText += "</table>";
    return toolText;
  }

  const sharedHcParams = {
    legend: { alignColumns: false, margin: 0, symbolPadding: 2 },
    plotOptions: {
      area: {
        stacking: "normal",
      },
      series: {
        connectNulls: true,
        states: {
          inactive: {
            opacity: 1,
          },
        },
      },
    },
    title: (text) => {
      return {
        align: "left",
        x: 10,
        margin: 5,
        text: text,
        style: {
          fontSize: "16px",
          fontWeight: "bold",
        },
      };
    },
  };

  function createFiveYearChart(series, point, units) {
    return new Highcharts.chart("traffic-hc-range", {
      chart: {
        type: "line",
        marginRight: 0,
        spacingTop: 5,
        spacingBottom: 10,
      },
      title: sharedHcParams.title(setTitle(point, undefined, false, true)),
      xAxis: {
        crosshair: true,
        tickInterval: 1,
        labels: {
          step: 1,
          formatter: function () {
            return lang.months[this.value + 1];
          },
        },
      },
      legend: sharedHcParams.legend,
      yAxis: {
        startOnTick: true,
        endOnTick: false,
        title: { text: units },
      },
      tooltip: sharedHcParams.tooltip,
      tooltip: {
        shared: true,
        backgroundColor: "white",
        borderColor: cerPalette["Dim Grey"],
        useHTML: true,
        formatter: function () {
          return fiveYearTooltipText(this, units);
        },
      },
      plotOptions: sharedHcParams.plotOptions,
      series: series,
    });
  }

  function buildTrafficChart(series, title, units, div = "traffic-hc") {
    return new Highcharts.chart(div, {
      chart: {
        zoomType: "x",
        marginRight: 0,
        animation: false,
        spacingBottom: 0,
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
        },
        { visible: false },
      ],
      tooltip: {
        shared: true,
        backgroundColor: "white",
        borderColor: cerPalette["Dim Grey"],
        useHTML: true,
        formatter: function () {
          return tooltipText(this, units);
        },
      },
      legend: sharedHcParams.legend,
      plotOptions: sharedHcParams.plotOptions,
      series: series,
    });
  }

  const hasImportsRedraw = (chart, btnValue, metaData, units) => {
    chart.update(
      {
        title: {
          text: setTitle(btnValue, metaData.directions[btnValue]),
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
    var maxY = Math.max(chart.yAxis[0].max, chart.yAxis[1].max);
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
    var mainTraffic = document.getElementById("traffic-hc");
    var mainMap = document.getElementById("traffic-map");
    if (buildFive && hasImports) {
      // user is on a gas profile, but there are imports that hide five year avg
      mainTraffic.classList.remove("traffic-hc-shared");
      mainTraffic.classList.add("traffic-hc-single-gas");
      mainMap.classList.add("traffic-map-shared");
      visibility(["traffic-hc-range"], "hide");
    } else if (!buildFive) {
      mainTraffic.classList.add("traffic-hc-single");
      mainMap.classList.add("traffic-map-single");
    } else {
      visibility(["traffic-hc-range"], "show");
      mainTraffic.classList.add("traffic-hc-shared");
      mainMap.classList.add("traffic-map-shared");
      mainTraffic.classList.remove("traffic-hc-single-gas");
    }
  }

  function buildDashboard() {
    try {
      var defaultPoint = metaData.defaultPoint;
      var [unitsHolder, buildFive, hasImports, tm] = addUnitsAndSetup(
        metaData.units,
        defaultPoint
      );
      resize(buildFive, hasImports);
      metaData.points = getPointList(metaData.keyPoints);
      if (defaultPoint !== "system") {
        if (metaData.points.length == 1) {
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
        var element = document.getElementById("traffic-hc-column");
        element.className = element.className.replace("col-md-8", "col-md-12");
      }

      const [timeSeries, fiveSeries] = addSeriesParams(
        createSeries(trafficData, defaultPoint, metaData.points),
        unitsHolder,
        buildFive
      );

      const trafficChart = buildTrafficChart(
        timeSeries,
        !tm
          ? setTitle(defaultPoint, metaData.directions[defaultPoint])
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
      lang.dynamicText(
        metaData,
        defaultPoint,
        unitsHolder,
        tm,
        lang.numberFormat
      );

      // user selects key point
      if (!tm) {
        $("#traffic-points-btn button").on("click", function () {
          $(".btn-point > .btn").removeClass("active");
          var keyBtn = $(this).addClass("active");
          hasImports = false;
          defaultPoint = keyBtn.val();
          const [newSeries, newFiveSeries] = addSeriesParams(
            trafficData[defaultPoint],
            unitsHolder,
            buildFive
          );

          var currentIds = trafficChart.series.map((s) => {
            return s.userOptions.id;
          });

          var newIds = newSeries.map((s) => {
            return s.id;
          });

          currentIds.map((id) => {
            if (!newIds.includes(id)) {
              trafficChart.get(id).remove(false);
            }
          });

          newSeries.map((newS) => {
            if (currentIds.includes(newS.id)) {
              trafficChart.get(newS.id).setData(newS.data, false, false, false);
            } else {
              trafficChart.addSeries(newS, false, true);
            }
            if (newS.name == "import") {
              hasImports = true;
            }
          });

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
                    defaultPoint,
                    metaData.directions[defaultPoint]
                  ),
                },
                yAxis: [
                  {
                    title: {
                      text: unitsHolder.current,
                    },
                    height: "100%",
                    max: undefined,
                  },
                  { visible: false },
                ],
              },
              false
            );
            if (fiveChart) {
              fiveChart.update({
                series: newFiveSeries,
                title: {
                  text: setTitle(defaultPoint, undefined, false, true),
                },
              });
            }
          }
          resize(buildFive, hasImports);
          trafficChart.redraw(true);
          trafficChart.reflow();
          pointMap.pointChange([defaultPoint]);
          lang.dynamicText(
            metaData,
            defaultPoint,
            unitsHolder,
            tm,
            lang.numberFormat
          );
        });
      } else {
        $("#traffic-points-btn input[type=checkbox]").on("change", function () {
          if ($(this).is(":checked")) {
            metaData.points.push($(this).val());
          } else {
            metaData.points = metaData.points.filter(
              (point) => point !== $(this).val()
            );
          }

          while (trafficChart.series.length) {
            trafficChart.series[0].remove(false, false, false);
          }

          if (metaData.points.length > 0) {
            const [newSeries, newFiveSeries] = addSeriesParams(
              createSeries(trafficData, defaultPoint, metaData.points),
              unitsHolder,
              buildFive
            );

            newSeries.map((newS) => {
              trafficChart.addSeries(newS, false, false);
            });

            trafficChart.update(
              {
                title: {
                  text: setTitle(metaData.points, undefined, tm),
                },
              },
              false
            );
            trafficChart.redraw(true);
            pointMap.pointChange(metaData.points);
          }
        });
      }

      //user selects units
      $("#select-units-radio input[name='trafficUnits']").click(function () {
        unitsHolder.current = $("input:radio[name=trafficUnits]:checked").val();
        var [newTimeSeries, newFiveSeries] = addSeriesParams(
          createSeries(trafficData, defaultPoint, metaData.points),
          unitsHolder,
          buildFive
        );
        trafficChart.update(
          {
            series: newTimeSeries,
            yAxis: [
              {
                title: { text: unitsHolder.current },
              },
            ],
            tooltip: {
              formatter: function () {
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
              series: newFiveSeries,
              tooltip: {
                formatter: function () {
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
        var inOutBtn = $(this);
        inOutBtn.addClass("active");
        var zoomResponse = inOutBtn.val();
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