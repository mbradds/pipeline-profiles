import Highcharts from "highcharts";
import {
  cerPalette,
  btnGroupClick,
  visibility,
  equalizeHeight,
} from "../modules/util.js";
import { fillBetween } from "../modules/datestone.js";

export async function mainTolls(tollsData, metaData) {
  // console.log(tollsData, metaData, lang);

  function buildSeries() {
    const processTollsSection = (section) => {
      const seriesLookup = {};
      const colorList = Object.values(cerPalette);
      const usedColors = {};
      section.forEach((path, pathNum) => {
        const fullPath = [];
        path.series.forEach((partialPath, partialNum) => {
          const fullTolls = [];
          partialPath.data.forEach((toll) => {
            fullTolls.push(...fillBetween(toll[0], toll[1], toll[2]));
          });
          let currentColor = colorList[pathNum + partialNum];
          if (usedColors[partialPath.id]) {
            currentColor = usedColors[partialPath.id];
          } else {
            usedColors[partialPath.id] = currentColor;
          }
          fullPath.push({
            id: `${partialPath.id}-${path.pathName}`,
            split: path.split,
            name: partialPath.id,
            data: fullTolls,
            color: currentColor,
            pathName: path.pathName,
            units: partialPath.units,
            product: partialPath.product,
          });
        });
        seriesLookup[path.pathName] = fullPath;
      });
      return seriesLookup;
    };

    const seriesLookup = {};
    if (metaData.split.default) {
      Object.keys(tollsData).forEach((section) => {
        seriesLookup[section] = processTollsSection(tollsData[section]);
      });
    } else {
      return processTollsSection(tollsData);
    }
    return seriesLookup;
  }

  function toolTipTolls(event) {
    let toolText = `<strong>${Highcharts.dateFormat(
      "%b %d, %Y",
      event.x
    )}</strong>`;
    toolText += `<table>`;
    toolText += `<tr><td>Toll:&nbsp;</td><td><strong>${event.y} (${event.series.userOptions.units})</strong></td></tr>`;
    toolText += `<tr><td>Path:&nbsp;</td><td><strong>${event.series.userOptions.pathName}</strong></td></tr>`;
    toolText += `<tr><td>${metaData.seriesCol}:&nbsp;</td><td><strong>${event.series.userOptions.name}</strong></td></tr>`;
    toolText += `<tr><td>Product:&nbsp;</td><td><strong>${event.series.userOptions.product}</strong></td></tr>`;
    toolText += `</table>`;
    return toolText;
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
      yAxis: {
        title: {
          text: "Toll",
        },
      },
      plotOptions: {
        series: {
          marker: {
            symbol: "circle",
          },
          events: {
            legendItemClick() {
              return false;
            },
          },
          states: {
            inactive: {
              opacity: 1,
            },
          },
        },
      },
      tooltip: {
        shadow: false,
        useHTML: true,
        animation: true,
        borderColor: cerPalette["Dim Grey"],
        formatter() {
          return toolTipTolls(this);
        },
      },
      series,
    });
  }

  function addPathButtons(meta, selected = false) {
    const addCheckbox = (point, btnGroup, i, type) => {
      let checked = "";
      if (point[1]) {
        checked = `checked="checked"`;
      }
      btnGroup.insertAdjacentHTML(
        "beforeend",
        `<div class="${type}">
        <label for="inlineCheck${i}" label>
        <input id="inlineCheck${i}" ${checked} type="${type}" name="optradio" value="${point[0]}">${point[0]}
        </label></div>`
      );
    };

    let points = [];
    if (meta.split.default) {
      points = selected ? meta.paths[selected] : meta.paths[meta.split.default];
    } else {
      points = meta.paths;
    }
    const btnGroup = document.getElementById("tolls-path-btn");
    btnGroup.innerHTML = "";
    btnGroup.insertAdjacentHTML(
      "beforeend",
      `<p class="cerlabel">Select path:</p>`
    );
    points.forEach((point, i) => {
      addCheckbox(point, btnGroup, i, meta.pathFilter[1]);
    });
    equalizeHeight("tolls-filter-container", "tolls-info");
    return btnGroup;
  }

  function addSplitButtons(split) {
    const btnGroup = document.getElementById("tolls-split-btn");
    split.buttons.forEach((point) => {
      const active = point === split.default ? " active" : "";
      btnGroup.insertAdjacentHTML(
        "beforeend",
        `<div class="btn-group"><button type="button" value="${point}" class="btn btn-default${active}">${point}</button></div>`
      );
    });
    return btnGroup;
  }

  function selectedSeries(series, meta) {
    const selected = [];
    if (!meta.split.default) {
      meta.paths.forEach((path) => {
        if (path[1]) {
          selected.push(...series[path[0]]);
        }
      });
      return selected;
    }
    const currentSeries = series[meta.split.default];
    meta.paths[meta.split.default].forEach((path) => {
      if (path[1]) {
        selected.push(...currentSeries[path[0]]);
      }
    });
    return selected;
  }

  function buildDashboard() {
    const selections = metaData;
    const series = buildSeries();
    const chart = buildTollsChart(selectedSeries(series, selections));
    if (selections.pathFilter[0]) {
      const pathBtns = addPathButtons(selections);
      pathBtns.addEventListener("click", (event) => {
        if (event.target && event.target.tagName === "INPUT") {
          const pathId = event.target.value;
          if (event.target.checked) {
            // add series by id if not in the chart
            const currentNames = {};
            const currentIDs = chart.series.map((s) => {
              currentNames[s.name] = { color: s.color };

              return s.userOptions.id;
            });

            if (selections.pathFilter[1] === "radio") {
              while (chart.series.length) {
                chart.series[0].remove(false, false, false);
              }
            }

            const newSelected = selections.split.default
              ? series[metaData.split.default][pathId]
              : series[pathId];

            newSelected.forEach((s) => {
              if (!currentIDs.includes(s.id)) {
                const newSeries = s;
                if (currentNames[s.name]) {
                  newSeries.color = currentNames[s.name].color;
                  newSeries.showInLegend = false;
                } else {
                  newSeries.showInLegend = true;
                }
                chart.addSeries(newSeries, false, false);
              }
            });
            chart.redraw(true);
          } else {
            series[pathId].forEach((s) => {
              chart.get(s.id).remove();
            });
            chart.redraw(true);
          }
        }
      });
    } else {
      visibility(["tolls-path-btn"], "hide");
    }

    if (metaData.split.default) {
      const splitBtns = addSplitButtons(metaData.split);
      splitBtns.addEventListener("click", (event) => {
        if (event.target) {
          btnGroupClick("tolls-split-btn", event);
          selections.split.default = event.target.value;
          addPathButtons(selections);
          const newSeries = selectedSeries(series, selections);
          while (chart.series.length) {
            chart.series[0].remove(false, false, false);
          }
          newSeries.forEach((newS) => {
            chart.addSeries(newS, false, false);
          });
          chart.redraw(true);
        }
      });
    } else {
      visibility(["tolls-split-btn"], "hide");
    }

    return chart;
  }

  function buildDecision() {
    if (metaData.build) {
      buildDashboard();
    } else {
      // console.log("no tolls data");
    }
  }

  try {
    buildDecision();
  } catch (err) {
    // import and raise dashboard error here
    console.log(err);
  }
}
