import Highcharts from "highcharts";
import MapModule from "highcharts/modules/map.js";
import {
  sortJson,
  cerPalette,
  visibility,
  loadChartError,
  btnGroupClick,
} from "../modules/util.js";
import { mapInits, noEventsFlag, addRenderer } from "./dashboardUtil.js";
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
          if (proj.Regdocs !== undefined && proj.Regdocs !== 0) {
            projectsHTML += `<tr><td><a href=${`${lang.table.regdocsLink}${proj.Regdocs}`} target="_blank">${displayName}</a></td><td>${
              proj.value
            }</td></tr>`;
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
    const colSelector = filter.column === "Closed" ? 1 : 0;

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
      data: processMapMetadata(mapMeta, filter),
      mapData: Highcharts.geojson(mapRegions),
      joinBy: ["id", "id"],
      type: "map",
      zIndex: 1,
    };
  }

  const destroyInsert = (mapChart) => {
    visibility(["conditions-definitions"], "hide");
    if (mapChart.customTooltip) {
      const currentPopUp = document.getElementById("conditions-insert");
      if (currentPopUp) {
        currentPopUp.innerHTML = "";
      }
      mapChart.customTooltip.destroy();
    }
    mapChart.customTooltip = undefined;
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
    const zooms = inits[metaData.summary.companyName];
    if (zooms === undefined) {
      return {
        [metaData.summary.companyName]: {
          "In Progress": undefined,
          Closed: undefined,
        },
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

    const { chart } = e.series;

    let text = `<div id="conditions-insert" style="max-height: ${
      chart.chartHeight - 35
    }px"><p style="font-size:15px; text-align:center;"><strong>${
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

    if (chart.customTooltip) {
      destroyInsert(chart);
    }

    chart.customTooltip = addRenderer(chart, text, e.color);
    const definitionDiv = document.getElementById("conditions-definitions");
    const themeRows = Array.from(document.getElementById("themes-table").rows);
    themeRows.forEach((tr) => {
      const rowText = tr.querySelectorAll("td")[0].textContent;
      tr.onclick = function themeClick() {
        visibility(["conditions-definitions"], "show");
        const themes = rowText.split(",");
        let definitionsHTML = `<h4>${lang.themeDefinitionsTitle}</h4>`;
        themes.forEach((themeName) => {
          const t = themeName.trim();
          definitionsHTML += `<strong>${t}: </strong>${lang.themeDefinitions[t]}<br>`;
        });
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

  const zoomToGeoJson = (chart, zoom) => {
    const validPoints = chart.series[0]
      .getValidPoints()
      .filter((point) => point.options.id !== "-1");

    const lessThan = (current, next, symbol) => {
      if (symbol !== "x2" && symbol !== "y1") {
        if (Math.abs(current[symbol]) < Math.abs(next[symbol])) {
          current[symbol] = next[symbol];
        }
      } else if (Math.abs(next[symbol]) < Math.abs(current[symbol])) {
        current[symbol] = next[symbol];
      }
      return current;
    };

    let currentBounds = {
      x1: 0,
      y1: Number.MAX_SAFE_INTEGER,
      x2: Number.MAX_SAFE_INTEGER,
      y2: 0,
    };

    const [midX, midY] = [[], []];

    validPoints.forEach((p) => {
      midX.push(Math.abs(p.bounds.x1));
      midY.push(Math.abs(p.bounds.y1));
      currentBounds = lessThan(currentBounds, p.bounds, "x1");
      currentBounds = lessThan(currentBounds, p.bounds, "y2");
      currentBounds = lessThan(currentBounds, p.bounds, "x2");
      currentBounds = lessThan(currentBounds, p.bounds, "y1");
    });

    const xRange = Math.max(...midX) - Math.min(...midX);
    const yRange = Math.max(...midY) - Math.min(...midY);
    let paddingScale = 1000;
    if (validPoints.length === 1) {
      paddingScale = 350;
    } else {
      paddingScale = xRange > yRange ? xRange : yRange;
      paddingScale = ((1 / paddingScale) * 100000 + 1) ** 9;
      paddingScale = paddingScale > 1000 ? 1000 : paddingScale;
      paddingScale = paddingScale < 150 ? paddingScale + 150 : paddingScale;
    }

    chart.mapView.fitToBounds(currentBounds, paddingScale, true);
    if (zoom !== undefined) {
      chart.mapView.zoomBy(zoom);
      chart.redraw();
    }
  };

  const createConditionsMap = (regions, baseMap, container, params, zooms) =>
    Highcharts.mapChart({
      chart: {
        renderTo: container,
        panning: { enabled: false },
        animation: false,
        events: {
          load() {
            removeNoConditions(this);
            zoomToGeoJson(this, zooms[params.conditionsFilter.column]);
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
            zoomToGeoJson(chart, zooms.Closed);
          } else {
            zoomToGeoJson(chart, zooms["In Progress"]);
          }
        });
    } else {
      noEventsFlag(
        lang.noEvents.header(lang.conditions),
        lang.noEvents.note(
          lang.conditions,
          lang.companyToSystem[meta.companyName],
          true
        ),
        "conditions-dashboard"
      );
    }
  }
  try {
    return buildDashboard();
  } catch (err) {
    return loadChartError("conditions-dashboard", lang.dashboardError, err);
  }
}
