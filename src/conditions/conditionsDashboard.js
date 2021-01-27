import { cerPalette, sortJson } from "../modules/util.js";
import { mapInits } from "./hcMapConfig.js";

export const mainConditions = (econRegions, canadaMap, mapMetaData, meta) => {
  const statusInit = (meta) => {
    var inProgress = $("#in-progress-btn");
    var closed = $("#closed-btn");
    const conditionsFilter = { column: "In Progress" };
    $(document).ready(function () {
      if (meta.summary["In Progress"] >= 0) {
        conditionsFilter.column = "In Progress";
        inProgress.click();
      } else if (meta.summary["In Progress"] == 0) {
        inProgress.prop("disabled", true);
        conditionsFilter.column = "Closed";
        closed.click();
      }
    });
    return conditionsFilter;
  };
  const conditionsFilter = statusInit(meta);
  const fillSummary = (summary) => {
    document.getElementById("in-progress-summary").innerText =
      summary["In Progress"];
    document.getElementById("closed-summary").innerText = summary.Closed;
    document.getElementById("no-location-summary").innerText = summary.notOnMap;
  };

  const setTitle = (titleElement, filter) => {
    titleElement.innerText = `${filter.column} Conditions by Region`;
  };

  const generateTable = (summary, selectedRegion, tableName, filter) => {
    let projectsHTML = ``;
    if (tableName == "projects") {
      projectsHTML = `<table class="conditions-table">`;
      projectsHTML += `<caption style="text-align:left;">Projects with ${filter.column} Conditions (click for REGDOCS link):</caption>`;
      summary.projects.map((proj) => {
        if (proj.id == selectedRegion && proj.value > 0) {
          if (proj.Regdocs !== undefined) {
            let regdocsLink = `https://apps.cer-rec.gc.ca/REGDOCS/Item/View/${proj.Regdocs}`;
            projectsHTML += `<tr><td><a href=${regdocsLink} target="_blank">${proj["Short Project Name"]}</a></td><td>${proj["value"]}</td></tr>`;
          } else {
            projectsHTML += `<tr><td>${proj["Short Project Name"]}</td><td>${proj["value"]}</td></tr>`;
          }
        }
      });
    } else if (tableName == "themes") {
      projectsHTML = `<table class="conditions-table" id="themes-table">`;
      projectsHTML += `<caption style="text-align:left;">${filter.column} Condition Themes (click to view theme definition):</caption>`;
      summary.themes.map((proj) => {
        if (proj.id == selectedRegion && proj.value > 0) {
          projectsHTML += `<tr><td onclick="themeClick(this)">${proj["Theme(s)"]}</td><td>${proj["value"]}</td></tr>`;
        }
      });
    }
    projectsHTML += `</table>`;
    return projectsHTML;
  };

  const processMapMetadata = (data, filter, type = "map") => {
    const getValid = (type) => {
      if (type == "map") {
        function validMetaData(row) {
          return {
            "Flat Province": row["Flat Province"],
            id: row.id,
            value: row[filter.column],
          };
        }
        return validMetaData;
      } else if (type == "projects") {
        function validMetaData(row) {
          return {
            "Short Project Name": row["Short Project Name"],
            id: row.id,
            Regdocs: row.Regdocs,
            value: row[filter.column],
          };
        }
        return validMetaData;
      } else if (type == "themes") {
        function validMetaData(row) {
          return {
            "Theme(s)": row["Theme(s)"],
            id: row.id,
            value: row[filter.column],
          };
        }
        return validMetaData;
      }
    };

    let m = getValid(type);

    let conditions = [];
    data.filter((row) => {
      if (row[filter.column] !== null) {
        conditions.push(m(row));
      }
    });
    return conditions;
  };

  const generateRegionSeries = (mapMeta, mapRegions, filter) => {
    return {
      name: "Conditions",
      data: processMapMetadata(mapMeta, filter),
      mapData: Highcharts.geojson(mapRegions),
      joinBy: ["id", "id"],
      type: "map",
      zIndex: 1,
    };
  };

  const destroyInsert = (chart) => {
    document.getElementById("conditions-definitions").innerHTML = "";
    if (chart.customTooltip) {
      let currentPopUp = document.getElementById("conditions-insert");
      if (currentPopUp) {
        currentPopUp.innerHTML = "";
      }
      chart.customTooltip.destroy();
      chart.customTooltip = undefined;
    }
    var definitionDiv = document.getElementById("conditions-definitions");
    if (definitionDiv.style.display === "block") {
      definitionDiv.style.display = "none";
    }
  };

  const selectedMeta = (m, filter) => {
    const newMeta = { summary: m.summary };
    newMeta.projects = processMapMetadata(m.projects, filter, "projects");
    newMeta.themes = processMapMetadata(m.themes, filter, "themes");
    if (filter.column == "Closed") {
      newMeta.projects = sortJson(newMeta.projects, "value");
      newMeta.themes = sortJson(newMeta.themes, "value");
    }
    return newMeta;
  };

  const getMapZoom = (mapInits, meta) => {
    let zooms = mapInits.zooms[meta.summary.companyName];
    if (zooms == undefined) {
      return {
        "In Progress": [undefined, undefined, undefined],
        Closed: [undefined, undefined, undefined],
      };
    } else {
      return zooms;
    }
  };

  const colorRange = (filters) => {
    if (filters.column == "In Progress") {
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
    } else {
      return {
        min: 1,
        minColor: "#d2f8d2",
        maxColor: "#092215",
        stops: [
          [0, "#d2f8d2"],
          [0.67, "#154f30"],
          [1, "#092215"],
        ],
      };
    }
  };

  const popUp = (e, filter, meta) => {
    let currentPopUp = document.getElementById("conditions-insert");
    if (currentPopUp) {
      currentPopUp.innerHTML = "";
    }
    var text = `<div id="conditions-insert"><p style="font-size:15px; text-align:center;"><b>${e.id} Economic Region</b></p>`;
    text += `<table><caption style="text-align:left">Conditions Summary:</caption>`;
    text += `<tr><td><li> Last updated on:</td><td style="padding:0;font-weight: bold;color:${cerPalette["Cool Grey"]};">${meta.summary.updated}</li></td></tr>`;
    text += `<tr><td><li> ${filter.column} Conditions:</td><td style="padding:0;font-weight: bold;color:${cerPalette["Cool Grey"]};">&nbsp${e.value}</li></td></tr>`;
    text += `</table><br>`;
    text += generateTable(meta, e.id, "projects", filter) + "<br>";
    text += generateTable(meta, e.id, "themes", filter);
    text += `</table></div>`;

    const chart = e.series.chart;
    if (chart.customTooltip) {
      destroyInsert(chart);
    }
    var label = chart.renderer
      .label(text, null, null, null, null, null, true)
      .css({
        width: "300px",
      })
      .attr({
        // style tooltip
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
  };

  const removeNoConditions = (chart) => {
    let removeList = [];
    chart.series[0].points.map((region) => {
      if (region.value == null) {
        removeList.push(region);
      }
    });
    removeList.map((region) => {
      region.remove(false);
    });
  };

  const createConditionsMap = (
    regions,
    baseMap,
    container,
    meta,
    filter,
    zooms
  ) => {
    return new Highcharts.mapChart(container, {
      chart: {
        panning: false,
        animation: false,
        events: {
          load: function () {
            const chart = this;
            removeNoConditions(chart);
            chart.mapZoom(
              zooms["In Progress"][0],
              zooms["In Progress"][1],
              zooms["In Progress"][2]
            );
            let text = `<section class="alert alert-warning" style="padding:4px">`;
            text += `<h4>Map Instructions:</h4>`;
            text += `<ol><li>Click on a region to view conditions info</li>`;
            text += `<li>Click map area outside of regions to hide info</li></ol>`;
            text += `</section>`;
            var label = chart.renderer
              .label(text, null, null, null, null, null, true)
              .css({
                width: "325px",
                margin: 0,
              })
              .attr({
                zIndex: 8,
                padding: 0,
                r: 3,
              })
              .add(chart.rGroup);
            label.align(
              Highcharts.extend(label.getBBox(), {
                align: "left",
                x: -5, // offset
                verticalAlign: "top",
                y: 0, // offset
              }),
              null,
              "spacingBox"
            );
          },
          click: function () {
            var [chartHeight, chartWidth] = [this.chartHeight, this.chartWidth];
            if (this.customTooltip) {
              if (
                this.mouseDownX > chartWidth - this.customTooltip.width &&
                this.mouseDownY < this.customTooltip.height
              ) {
              } else {
                destroyInsert(this);
              }
            }
          },
        },
      },
      credits: {
        text: "",
      },

      mapNavigation: {
        enabled: false,
      },

      plotOptions: {
        series: {
          point: {
            events: {
              click: function () {
                popUp(this, filter, selectedMeta(meta, filter));
              },
            },
          },
        },
      },

      xAxis: {
        zoomEnabled: false,
      },

      tooltip: {
        zIndex: 0,
        useHTML: false,
        formatter: function () {
          let toolText = `<b>${this.point.properties.id} - ${this.point.properties["Flat Province"]}</b><br>`;
          toolText += `Click on region to view summary`;
          return toolText;
        },
      },
      colorAxis: colorRange(filter),
      series: [regions, baseMap],
    });
  };

  const chartMode = (chart, mapInits) => {
    if (mapInits.mode == "development") {
      chart.update({
        chart: {
          panning: true,
          events: {
            redraw: function () {
              // this is useful for determining the on load map zoom scale
              var yScale = this.yAxis[0].getExtremes();
              var xScale = this.xAxis[0].getExtremes();
              console.log("Map Zoom X = ", (xScale.min + xScale.max) / 2);
              console.log("Map Zoom Y = ", (yScale.min + yScale.max) / 2);
            },
          },
        },
        mapNavigation: {
          enabled: true,
        },
      });
    }
    return chart;
  };

  //main conditions map
  let titleElement = document.getElementById("conditions-map-title");
  setTitle(titleElement, conditionsFilter);
  fillSummary(meta.summary);
  var zooms = getMapZoom(mapInits, meta);

  const baseMap = {
    name: "Canada",
    mapData: Highcharts.geojson(canadaMap),
    type: "map",
    color: "#F0F0F0",
    borderWidth: 0.5,
    borderColor: "black",
    zIndex: 0,
    showInLegend: false,
    enableMouseTracking: false,
  };

  const regionSeries = generateRegionSeries(
    mapMetaData,
    econRegions,
    conditionsFilter
  );

  var chart = createConditionsMap(
    regionSeries,
    baseMap,
    "container-map",
    meta,
    conditionsFilter,
    zooms
  );

  //allow zoom and pan when in development mode
  chart = chartMode(chart, mapInits);

  //change condition type and update map+title
  $("#conditions-nav-group button").on("click", function () {
    $(".btn-conditions > .btn").removeClass("active");
    $(this).addClass("active");
    var thisBtn = $(this);
    var btnValue = thisBtn.val();
    $("#selectedVal").text(btnValue);
    if (btnValue !== "not-shown") {
      conditionsFilter.column = btnValue;
      destroyInsert(chart);
    }
    setTitle(titleElement, conditionsFilter);
    const regionSeries = generateRegionSeries(
      mapMetaData,
      econRegions,
      conditionsFilter
    );
    chart.update(
      {
        plotOptions: {
          series: {
            point: {
              events: {
                click: function () {
                  popUp(
                    this,
                    conditionsFilter,
                    selectedMeta(meta, conditionsFilter)
                  );
                },
              },
            },
          },
        },
        series: [regionSeries, baseMap],
        colorAxis: colorRange(conditionsFilter),
      },
      false
    );

    chart.mapZoom(undefined, undefined, undefined);
    removeNoConditions(chart);
    if (conditionsFilter.column == "Closed") {
      chart.mapZoom(zooms["Closed"][0], zooms["Closed"][1], zooms["Closed"][2]);
    } else {
      chart.mapZoom(
        zooms["In Progress"][0],
        zooms["In Progress"][1],
        zooms["In Progress"][2]
      );
    }
  });
};
