import Highcharts from "highcharts";

function seriesifyQuantity(data) {
  const series = {};
  data.forEach((element) => {
    if (series[element.p]) {
      series[element.p].push({ x: new Date(element.d), y: element.v });
    } else {
      series[element.p] = [{ x: new Date(element.d), y: element.v }];
    }
  });

  return Object.keys(series).map((seriesName) => ({
    name: seriesName,
    yAxis: 0,
    data: series[seriesName],
  }));
}

function seriesifyRevenue(data) {
  const [itSeries, stSeries] = [
    { name: "IT", data: [], yAxis: 1, showInLegend: false, color: "black" },
    { name: "STFT", data: [], yAxis: 1, showInLegend: false, color: "black" },
  ];
  data.forEach((element) => {
    if (element.p === "IT") {
      itSeries.data.push({ x: new Date(element.d), y: element.v });
    } else if (element.p === "STFT") {
      stSeries.data.push({ x: new Date(element.d), y: element.v });
    }
  });
  return [itSeries, stSeries];
}

function toolTipRevenues(event, lang) {
  let toolText = `<b>${lang.dateFormat(event.x)}</b>`;
  toolText += '<table class="mrgn-tp-sm">';
  toolText += `<tr><td>${
    event.series.name
  }:&nbsp;</td><td><b>${lang.numberFormat(event.y, 0)}</b></td></tr>`;
  if (event.y < event.total) {
    toolText += `<tr><td>Total:&nbsp;</td><td><b>${lang.numberFormat(
      event.total,
      0
    )}</b></td></tr>`;
  }

  toolText += "</table>";
  return toolText;
}

function quantityChart(id, series, lang) {
  return Highcharts.chart(id, {
    chart: {
      type: "column",
    },
    title: {
      text: "",
    },
    xAxis: { type: "datetime" },
    legend: {
      // enabled: false, // set for small screens
      align: "right",
      verticalAlign: "middle",
      width: 250,
    },
    yAxis: [
      {
        title: { text: "Gigajoules per month" },
        height: "45%",
      },
      {
        title: { text: "Revenue ($000s)" },
        top: "50%",
        height: "45%",
        offset: 0,
      },
    ],
    plotOptions: {
      column: {
        stacking: "normal",
      },
    },
    tooltip: {
      shadow: false,
      useHTML: true,
      animation: true,
      formatter() {
        return toolTipRevenues(this, lang);
      },
    },
    series,
  });
}

function removeAllSeries(chart) {
  while (chart.series.length) {
    chart.series[0].remove(false, false, false);
  }
}

function switchChartListener(chart, itSeries, stSeries) {
  document
    .getElementById("tcpl-revenues-split-btn")
    .addEventListener("click", (event) => {
      if (event.target) {
        removeAllSeries(chart);
        if (event.target.value === "IT") {
          itSeries.forEach((newS) => {
            chart.addSeries(newS, false, false);
          });
        } else if (event.target.value === "STFT") {
          stSeries.forEach((newS) => {
            chart.addSeries(newS, false, false);
          });
        }
        // chart.update({
        //   legend: {
        //     title: {
        //       text: "Path",
        //     },
        //   },
        // });
        chart.redraw(true);
      }
    });
}

export async function mainTcplRevenues(data, lang) {
  const itSeries = seriesifyQuantity(data.itQuantity);
  const stSeries = seriesifyQuantity(data.stQuantity);
  const [itRevenueSeries, stRevenueSeries] = seriesifyRevenue(data.discRevenue);
  itSeries.push(itRevenueSeries);
  stSeries.push(stRevenueSeries);
  const chart = quantityChart("tcpl-revenues-chart", itSeries, lang);
  switchChartListener(chart, itSeries, stSeries);
}
