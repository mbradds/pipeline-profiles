// import Highcharts from "highcharts";
// import { cerPalette } from "../modules/util.js";
import { fillBetween } from "../modules/datestone.js";

export async function mainTolls(tollsData, metaData, lang) {
  console.log(tollsData, metaData, lang);

  function buildSeries() {
    const seriesLookup = {};
    tollsData.forEach((path) => {
      let fullPath = [];
      path.data.forEach((partialPath) => {
        let fullTolls = [];
        partialPath.data.forEach((toll) => {
          fullTolls.push.apply(
            fullTolls,
            fillBetween(toll[0], toll[1], toll[2])
          );
        });
        fullPath.push({
          id: `${partialPath.id}-${path.path}`,
          name: partialPath.id,
          data: fullTolls,
        });
      });
      seriesLookup[path.path] = fullPath;
    });
    return seriesLookup;
  }

  function buildDecision() {
    if (metaData.build) {
      const series = buildSeries();
      console.log(series);
    } else {
      console.log("no tolls data");
    }
  }

  buildDecision();
}
