import Highcharts from "highcharts";
import MapModule from "highcharts/modules/map";
import {
  sortJson,
  cerPalette,
  visibility,
  loadChartError,
  btnGroupClick,
} from "../modules/util";
import { mapInits, noEventsFlag } from "./dashboardUtil";
import conditionsRegions from "../data_output/conditions/metadata/regions.json";
import conditionsThemes from "../data_output/conditions/metadata/themes.json";

MapModule(Highcharts);

/**
 * Builds the conditions dashboard
 * @param {Object} econRegions - geoJSON features for economic region boundaries.
 * @param {Object} canadaMap - geoJSON features for canada base map.
 * @param {Object[]} mapMetaData - In progress/closed condition totals for each economic region id. Used to shade the map.
 * @param {Object} meta - project/theme/summary info for the current dashboard.
 * @param {Object} lang - en/fr language strings.
 * @returns {Promise}
 */
export async function mainConditions(
  econRegions,
  canadaMap,
  mapMetaData,
  meta,
  lang
) {
  const noLocationSummary = (params) => {
    let infohtml = `<p><strong>${lang.noLocation.title}</strong></p>`;
    if (params.summary.notOnMap.total > 0) {
      infohtml += `<p>${lang.noLocation.summary(
        params.summary.companyName
      )}</p><ul>`;
      Object.keys(params.summary.notOnMap.status).forEach((status) => {
        const count = params.summary.notOnMap.status[status];
        infohtml += `<li>${params.colNames[status]} ${lang.conditions}: ${count}</li>`;
      });
      infohtml += `</ul>`;
    } else {
      document.getElementById("no-location-btn").disabled = true;
    }
    document.getElementById("no-location-info").innerHTML = infohtml;
  };
  const statusInit = (metaData) => {
    const inProgress = document.getElementById("in-progress-btn");
    if (metaData.summary["In Progress"] > 0) {
      inProgress.classList.add("active");
    } else if (metaData.summary["In Progress"] === 0) {
      inProgress.disabled = true;
      document.getElementById("closed-btn").classList.add("active");
    }
    const conditionsFilter = {
      column: metaData.summary["In Progress"] > 0 ? "In Progress" : "Closed",
    };
    return conditionsFilter;
  };

  const fillSummary = (summary) => {
    document.getElementById("in-progress-summary").innerText =
      summary["In Progress"];
    document.getElementById("closed-summary").innerText = summary.Closed;
    document.getElementById("no-location-summary").innerText =
      summary.notOnMap.total;
  };

  const setTitle = (titleDiv, params) => {
    const titleElement = document.getElementById(titleDiv);
    if (params.conditionsFilter.column === "not-shown") {
      titleElement.innerText = lang.title.noLocation(params.systemName);
    } else {
      titleElement.innerText = lang.title.location(
        params.systemName,
        lang.colNames[params.conditionsFilter.column]
      );
    }
  };

  const generateTable = (summary, params, selectedRegion, tableName) => {
    let projectsHTML = ``;
    if (tableName === "projects") {
      projectsHTML = `<table class="conditions-table"><caption style="text-align:left;">${lang.table.projectsTitle(
        params.colNames[params.conditionsFilter.column]
      )}</caption>`;
      summary.projects.forEach((proj) => {
        if (proj.id === selectedRegion && proj.value > 0) {
          let displayName = "n/a";
          if (
            Object.prototype.hasOwnProperty.call(
              params.projectLookup,
              proj.name
            )
          ) {
            displayName = params.projectLookup[proj.name][lang.lang];
          }
          if (proj.Regdocs !== undefined) {
            const regdocsLink = `https://apps.cer-rec.gc.ca/REGDOCS/Item/View/${proj.Regdocs}`;
            projectsHTML += `<tr><td><a href=${regdocsLink} target="_blank">${displayName}</a></td><td>${proj.value}</td></tr>`;
          } else {
            projectsHTML += `<tr><td>${displayName}</td><td>${proj.value}</td></tr>`;
          }
        }
      });
      projectsHTML += `</table>${lang.table.regdocsDefinition}`;
    } else if (tableName === "themes") {
      projectsHTML = `<table class="conditions-table" id="themes-table"><caption style="text-align:left;">${lang.table.themesTitle(
        params.colNames[params.conditionsFilter.column]
      )}</caption>`;
      summary.themes.forEach((thm) => {
        const displayName = thm.Theme.map((tId) => {
          if (Object.prototype.hasOwnProperty.call(conditionsThemes, tId)) {
            return conditionsThemes[tId][lang.lang];
          }
          return "n/a";
        });
        if (thm.id === selectedRegion && thm.value > 0) {
          projectsHTML += `<tr><td>${displayName.join(", ")}</td><td>${
            thm.value
          }</td></tr>`;
        }
      });
      projectsHTML += `</table>`;
    }
    return projectsHTML;
  };

  const processMapMetadata = (data, filter, type = "map") => {
    let colSelector = 0;
    if (filter.column === "Closed") {
      colSelector = 1;
    }
    const getValid = (dataSet) => {
      let validMetaData;
      if (dataSet === "map") {
        validMetaData = function validMap(row) {
          return {
            "Flat Province": row["Flat Province"],
            id: row.id,
            value: row[filter.column],
          };
        };
      }
      if (dataSet === "projects") {
        validMetaData = function validProjects(row) {
          return {
            name: row.n,
            id: row.id,
            Regdocs: row.v[2],
            value: row.v[colSelector],
          };
        };
      }
      if (dataSet === "themes") {
        validMetaData = function validThemes(row) {
          return {
            Theme: row.t,
            id: row.id,
            value: row.v[colSelector],
          };
        };
      }
      return validMetaData;
    };

    const m = getValid(type);

    const conditions = data.map((row) => {
      if (row[filter.column] !== null) {
        return m(row);
      }
      return false;
    });
    return conditions;
  };

  function generateRegionSeries(mapMeta, mapRegions, filter) {
    return {
      name: "Conditions",
      id: "econ-regions",
      data: processMapMetadata(mapMeta, filter),
      mapData: Highcharts.geojson(mapRegions),
      joinBy: ["id", "id"],
      type: "map",
      zIndex: 1,
    };
  }

  const destroyInsert = (mapChart) => {
    const chart = mapChart;
    visibility(["conditions-definitions"], "hide");
    if (chart.customTooltip) {
      const currentPopUp = document.getElementById("conditions-insert");
      if (currentPopUp) {
        currentPopUp.innerHTML = "";
      }
      chart.customTooltip.destroy();
    }
    chart.customTooltip = undefined;
  };

  const selectedMeta = (params) => {
    const newMeta = { summary: params.summary };
    newMeta.projects = processMapMetadata(
      params.projects,
      params.conditionsFilter,
      "projects"
    );
    newMeta.themes = processMapMetadata(
      params.themes,
      params.conditionsFilter,
      "themes"
    );
    newMeta.colNames = params.colNames;
    if (params.conditionsFilter.column === "Closed") {
      newMeta.projects = sortJson(newMeta.projects, "value");
      newMeta.themes = sortJson(newMeta.themes, "value");
    }
    return newMeta;
  };

  const getMapZoom = (inits, metaData) => {
    const zooms = inits.zooms[metaData.summary.companyName];
    if (zooms === undefined) {
      return {
        "In Progress": [undefined, undefined, undefined],
        Closed: [undefined, undefined, undefined],
      };
    }
    return zooms;
  };

  const colorRange = (filters) => {
    if (filters.column === "In Progress") {
      return {
        min: 1,
        minColor: "#EEEEFF",
        maxColor: "#000022",
        stops: [
          [0, "#EFEFFF"],
          [0.67, "#4444FF"],
          [1, "#000022"],
        ],
      };
    }
    return {
      min: 1,
      minColor: "#DDEBDC",
      maxColor: "#052204",
      stops: [
        [0, "#DDEBDC"],
        [0.2, "#569E54"],
        [0.4, "#348B32"],
        [0.6, "#10660D"],
        [0.8, "#0A4409"],
        [1, "#052204"],
      ],
    };
  };

  const popUp = (e, params, metaSelect) => {
    const currentPopUp = document.getElementById("conditions-insert");
    if (currentPopUp) {
      currentPopUp.innerHTML = "";
    }
    const updateDate = new Date(
      metaSelect.summary.updated[0],
      metaSelect.summary.updated[1],
      metaSelect.summary.updated[2]
    );

    let text = `<div id="conditions-insert"><p style="font-size:15px; text-align:center;"><strong>${
      conditionsRegions[e.id][lang.lang]
    } ${lang.popUp.econRegion}</strong></p>`;
    text += `<table><caption style="text-align:left">${lang.popUp.summary}</caption>`;
    text += `<tr><td><li>${
      lang.popUp.lastUpdated
    }</td><td style="padding:0;font-weight: bold;color:${
      cerPalette["Cool Grey"]
    };">&nbsp;${lang.dateFormat(updateDate)}</li></td></tr>`;
    text += `<tr><td><li> ${params.colNames[params.conditionsFilter.column]} ${
      lang.conditions
    }${lang.popUpTotal}</td><td style="padding:0;font-weight: bold;color:${
      cerPalette["Cool Grey"]
    };">&nbsp;${e.value}</li></td></tr></table><br>`;
    text += `${generateTable(metaSelect, params, e.id, "projects")}<br>`;
    text += `${generateTable(
      metaSelect,
      params,
      e.id,
      "themes"
    )}</table></div>`;

    const { chart } = e.series;
    if (chart.customTooltip) {
      destroyInsert(chart);
    }
    const label = chart.renderer
      .label(text, null, null, null, null, null, true)
      .css({
        width: "300px",
      })
      .attr({
        "stroke-width": 3,
        zIndex: 8,
        padding: 8,
        r: 3,
        fill: "white",
        stroke: e.color,
      })
      .add(chart.rGroup);
    chart.customTooltip = label;
    label.align(
      Highcharts.extend(label.getBBox(), {
        align: "right",
        x: 0, // offset
        verticalAlign: "top",
        y: 0, // offset
      }),
      null,
      "spacingBox"
    );
    const themeRows = document.getElementById("themes-table").rows;
    themeRows.forEach((tableRow) => {
      const tr = tableRow;
      const rowText = tr.querySelectorAll("td")[0].textContent;
      tr.onclick = function themeClick() {
        const definitionDiv = document.getElementById("conditions-definitions");
        visibility(["conditions-definitions"], "show");
        const themes = rowText.split(",");
        let definitionsHTML = `<h4>${lang.themeDefinitionsTitle}</h4>`;
        for (let i = 0; i < themes.length; i += 1) {
          const t = themes[i].trim();
          definitionsHTML += `<strong>${t}: </strong>${lang.themeDefinitions[t]}<br>`;
        }
        definitionDiv.innerHTML = definitionsHTML;
        definitionDiv.scrollIntoView(false);
      };
    });
  };

  const removeNoConditions = (chart) => {
    const removeList = chart.series[0].points.filter((region) => {
      if (region.value == null || region.value === 0) {
        return region;
      }
      return false;
    });
    removeList.forEach((region) => {
      region.remove(false);
    });
  };

  const createConditionsMap = (regions, baseMap, container, params, zooms) =>
    Highcharts.mapChart(container, {
      chart: {
        panning: false,
        animation: false,
        events: {
          load() {
            removeNoConditions(this);
            this.mapZoom(
              zooms["In Progress"][0],
              zooms["In Progress"][1],
              zooms["In Progress"][2]
            );
            // try {
            //   this.get("econ-regions").zoomTo();
            //   this.mapZoom(5);
            // } catch (err) {
            //   console.log(err);
            // }
            let text = `<div class="alert alert-warning" id="conditions-instructions" style="padding:3px">`;
            text += `<h4>${lang.instructions.header}</h4>`;
            text += `<ol><li>${lang.instructions.line1}</li>`;
            text += `<li>${lang.instructions.line2}</li></ol>`;
            text += `${lang.instructions.disclaimer}</div>`;
            const label = this.renderer
              .label(text, null, null, null, null, null, true)
              .css({
                width: "290px",
                margin: 0,
              })
              .attr({
                zIndex: 8,
                padding: 0,
                r: 3,
              })
              .add(this.rGroup);
            label.align(
              Highcharts.extend(label.getBBox(), {
                align: "left",
                x: -5,
                verticalAlign: "bottom",
                y: 0,
              }),
              null,
              "spacingBox"
            );
          },
          click() {
            if (this.customTooltip) {
              const clickOnTooltip =
                this.mouseDownX > this.chartWidth - this.customTooltip.width &&
                this.mouseDownY < this.customTooltip.height;

              if (!clickOnTooltip) {
                destroyInsert(this);
              }
            }
          },
        },
      },

      plotOptions: {
        series: {
          point: {
            events: {
              click() {
                popUp(this, params, selectedMeta(params));
              },
            },
          },
        },
      },

      tooltip: {
        useHTML: false,
        formatter() {
          let toolText = `<strong>${
            conditionsRegions[this.point.id][lang.lang]
          }</strong><br>`;
          toolText += lang.tooltip.text;
          return toolText;
        },
      },
      colorAxis: colorRange(params.conditionsFilter),
      series: [regions, baseMap],
    });

  // uncomment this when adding new conditions maps to get the zoom init
  // const chartMode = (chart, mapInits) => {
  //   if (mapInits.mode == "development") {
  //     chart.update({
  //       chart: {
  //         panning: true,
  //         events: {
  //           redraw: function () {
  //             // this is useful for determining the on load map zoom scale
  //             var yScale = this.yAxis[0].getExtremes();
  //             var xScale = this.xAxis[0].getExtremes();
  //             console.log("Map Zoom X = ", (xScale.min + xScale.max) / 2);
  //             console.log("Map Zoom Y = ", (yScale.min + yScale.max) / 2);
  //           },
  //         },
  //       },
  //       mapNavigation: {
  //         enabled: true,
  //       },
  //     });
  //   }
  //   return chart;
  // };

  // main conditions map
  function buildDashboard() {
    if (meta.build) {
      const chartParams = meta;
      if (
        Object.prototype.hasOwnProperty.call(
          lang.companyToSystem,
          meta.summary.companyName
        )
      ) {
        chartParams.systemName = lang.companyToSystem[meta.summary.companyName];
      } else {
        chartParams.systemName = meta.summary.companyName;
      }
      chartParams.colNames = lang.colNames;
      chartParams.conditionsFilter = statusInit(meta);
      setTitle("conditions-map-title", chartParams);
      fillSummary(chartParams.summary);
      noLocationSummary(chartParams);
      const zooms = getMapZoom(mapInits, meta);

      const baseMap = {
        mapData: Highcharts.geojson(canadaMap),
        type: "map",
        color: "#F0F0F0",
        borderWidth: 0.5,
        borderColor: "black",
        zIndex: 0,
        showInLegend: false,
        enableMouseTracking: false,
      };

      const chart = createConditionsMap(
        generateRegionSeries(
          mapMetaData,
          econRegions,
          chartParams.conditionsFilter
        ),
        baseMap,
        "container-map",
        chartParams,
        zooms
      );

      // allow zoom and pan when in development mode
      // chart = chartMode(chart, mapInits);

      document
        .getElementById("conditions-nav-group")
        .addEventListener("click", (event) => {
          btnGroupClick("conditions-nav-group", event);
          const btnValue = event.target.value;
          chartParams.conditionsFilter.column = btnValue;
          if (btnValue !== "not-shown") {
            destroyInsert(chart);
            visibility(["no-location-info", "conditions-definitions"], "hide");
            visibility(["container-map"], "show");
          } else {
            visibility(["no-location-info"], "show");
            visibility(["container-map", "conditions-definitions"], "hide");
          }
          setTitle("conditions-map-title", chartParams);
          chart.update(
            {
              plotOptions: {
                series: {
                  point: {
                    events: {
                      click() {
                        popUp(this, chartParams, selectedMeta(chartParams));
                      },
                    },
                  },
                },
              },
              series: [
                generateRegionSeries(
                  mapMetaData,
                  econRegions,
                  chartParams.conditionsFilter
                ),
                baseMap,
              ],
              colorAxis: colorRange(chartParams.conditionsFilter),
            },
            false
          );

          chart.mapZoom(undefined, undefined, undefined);
          removeNoConditions(chart);
          if (chartParams.conditionsFilter.column === "Closed") {
            chart.mapZoom(zooms.Closed[0], zooms.Closed[1], zooms.Closed[2]);
          } else {
            chart.mapZoom(
              zooms["In Progress"][0],
              zooms["In Progress"][1],
              zooms["In Progress"][2]
            );
          }
        });
    } else {
      noEventsFlag(
        lang.noConditions.header,
        lang.noConditions.note,
        meta.companyName,
        "conditions-dashboard"
      );
    }
  }
  try {
    return buildDashboard();
  } catch (err) {
    return loadChartError("conditions-dashboard", lang.dashboardError);
  }
}
