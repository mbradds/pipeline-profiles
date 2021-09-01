import Highcharts from "highcharts";
import { cerPalette } from "../modules/util.js";
import { fillBetween } from "../modules/datestone.js";

export async function mainTolls(tollsData, metaData, lang) {
  console.log(tollsData, metaData, lang);

  function buildSeries() {
    const seriesLookup = {};
    tollsData.forEach((path) => {
      let fullPath = [];
      path.series.forEach((partialPath) => {
        let fullTolls = [];
        partialPath.data.forEach((toll) => {
          fullTolls.push.apply(
            fullTolls,
            fillBetween(toll[0], toll[1], toll[2])
          );
        });
        fullPath.push({
          id: `${partialPath.id}-${path.pathName}`,
          name: partialPath.id,
          data: fullTolls,
        });
      });
      seriesLookup[path.pathName] = fullPath;
    });
    return seriesLookup;
  }

  function buildTollsChart(series, div = "tolls-chart") {
    return new Highcharts.chart(div, {
      chart: {
        zoomType: "x",
        animation: false,
      },
      title: "",
      xAxis: {
        type: "datetime",
        crosshair: true,
      },
      tooltip: {
        shared: true,
        shadow: false,
        useHTML: true,
        animation: true,
        borderColor: cerPalette["Dim Grey"],
      },
      series,
    });
  }

  function buildDecision() {
    if (metaData.build) {
      const series = buildSeries();
      const chart = buildTollsChart(series[metaData.paths[1]]);
      console.log(chart);
    } else {
      console.log("no tolls data");
    }
  }

  try {
    buildDecision();
  } catch (err) {
    console.log(err);
  }
}
