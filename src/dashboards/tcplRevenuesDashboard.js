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
    data: series[seriesName],
  }));
}

function seriesifyRevenue(data) {
  const [itSeries, stSeries] = [
    { name: "IT", data: [] },
    { name: "STFT", data: [] },
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
      text: "Total Contracted Quantity",
    },
    xAxis: { type: "datetime" },
    legend: {
      align: "left",
      verticalAlign: "middle",
      width: 250,
    },
    yAxis: {
      title: { text: "Gigajoules per month" },
    },
    plotOptions: {
      column: {
        stacking: "normal",
      },
    },
    series,
  });
}

export async function mainTcplRevenues(data) {
  // console.log(data);
  const itSeries = seriesifyQuantity(data.itQuantity);
  const [itRevenueSeries, stRevenueSeries] = seriesifyRevenue(data.discRevenue);
  console.log(itRevenueSeries);
  quantityChart("tcpl-quantity-chart", itSeries);
  quantityChart("tcpl-revenue-chart", [itRevenueSeries]);
}
