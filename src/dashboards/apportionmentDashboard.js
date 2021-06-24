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

  function tooltipText(event, unit) {
    const valFormat = (pnt, suffix) => {
      if (pnt.series.options.yAxis === 1) {
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
      const [y, yUnit] = valFormat(p, unit);
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
      try {
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
      } catch (err) {
        console.log(err);
      }
    } else if (document.getElementById("apportionment-section")) {
      // handles when profileManager is configured to show section without data
      visibility(["apportionment-section"], "hide");
      // console.warn("no apportionment data, but still tried to build section");
    }
  }
  try {
    return buildDecision();
  } catch (err) {
    loadChartError("apportionment-dashboard", lang.dashboardError);
    return false;
  }
}
