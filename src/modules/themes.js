import { profileAssist as pa } from "./util.js";
export const generalTheme = () => {
  Highcharts.transportation = {
    chart: {
      borderColor: "black",
      animation: true,
    },

    plotOptions: {
      column: {
        stacking: "normal",
      },
      area: {
        stacking: "normal",
        marker: false,
        dataLabels: {
          enabled: false,
        },
      },
    },

    xAxis: {
      title: {
        style: {
          fontSize: 12,
          color: pa.cerPalette["Cool Grey"],
          fontWeight: "bold",
          fontFamily: "Arial",
        },
      },
      labels: {
        style: {
          fontSize: 12,
          color: pa.cerPalette["Cool Grey"],
        },
      },
      plotBands: {
        color: pa.cerPalette["Forecast"],
        label: {
          align: "center",
          style: {
            fontWeight: "bold",
            color: pa.cerPalette["Cool Grey"],
          },
        },
      },
    },

    yAxis: {
      title: {
        style: {
          fontSize: 12,
          color: pa.cerPalette["Cool Grey"],
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
          color: pa.cerPalette["Cool Grey"],
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

    noData: {
      style: {
        fontWeight: "bold",
        fontSize: "15px",
        color: "#303030",
      },
    },

    title: {
      text: "",
    },
  };

  Highcharts.setOptions(Highcharts.transportation);
};
