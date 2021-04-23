import {
  cerPalette,
  visibility,
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
      const colorCircle = `<span style="color: ${p.color}">&#11044</span>&nbsp`;
      toolTable += `<tr><th>${colorCircle}${p.series.name}:</th><th>&nbsp${y} ${yUnit}</th></tr>`;
    });
    toolText += toolTable;
    return toolText;
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
        const chart = buildApportionChart(series, "", unitsHolder.current);
        // user selects units
        $("#select-units-radio-apportion input[name='apportionUnits']").click(
          () => {
            unitsHolder.current = $(
              "input:radio[name=apportionUnits]:checked"
            ).val();
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
        );
      } catch (err) {
        console.log(err);
      }
    }
  }
  return buildDecision();
}
