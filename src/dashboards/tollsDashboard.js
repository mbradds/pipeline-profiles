import Highcharts from "highcharts";
import { cerPalette } from "../modules/util.js";
import { fillBetween } from "../modules/datestone.js";

export async function mainTolls(tollsData, metaData, lang) {
  // console.log(tollsData, metaData, lang);

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

  function addPathButtons(points) {
    const btnGroup = document.getElementById("tolls-path-btn");
    let selectedPaths = [];
    points.forEach((point, i) => {
      let checked = "";
      if (point[1]) {
        checked = `checked="checked"`;
        selectedPaths.push(point);
      }
      btnGroup.insertAdjacentHTML(
        "beforeend",
        `<div class="checkbox-inline"><label for="inlineCheck${i}" label><input id="inlineCheck${i}" ${checked} type="checkbox" value="${point[0]}">${point[0]}</label></div>`
      );
    });
    return [btnGroup, selectedPaths];
  }

  function selectedSeries(series, paths) {
    let selected = [];
    paths.forEach((path) => {
      if (path[1]) {
        selected.push.apply(selected, series[path[0]]);
      }
    });
    return selected;
  }

  function buildDashboard() {
    let [pathBtns, selectedPaths] = addPathButtons(metaData.paths);
    const series = buildSeries();
    const chart = buildTollsChart(selectedSeries(series, metaData.paths));
    pathBtns.addEventListener("click", (event) => {
      if (event.target && event.target.tagName === "INPUT") {
        const pathId = event.target.value;
        if (event.target.checked) {
          selectedPaths.push([pathId, true]);
          // add series by id if not in the chart
          let currentNames = {};
          let currentIDs = chart.series.map((s) => {
            currentNames[s.name] = { color: s.color };
            return s.userOptions.id;
          });
          series[pathId].forEach((s) => {
            if (!currentIDs.includes(s.id)) {
              if (currentNames[s.name]) {
                s.color = currentNames[s.name].color;
                s.showInLegend = false;
              }
              chart.addSeries(s, false, false);
            }
          });
          chart.redraw(true);
        } else {
          selectedPaths = selectedPaths.filter((path) => path[0] !== pathId);
          series[pathId].forEach((s) => {
            chart.get(s.id).remove();
          });
          chart.redraw(true);
        }
      }
    });
    return chart;
  }

  function buildDecision() {
    if (metaData.build) {
      buildDashboard();
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
