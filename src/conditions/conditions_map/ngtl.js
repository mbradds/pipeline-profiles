import ngtlRegions from "./NOVA Gas Transmission Ltd.json";
import canadaMap from "../conditions_data/base_map.json";
import mapMetaData from "./NOVA Gas Transmission Ltdmeta.json";
import { cerPalette } from "../../modules/util";
import meta from "./meta.json";

console.log(meta.summary);

export const ngtlConditionsMap = () => {
  const fillSummary = (summary) => {
    document.getElementById("in-progress-summary").innerText =
      summary["In Progress"];
    document.getElementById("closed-summary").innerText = summary.Closed;
    document.getElementById("no-location-summary").innerText = summary.notOnMap;
  };

  fillSummary(meta.summary);

  const regionSeries = {
    name: "NGTL Conditions",
    data: mapMetaData,
    mapData: Highcharts.geojson(ngtlRegions),
    joinBy: ["ERNAME", "id"],
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

  const createConditionsMap = (regions, baseMap, container) => {
    return new Highcharts.mapChart(container, {
      chart: {
        //borderColor: "black",
        panning: false,
        //borderWidth: 1,
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
                var text = `<p><b>${this.id} Economic Region</b></p>`;
                text += `<i>Conditions Summary:</i>`;
                text += `<table> <tr><td><li> Last Updated on:</td><td style="padding:0"><b>&nbspComing Soon!</li></b></td></tr>`;
                text += `<tr><td><li> In-Progress Conditions:</td><td style="padding:0"><b>&nbsp${this.value}</li></b></td></tr>`;
                text += `<tr><td><li> Closed Conditions:</td><td style="padding:0"><b>&nbspComing Soon!</li></b></td></tr>`;
                text += `</table><br>`;
                text += `<i>Projects with In-Progress Conditions:</i>`;
                //text += `<a href="https://www.cer-rec.gc.ca/en/data-analysis/index.html" target="_blank">Get A Stick!</a>`;
                text += `<p>${this["Short Project Name"]}</p>`;
                text += `<i>Active Condition Themes:</i>`;
                text += `<p>${this["Themes"]}</p>`;
                text += `<i>Features Coming Soon:</i>`;
                text += `<table> <tr><td><li>Projects/Themes sorted # of conditions</li></td></tr>`;
                text += `<table> <tr><td><li>Projects hyperlinked to REGDOCS</li></td></tr>`;
                text += `<table> <tr><td><li>Shape file on top of regions</li></td></tr>`;
                text += `<table> <tr><td><li>Total Summary info boxes above chart</li></td></tr>`;
                text += `</table>`;

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
                    //fill: "rgb(247, 247, 247)",
                  })
                  .add(chart.rGroup);
                chart.customTooltip = label;
                label.align(
                  Highcharts.extend(label.getBBox(), {
                    align: "right",
                    x: 0, // offset
                    verticalAlign: "top",
                    overflow: "scroll",
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
        useHTML: true,
        formatter: function () {
          let toolText = `<b>${this.point.ERNAME} - ${this.point.properties.PRNAME}</b>`;
          toolText += `<table> <tr><td> Number of In Progress Conditions:</td><td style="padding:0"><b>${this.point.properties.value}</b></td></tr>`;
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
  var chart = createConditionsMap(regionSeries, baseMap, "container-map");
};
