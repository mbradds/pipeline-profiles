import ngtlRegions from "./economicRegions.json";
import canadaMap from "../base_maps/base_map.json";
import mapMetaData from "./mapMetadata.json";
import { cerPalette } from "../../modules/util.js";
import meta from "./summaryMetadata.json";

export const ngtlConditionsMap = () => {
  const conditionsFilter = { column: "In Progress" };
  const fillSummary = (summary) => {
    document.getElementById("in-progress-summary").innerText =
      summary["In Progress"];
    document.getElementById("closed-summary").innerText = summary.Closed;
    document.getElementById("no-location-summary").innerText = summary.notOnMap;
  };
  fillSummary(meta.summary);

  const generateTable = (summary, selectedRegion, tableName, filter) => {
    let projectsHTML = ``;
    if (tableName == "projects") {
      projectsHTML = `<table class="conditions-table">`;
      projectsHTML += `<caption style="text-align:left;">Projects with ${filter.column} Conditions:</caption>`;
      summary.projects.map((proj) => {
        if (proj.id == selectedRegion) {
          let regdocsLink = `https://apps.cer-rec.gc.ca/REGDOCS/Search?txthl=${proj[
            "Short Project Name"
          ].replaceAll(" ", "%20")}`;
          projectsHTML += `<tr><td><a href=${regdocsLink} target="_blank">${proj["Short Project Name"]}</a></td><td>${proj["value"]}</td></tr>`;
        }
      });
    } else if (tableName == "themes") {
      projectsHTML = `<table class="conditions-table" id="themes-table">`;
      projectsHTML += `<caption style="text-align:left;">${filter.column} Condition Themes:</caption>`;
      summary.themes.map((proj) => {
        if (proj.id == selectedRegion) {
          projectsHTML += `<tr onclick="themeClick(this)"><td>${proj["Theme(s)"]}</td><td>${proj["value"]}</td></tr>`;
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
      name: "NGTL Conditions",
      data: processMapMetadata(mapMeta, filter),
      mapData: Highcharts.geojson(mapRegions),
      joinBy: ["id", "id"],
      type: "map",
      zIndex: 1,
    };
  };

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

  const xZoom = 50;
  const yZoom = 900;
  const zZoom = 0.6;

  const destroyInsert = (chart) => {
    chart.customTooltip.destroy();
    chart.customTooltip = undefined;
  };

  const selectedMeta = (meta) => {
    meta.projects = processMapMetadata(
      meta.projects,
      conditionsFilter,
      "projects"
    );
    meta.themes = processMapMetadata(meta.themes, conditionsFilter, "themes");
    return meta;
  };

  const createConditionsMap = (regions, baseMap, container, meta, filter) => {
    meta = selectedMeta(meta);
    return new Highcharts.mapChart(container, {
      chart: {
        panning: false,
        animation: false,
        events: {
          load: function () {
            this.mapZoom(0.4, -1267305, -1841405);
            const chart = this;
            var text = `<b>Click on a region to view condition info box</b><br>`;
            text += `<i>Click area outside of regions to hide info box</i>`;

            var label = chart.renderer
              .label(text, null, null, null, null, null, true)
              .css({
                width: "300px",
              })
              .attr({
                zIndex: 8,
                padding: 8,
                r: 3,
                fill: "white",
              })
              .add(chart.rGroup);
            label.align(
              Highcharts.extend(label.getBBox(), {
                align: "left",
                x: 0, // offset
                verticalAlign: "top",
                y: 0, // offset
              }),
              null,
              "spacingBox"
            );
          },
          click: function () {
            var [chartHeight, chartWidth] = [this.chartHeight, this.chartWidth];
            // console.log(
            //   "Chart width: ",
            //   chartWidth,
            //   "Chart height: ",
            //   chartHeight
            // );
            // console.log(
            //   "Tooltip width: ",
            //   this.customTooltip.width,
            //   "Tooltip height: ",
            //   this.customTooltip.height
            // );
            // console.log(
            //   "mouse x: ",
            //   this.mouseDownX,
            //   "mouse y: ",
            //   this.mouseDownY
            // );
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
          redraw: function () {
            //this is useful for determining the on load map zoom scale
            // var yScale = this.yAxis[0].getExtremes()
            // var xScale = this.xAxis[0].getExtremes()
            // console.log('Map Zoom X = ',(xScale.min+xScale.max)/2)
            // console.log('Map Zoom Y = ',(yScale.min+yScale.max)/2)
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
                var text = `<div id="conditions-insert"><p style="font-size:15px; text-align:center;"><b>${this.id} Economic Region</b></p>`;
                text += `<table><caption style="text-align:left">Conditions Summary:</caption>`;
                text += `<tr><td><li> Last updated on:</td><td style="padding:0;font-style: italic;font-weight: bold;color:${cerPalette["Cool Grey"]};">${meta.summary.updated}</li></td></tr>`;
                text += `<tr><td><li> ${filter.column} Conditions:</td><td style="padding:0;font-style: italic;font-weight: bold;color:${cerPalette["Cool Grey"]};">&nbsp${this.value}</li></td></tr>`;
                text += `</table><br>`;
                text +=
                  generateTable(meta, this.id, "projects", filter) + "<br>";
                text += generateTable(meta, this.id, "themes", filter);
                text += `</table></div>`;

                const chart = this.series.chart;
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
                    stroke: this.color,
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
        useHTML: true,
        formatter: function () {
          let toolText = `<b>${this.point.properties.id} - ${this.point.properties["Flat Province"]}</b><br>`;
          toolText += `<i>Click on region to view summary</i>`;
          return toolText;
        },
      },
      colorAxis: {
        min: 1,
        minColor: "#EEEEFF",
        maxColor: "#000022",
        stops: [
          [0, "#EFEFFF"],
          [0.67, "#4444FF"],
          [1, "#000022"],
        ],
      },
      series: [regions, baseMap],
    });
  };
  const regionSeries = generateRegionSeries(
    mapMetaData,
    ngtlRegions,
    conditionsFilter
  );
  var chart = createConditionsMap(
    regionSeries,
    baseMap,
    "container-map",
    meta,
    conditionsFilter
  );
  $("#conditions-nav-group button").on("click", function () {
    $(".btn-conditions > .btn").removeClass("active");
    $(this).addClass("active");
    var thisBtn = $(this);
    var btnText = thisBtn.text();
    var btnValue = thisBtn.val();
    $("#selectedVal").text(btnValue);
    if (btnValue !== "not-shown") {
      conditionsFilter.column = btnValue;
    }
    const regionSeries = generateRegionSeries(
      mapMetaData,
      ngtlRegions,
      conditionsFilter
    );
    chart.update({
      series: [regionSeries, baseMap],
    });
    if (conditionsFilter.column == "Closed") {
      chart.mapZoom(undefined, undefined, undefined);
    } else {
      chart.mapZoom(0.4, -1267305, -1841405);
    }

    // var chart = createConditionsMap(
    //   regionSeries,
    //   baseMap,
    //   "container-map",
    //   meta,
    //   conditionsFilter
    // );
  });
};
