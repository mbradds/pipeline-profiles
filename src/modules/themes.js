/**
 * @file Contains the highcharts theme defintions. Having a theme helps with a common look and feel, and reduces the need to
 * re-define desired highcharts parameters over and over.
 *
 * Contains a generalTheme to be applied to all profiles, and a frenchTheme.
 */

import Highcharts from "highcharts";
import NoDataToDisplay from "highcharts/modules/no-data-to-display.js";
import { cerPalette } from "./util.js";

NoDataToDisplay(Highcharts);

export const generalTheme = () => {
  Highcharts.profiles = {
    chart: {
      animation: true,
    },
    colors: Object.values(cerPalette),
    plotOptions: {
      column: {
        stacking: "normal",
      },
      area: {
        stacking: "normal",
      },
      bar: {
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
        formatter() {
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

    noData: {
      style: {
        fontWeight: "bold",
        fontSize: "15px",
        color: "#303030",
      },
    },

    credits: {
      text: "",
    },

    title: {
      text: "",
      style: {
        fontSize: "16px",
        fontWeight: "bold",
      },
    },
  };

  Highcharts.setOptions(Highcharts.profiles);
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
      shortMonths: [
        "jan",
        "fév",
        "mar",
        "avr",
        "mai",
        "juin",
        "juil",
        "aoû",
        "sep",
        "oct",
        "nov",
        "déc",
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
      resetZoom: "réinitialiser le zoom",
      noData: "aucune donnée à afficher",
    },
  };
  Highcharts.setOptions(Highcharts.french);
};
