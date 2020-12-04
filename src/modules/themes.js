import { cerPalette } from "./util.js";
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

    tooltip: {
      useHTML: true,
      headerFormat:
        '<span style="font-size:10px;font-weight:bold">{point.key}</span><table>',
      footerFormat: "</table>",
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
      plotBands: {
        color: cerPalette["Forecast"],
        label: {
          align: "center",
          style: {
            fontWeight: "bold",
            color: cerPalette["Cool Grey"],
          },
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

    legend: {
      itemStyle: {
        font: "12pt Arial",
        color: "black",
      },
    },
  };

  Highcharts.setOptions(Highcharts.transportation);
};

export const frenchTheme = () => {
  Highcharts.french = {
    lang: {
      months: [
        "Janvier",
        "Février",
        "Mars",
        "Avril",
        "Mai",
        "Juin",
        "Juillet",
        "Août",
        "Septembre",
        "Octobre",
        "Novembre",
        "Décembre",
      ],
      weekdays: [
        "Dimanche",
        "Lundi",
        "Mardi",
        "Mercredi",
        "Jeudi",
        "Vendredi",
        "Samedi",
      ],
      decimalPoint: ",",
      downloadCSV: "Download CSV (FRA)",
      downloadJPEG: "Download JPEG image (FRA)",
      downloadPDF: "Download PDF document (FRA)",
      downloadPNG: "Download PNG image (FRA)",
      downloadSVG: "Download SVG vector image (FRA)",
      downloadXLS: "Download XLS (FRA)",
      printChart: "Print chart (FRA)",
      resetZoom: "Reset zoom (FRA)",
      viewData: "View data table (FRA)",
    },
  };
  Highcharts.setOptions(Highcharts.french);
};
