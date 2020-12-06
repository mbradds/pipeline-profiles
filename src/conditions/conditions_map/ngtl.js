import ngtlRegions from "./NOVA Gas Transmission Ltd.json";
import canadaMap from "../conditions_data/base_map.json";
import mapMetaData from "./NOVA Gas Transmission Ltdmeta.json";
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

  const createConditionsMap = (regions, baseMap, container) => {
    return new Highcharts.mapChart(container, {
      chart: {
        borderColor: "black",
        borderWidth: 1,
        animation: true,
        events: {
          load: function () {
            console.log(this);
            this.mapZoom(0.4, 4450286, -2300000);
          },
          //   redraw: function () {
          //     console.log("x: ", this.xAxis[0].getExtremes());
          //     console.log("y: ", this.yAxis[0].getExtremes());
          //   },
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
