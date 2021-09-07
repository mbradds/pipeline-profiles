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

  function toolTipTolls(event, seriesCol) {
    let toolText = `<strong>${Highcharts.dateFormat(
      "%b %d, %Y",
      event.x
    )}</strong>`;
    toolText += `<table><tr><td>Toll:&nbsp;</td><td><strong>${event.y} (${event.series.userOptions.units})</strong></td></tr>`;
    const optionalSections = {
      Path: `<tr><td>Path:&nbsp;</td><td><strong>${event.series.userOptions.pathName}</strong></td></tr>`,
      Product: `<tr><td>Product:&nbsp;</td><td><strong>${event.series.userOptions.product}</strong></td></tr>`,
    };
    Object.keys(optionalSections).forEach((row) => {
      if (row !== seriesCol) {
        toolText += optionalSections[row];
      }
    });
    toolText += `<tr><td>${seriesCol}:&nbsp;</td><td><strong>${event.series.userOptions.name}</strong></td></tr></table>`;
    return toolText;
  }

  function buildTollsChart(series, selections, div = "tolls-chart") {
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
          return toolTipTolls(
            this,
            selections.split.default
              ? selections.seriesCol[selections.split.default]
              : selections.seriesCol
          );
        },
      },
      series,
    });
  }

  function addPathButtons(meta) {
    const addCheckbox = (point, btnGroup, i, type, section) => {
      let checked = "";
      if (point[1]) {
        checked = `checked="checked"`;
      }
      btnGroup.insertAdjacentHTML(
        "beforeend",
        `<div class="${type}">
        <label for="inlineCheck${i}${section}" label>
        <input id="inlineCheck${i}${section}" ${checked} type="${type}" name="optradio${section}" value="${point[0]}">${point[0]}
        </label></div>`
      );
      return btnGroup;
    };

    const setUpButtons = (selectText, divId) => {
      const btnGroup = document.getElementById(divId);
      btnGroup.innerHTML = "";
      btnGroup.insertAdjacentHTML(
        "beforeend",
        `<p class="cerlabel">${selectText}</p>`
      );
      return btnGroup;
    };

    const addEachButton = (pointList, group, type, section) => {
      pointList.forEach((point, i) => {
        addCheckbox(point, group, i, type, section);
      });
      return group;
    };

    let [points, products] = [[], []];
    if (meta.split.default) {
      points = meta.paths[meta.split.default];
      products = meta.products[meta.split.default];
    } else {
      points = meta.paths;
      products = meta.products;
    }

    let btnGroup = setUpButtons("Select path:", "tolls-path-btn");
    btnGroup = addEachButton(points, btnGroup, meta.pathFilter[1], "point");

    let btnGroupProducts = false;
    if (products) {
      btnGroupProducts = setUpButtons("Select product:", "tolls-product-btn");
      btnGroupProducts = addEachButton(
        products,
        btnGroupProducts,
        "radio",
        "product"
      );
      btnGroupProducts.addEventListener("click", (event) => {
        if (event.target && event.target.tagName === "INPUT") {
          console.log(event);
        }
      });
    }
    return [btnGroup, btnGroupProducts];
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

  function selectedSeries(
    series,
    meta,
    chosenPath = false,
    chosenProduct = false
  ) {
    const selected = [];
    let product = false;
    const getProduct = (prodList) => {
      let found = false;
      if (!prodList) {
        return found;
      }
      prodList.forEach((p) => {
        if (p[1]) {
          [found] = p;
        }
      });
      return found;
    };
    if (!meta.split.default) {
      if (chosenProduct) {
        product = chosenProduct;
      } else {
        product = getProduct(meta.products);
      }
      if (chosenPath) {
        selected.push(...series[chosenPath]);
      } else {
        meta.paths.forEach((path) => {
          if (path[1]) {
            selected.push(...series[path[0]]);
          }
        });
      }
    } else {
      const currentSeries = series[meta.split.default];
      if (chosenProduct) {
        product = chosenProduct;
      } else {
        product = getProduct(meta.products[meta.split.default]);
      }
      if (chosenPath) {
        selected.push(...currentSeries[chosenPath]);
      }
      meta.paths[meta.split.default].forEach((path) => {
        if (path[1]) {
          selected.push(...currentSeries[path[0]]);
        }
      });
    }
    // filter products here
    if (product) {
      return selected.filter((s) => s.product === product);
    }
    return selected;
  }

  function updateTollsDescription(selections) {
    const split = selections.split.default
      ? `<strong> ${selections.split.default} </strong>`
      : " ";
    document.getElementById(
      "toll-description"
    ).innerHTML = `<p>2-3 sentence description of the${split}toll methodology.</p>`;
    equalizeHeight("tolls-filter-container", "tolls-info");
  }

  function listener(btnGroup, chart, selections, series, section) {
    const getChartLegend = (c) => c.legend.allItems.map((l) => l.name);
    btnGroup.addEventListener("click", (event) => {
      if (event.target && event.target.tagName === "INPUT") {
        const pathId = event.target.value;
        if (event.target.checked) {
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

          const currentLegend = getChartLegend(chart);
          let newSelected = [];
          if (section === "path") {
            newSelected = selectedSeries(series, selections, pathId, false);
          } else {
            newSelected = selectedSeries(series, selections, false, pathId);
          }

          newSelected.forEach((s) => {
            if (!currentIDs.includes(s.id)) {
              const newSeries = s;
              if (currentNames[s.name]) {
                newSeries.color = currentNames[s.name].color;
              }
              if (currentLegend.includes(s.name)) {
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
          const currentLegend = getChartLegend(chart);
          chart.series.forEach((s) => {
            if (!currentLegend.includes(s.name)) {
              s.update(
                {
                  showInLegend: true,
                },
                false
              );
            }
          });
          chart.redraw(true);
        }
      }
    });
  }

  function buildDashboard() {
    const selections = metaData;
    const series = buildSeries();
    const chart = buildTollsChart(
      selectedSeries(series, selections),
      selections
    );
    updateTollsDescription(selections);
    let [pathBtns, productBtns] = addPathButtons(selections);
    if (selections.pathFilter[0] && pathBtns) {
      listener(pathBtns, chart, selections, series, "path");
    } else {
      visibility(["tolls-path-btn"], "hide");
    }

    if (metaData.split.default) {
      const splitBtns = addSplitButtons(metaData.split);
      splitBtns.addEventListener("click", (event) => {
        if (event.target) {
          btnGroupClick("tolls-split-btn", event);
          selections.split.default = event.target.value;
          [pathBtns, productBtns] = addPathButtons(selections);
          if (!productBtns) {
            visibility(["tolls-product-btn"], "hide");
          } else {
            visibility(["tolls-product-btn"], "show");
          }
          updateTollsDescription(selections);
          const newSeries = selectedSeries(series, selections);
          while (chart.series.length) {
            chart.series[0].remove(false, false, false);
          }
          newSeries.forEach((newS) => {
            chart.addSeries(newS, false, false);
          });
          chart.update({
            tooltip: {
              formatter() {
                return toolTipTolls(
                  this,
                  selections.split.default
                    ? selections.seriesCol[selections.split.default]
                    : selections.seriesCol
                );
              },
            },
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
