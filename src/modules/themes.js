import { cerPalette } from "./util.js";
export const generalTheme = () => {
  Highcharts.profiles = {
    chart: {
      animation: true,
    },
    plotOptions: {
      column: {
        stacking: "normal",
      },
    },

    xAxis: {
      title: {
        style: {
          fontSize: 12,
          color: cerPalette["Cool Grey"],
          fontWeight: "bold",
          fontFamily: "Arial",
        },
      },
      labels: {
        style: {
          fontSize: 12,
          color: cerPalette["Cool Grey"],
        },
      },
    },

    yAxis: {
      title: {
        style: {
          fontSize: 12,
          color: cerPalette["Cool Grey"],
          fontWeight: "bold",
          fontFamily: "Arial",
        },
      },
      labels: {
        formatter: function () {
          return Highcharts.numberFormat(this.value, 0, ".", ",");
        },
        style: {
          fontSize: 12,
          color: cerPalette["Cool Grey"],
        },
      },
      stackLabels: {
        style: {
          fontWeight: "bold",
          color: (Highcharts.theme && Highcharts.theme.textColor) || "grey",
        },
      },
    },

    legend: {
      itemStyle: {
        fontSize: "15px",
      },
    },

    credits: {
      text: "",
    },

    title: {
      text: "",
    },
  };

  Highcharts.setOptions(Highcharts.profiles);
};
