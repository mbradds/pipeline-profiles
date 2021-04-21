import {
  cerPalette,
  conversions,
  visibility,
  arrAvg,
  addSeriesParams,
  addUnitsAndSetup,
} from "../modules/util";

export async function mainApportion(apportionData, lang) {
  function buildApportionSeries(seriesWithDate, unitsHolder) {
    const series = addSeriesParams(
      seriesWithDate,
      unitsHolder,
      false,
      "monthly",
      "apportionment"
    );
    return series[0];
  }

  function buildApportionChart(series, title, units, div = "apportion-hc") {
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
      title: {
        text: title,
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
        },
        { visible: false },
      ],
      tooltip: {
        shared: true,
        borderColor: cerPalette["Dim Grey"],
        useHTML: true,
      },
      legend: {
        alignColumns: false,
        margin: 0,
        symbolPadding: 2,
      },
      series,
    });
  }

  function buildDecision() {
    if (apportionData.build) {
      try {
        const {
          unitsHolder,
          buildFive,
          hasImports,
          tm,
          commodity,
        } = addUnitsAndSetup(
          "Mb/d",
          { id: undefined },
          lang.units,
          "apportion"
        );
        const series = buildApportionSeries(apportionData.series, unitsHolder);
        const chart = buildApportionChart(series, "", unitsHolder.current);
      } catch (err) {
        console.log(err);
      }
    } else {
      visibility(["apportionment-section"], "hide");
    }
  }
  return buildDecision();
}
