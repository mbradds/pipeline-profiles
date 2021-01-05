import ngtlRegions from "./economicRegions.json";
import canadaMap from "../base_maps/base_map.json";
import mapMetaData from "./mapMetadata.json";
// import { cerPalette } from "../../modules/util.js";
import meta from "./summaryMetadata.json";

export const ngtlConditionsMap = () => {
  const fillSummary = (summary) => {
    document.getElementById("in-progress-summary").innerText =
      summary["In Progress"];
    document.getElementById("closed-summary").innerText = summary.Closed;
    document.getElementById("no-location-summary").innerText = summary.notOnMap;
  };

  fillSummary(meta.summary);

  const generateTable = (summary, selectedRegion, tableName) => {
    let projectsHTML = `<table class="conditions-table">`;
    if (tableName == "projects") {
      projectsHTML += `<caption style="text-align:left;">Projects with In-Progress Conditions:</caption>`;
      summary.projects.map((proj) => {
        if (proj.id == selectedRegion) {
          let regdocsLink = `https://apps.cer-rec.gc.ca/REGDOCS/Search?txthl=${proj[
            "Short Project Name"
          ].replaceAll(" ", "%20")}`;
          projectsHTML += `<tr><td><a href=${regdocsLink} target="_blank">${proj["Short Project Name"]}</a></td><td>${proj["In Progress"]}</td></tr>`;
        }
      });
    } else if (tableName == "themes") {
      projectsHTML += `<caption style="text-align:left;">Active Condition Themes:</caption>`;
      summary.themes.map((proj) => {
        if (proj.id == selectedRegion) {
          projectsHTML += `<tr><td>${proj["Theme(s)"]}</td><td>${proj["In Progress"]}</td></tr>`;
        }
      });
    }
    projectsHTML += `</table>`;
    return projectsHTML;
  };

  const regionSeries = {
    name: "NGTL Conditions",
    data: mapMetaData,
    mapData: Highcharts.geojson(ngtlRegions),
    joinBy: ["id", "id"],
    type: "map",
    zIndex: 1,
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

  const createConditionsMap = (regions, baseMap, container, meta) => {
    return new Highcharts.mapChart(container, {
      chart: {
        panning: false,
        animation: true,
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
                console.log(this)
                var text = `<div id="conditions-insert"><p style="font-size:15px; text-align:center;"><b>${this.id} Economic Region</b></p>`;
                text += `<table><caption style="text-align:left">Conditions Summary:</caption>`;
                text += `<tr><td><li> Last updated on:</td><td style="padding:0;font-style: italic;font-weight: bold;color: dimgray;">${meta.summary.updated}</li></td></tr>`;
                text += `<tr><td><li> In-Progress Conditions:</td><td style="padding:0;font-style: italic;font-weight: bold;color: dimgray;">&nbsp${this.value}</li></td></tr>`;
                text += `<tr><td><li> Closed Conditions:</td><td style="padding:0"><b>&nbspComing Soon!</li></b></td></tr>`;
                text += `</table><br>`;
                text += generateTable(meta, this.id, "projects") + "<br>";
                text += generateTable(meta, this.id, "themes");
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
  var chart = createConditionsMap(regionSeries, baseMap, "container-map", meta);
};
