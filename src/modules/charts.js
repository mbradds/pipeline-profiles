import { cerPalette } from "./util.js";

export const errorChart = (div) => {
  console.log("Error loading chart to div: " + div);
  return new Highcharts.chart(div, {
    chart: {
      zoomType: "x",
      borderWidth: 1,
    },
    title: {
      text: "",
    },
    credits: {
      text: "",
    },
    series: null,
    lang: {
      noData: "Error loading chart. Please try again later.",
    },
  });
};
