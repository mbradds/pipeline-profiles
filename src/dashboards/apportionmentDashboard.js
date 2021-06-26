/**
 * @file Contains functionality for a simple highcharts combination chart showing monthly oil pipeline apportionment with unit switching.
 *
 * Data pre-processing in ../data_management/apportionment.py configures most of the series parameters, and handles the difference
 * between Enbridge and the other oil lines.
 *
 * Currently used on the following profiles:
 *  - Enbridge mainline
 *  - Keystone
 *  - Trans Mountain
 *  - PKM Cochin
 *  - Enbridge Norman Wells
 */

import Highcharts from "highcharts";

import { cerPalette, visibility, loadChartError } from "../modules/util";

import {
  addSeriesParams,
  addUnitsAndSetup,
  addUnitsDisclaimer,
} from "./dashboardUtil";

export async function mainApportion(apportionData, lang) {
  function buildApportionSeries(seriesWithDate, unitsHolder) {
    const series = addSeriesParams(
      seriesWithDate,
      unitsHolder,
      false,
      lang.series,
      "monthly",
      "apportionment",
      false
    );
    return series[0];
  }

  function tooltipText(event, unit, point = false) {
    const valFormat = (pnt, suffix, isPoint) => {
      if (pnt.series.options.yAxis === 1 || isPoint) {
        return [(pnt.y * 100).toFixed(0), "%"];
      }
      return [lang.numberFormat(pnt.y, 1), suffix];
    };

    let toolText = `<strong>${Highcharts.dateFormat(
      "%b, %Y",
      event.x
    )}</strong>`;
    let toolTable = `<table>`;
    event.points.forEach((p) => {
      const [y, yUnit] = valFormat(p, unit, point);
      const colorCircle = `<span style="color: ${p.color}">&#11044</span>&nbsp;`;
      toolTable += `<tr><th>${colorCircle}${p.series.name}:</th><th>&nbsp;${y} ${yUnit}</th></tr>`;
    });
    toolText += toolTable;
    return toolText;
  }

  function buildTitle(data) {
    let titleText = "";
    if (data.company === "Enbridge Pipelines Inc.") {
      titleText = `${lang.title.enbridge}`;
    } else {
      titleText = `${lang.title.other} ${lang.points[data.keyPoint][0]}`;
    }
    return {
      text: titleText,
      align: "left",
      style: {
        fontWeight: "normal",
      },
    };
  }

  function buildApportionPointCharts(seriesList, chart) {
    const xAxisInfo = chart.xAxis[0];
    const topChart = document.getElementById("apportion-point-panel");
    topChart.innerHTML = `<section class="panel panel-default">
    <header class="panel-heading">
     <h5 class="panel-title">Apportionment at key points</h5>
    </header>
    <div class="panel-body" id="apportion-points">
    </div>
  </section>`;

    const colorList = Object.values(cerPalette);
    seriesList.forEach((pointSeries, i) => {
      const series = pointSeries;
      series.name = lang.enbridgePoints[pointSeries.id];
      series.color = colorList[i];
      const pointDiv = document.createElement("div");
      const divId = `${series.id}-apportion`;
      pointDiv.setAttribute("id", divId);
      document.getElementById("apportion-points").appendChild(pointDiv);

      let timeLabel = false;
      let yOffset = 0;
      if (i === seriesList.length - 1) {
        timeLabel = true;
        yOffset = -10;
        pointDiv.setAttribute("class", "apportion-point-hc-last");
      } else {
        pointDiv.setAttribute("class", "apportion-point-hc");
      }

      Highcharts.chart(divId, {
        chart: {
          type: "column",
          spacingBottom: 0,
          spacingTop: 0,
        },
        plotOptions: {
          column: {
            pointWidth: 13,
          },
          series: {
            stickyTracking: false,
          },
        },
        xAxis: {
          type: "datetime",
          tickLength: 1,
          min: xAxisInfo.dataMin,
          max: xAxisInfo.dataMax,
          labels: {
            enabled: timeLabel,
          },
        },
        legend: {
          layout: "vertical",
          align: "right",
          verticalAlign: "middle",
          width: "20%",
          y: yOffset,
        },
        tooltip: {
          shared: true,
          borderColor: cerPalette["Dim Grey"],
          useHTML: true,
          formatter() {
            return tooltipText(this, "%", true);
          },
        },
        yAxis: {
          min: 0,
          tickAmount: 3,
          // gridLineColor: "transparent",
          // startOnTick: false,
          // endOnTick: false,
          title: {
            text: "",
          },
          labels: {
            formatter() {
              if (!this.isLast && !this.isFirst) {
                return `${lang.numberFormat(this.value * 100, 0)}%`;
              }
              return undefined;
            },
          },
        },
        series: [series],
      });
    });
  }

  function buildApportionChart(series, units, div = "apportion-hc") {
    return new Highcharts.chart(div, {
      chart: {
        zoomType: "x",
        spacingLeft: 0,
        animation: false,
      },
      xAxis: {
        type: "datetime",
        crosshair: true,
      },

      title: buildTitle(apportionData),
      yAxis: [
        {
          title: {
            text: units,
          },
          labels: {
            formatter() {
              return lang.numberFormat(this.value, 0);
            },
          },
          min: 0,
          startOnTick: true,
          endOnTick: false,
          tickPixelInterval: 40,
        },
        {
          title: {
            text: "",
          },
          labels: {
            formatter() {
              return `${(this.value * 100).toFixed(0)}%`;
            },
          },
          min: 0,
          startOnTick: true,
          endOnTick: false,
          tickPixelInterval: 40,
          gridLineColor: "transparent",
          opposite: true,
        },
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
      },
      plotOptions: {
        series: {
          connectNulls: false,
          states: {
            inactive: {
              opacity: 1,
            },
          },
        },
      },
      series,
    });
  }

  function buildDecision() {
    if (apportionData.build) {
      const { unitsHolder } = addUnitsAndSetup(
        "Mb/d",
        { id: undefined },
        lang.units,
        "apportion"
      );

      let series = buildApportionSeries(apportionData.series, unitsHolder);
      const chart = buildApportionChart(series, unitsHolder.current);

      addUnitsDisclaimer(
        "conversion-disclaimer-apportion",
        "oil",
        lang.unitsDisclaimerText
      );

      // TODO: loop through pointSeries and create div + chart for each entry
      if (apportionData.pointSeries.length > 0) {
        try {
          buildApportionPointCharts(apportionData.pointSeries, chart);
        } catch (err) {
          console.log(err);
          loadChartError("apportion-point-panel", lang.dashboardError);
        }
      }

      // user selects units
      document
        .getElementById("select-units-radio-apportion")
        .addEventListener("click", (event) => {
          if (event.target && event.target.value) {
            const radioValue = event.target.value;
            unitsHolder.current = radioValue;
            series = buildApportionSeries(apportionData.series, unitsHolder);
            chart.update({
              series,
              yAxis: [
                {
                  title: {
                    text: unitsHolder.current,
                  },
                },
              ],
              tooltip: {
                formatter() {
                  return tooltipText(this, unitsHolder.current);
                },
              },
            });
          }
        });
    } else if (document.getElementById("apportionment-section")) {
      // handles when profileManager is configured to show section without data
      visibility(["apportionment-section"], "hide");
      // console.warn("no apportionment data, but still tried to build section");
    }
  }
  try {
    return buildDecision();
  } catch (err) {
    console.log(err);
    loadChartError("apportionment-dashboard", lang.dashboardError);
    return false;
  }
}
