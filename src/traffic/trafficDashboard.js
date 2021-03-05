import { profileAssist as pa } from "../modules/util.js";

export async function mainTraffic(trafficData, metaData, lang) {
  function buildDashboard() {
    const defaultPoint = "Upstream of James River";
    console.log(trafficData[defaultPoint]);

    const trafficChart = (series) => {
      return new Highcharts.chart("traffic-hc", {
        chart: {
          zoomType: "x",
        },
        title: {
          text: "Throughput and Capactiy",
        },
        xAxis: {
          type: "datetime",
          crosshair: true,
        },
        tooltip: {
          shared: true,
        },
        plotOptions: {
          series: {
            turboThreshold: 1000,
          },
        },
        series: series,
      });
    };

    trafficChart(trafficData[defaultPoint]);
  }

  return buildDashboard();
}
