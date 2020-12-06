import ngtlRegions from "./NOVA Gas Transmission Ltd.json";
import canadaMap from "../conditions_data/base_map.json";
import mapMetaData from "./NOVA Gas Transmission Ltdmeta.json";
import { cerPalette } from "../../modules/util";
export const ngtlConditionsMap = () => {
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
    if (chart.customTooltip) {
      // destroy the old one when rendering new
      chart.customTooltip.destroy();
      chart.customTooltip = undefined;
    }
  };

  const createConditionsMap = (regions, baseMap, container) => {
    return new Highcharts.mapChart(container, {
      chart: {
        borderColor: "black",
        borderWidth: 1,
        animation: true,
        events: {
          load: function () {
            this.mapZoom(0.4, 4450286, -2300000);
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
            destroyInsert(this);
          },
          //   redraw: function () {
          //     console.log("x: ", this.xAxis[0].getExtremes());
          //     console.log("y: ", this.yAxis[0].getExtremes());
          //   },
        },
      },
      credits: {
        text: "",
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
                text += `<p>${this.properties["Short Project Name"]}</p>`;
                text += `<i>Active Condition Themes:</i>`;
                text += `<p>${this.properties["Themes"]}</p>`;
                text += `<i>Features Coming Soon:</i>`;
                text += `<table> <tr><td><li>Projects/Themes sorted by number of conditions</li></td></tr>`;
                text += `<table> <tr><td><li>Projects hyperlinked to appropriate REGDOCS page</li></td></tr>`;
                text += `<table> <tr><td><li>Pipeline shape file overlayed on regions</li></td></tr>`;
                text += `<table> <tr><td><li>Total NGTL Summary info boxes above chart</li></td></tr>`;
                text += `</table><br>`;

                const chart = this.series.chart;
                destroyInsert(chart);
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
