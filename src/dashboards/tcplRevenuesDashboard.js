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
    { name: "IT", data: [], yAxis: 1, showInLegend: false },
    { name: "STFT", data: [], yAxis: 1, showInLegend: false },
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

function quantityChart(id, series) {
  return Highcharts.chart(id, {
    chart: {
      type: "column",
    },
    title: {
      text: "",
    },
    xAxis: { type: "datetime" },
    legend: {
      align: "right",
      verticalAlign: "middle",
      width: 250,
    },
    yAxis: [
      {
        title: { text: "Gigajoules per month" },
        height: "45%",
      },
      { title: { text: "CAD" }, top: "50%", height: "45%", offset: 0 },
    ],
    plotOptions: {
      column: {
        stacking: "normal",
      },
    },
    series,
  });
}

export async function mainTcplRevenues(data) {
  const itSeries = seriesifyQuantity(data.itQuantity);
  const stSeries = seriesifyQuantity(data.itQuantity);
  const [itRevenueSeries, stRevenueSeries] = seriesifyRevenue(data.discRevenue);
  itSeries.push(itRevenueSeries);
  stSeries.push(stRevenueSeries);
  quantityChart("tcpl-quantity-chart", itSeries);
}
