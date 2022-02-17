/**
 * @file Contains all the {key: french} translations that are used to compile the English JavaScript code bundle.
 * All the HTML translations are contained in ../components/htmlText.js
 * Each object variable name and key must also appear in langEnglish.js
 * The translation functionality is split into English and French to help save on code size because only English appears in the English bundle.
 */

import Highcharts from "highcharts";
import { cerPalette } from "./util.js";
import {
  incidentsTextFra,
  trafficTrendTextFra,
  oandmTextFra,
  remediationTextFra,
} from "./dynamicText.js";

import points from "../data_output/traffic/points/fr.json";

const companyToSystem = {
  Aurora: "Pipeline Aurora",
  NGTL: "Réseau de NGTL",
  TCPL: "Réseau de TC au Canada",
  EnbridgeMainline: "Réseau d’Enbridge au Canada",
  NormanWells: "Pipeline Norman Wells",
  Bakken: "Réseau Bakken d’Enbridge",
  Express: "Pipeline Express",
  TransMountain: "Pipeline Trans Mountain",
  TQM: "Gazoduc TQM",
  TransNorthern: "Pipeline Trans-Nord",
  Keystone: "Pipeline Keystone",
  Westcoast: "Gazoduc BC d’Enbridge",
  Alliance: "Gazoduc Alliance",
  Cochin: "Pipeline Cochin",
  Foothills: "Réseau de Foothills",
  SouthernLights: "Pipeline Southern Lights",
  Brunswick: "Gazoduc Brunswick",
  Plains: "Plains Midstream Canada ULC",
  Genesis: "Pipeline Genesis",
  Montreal: "Pipeline Montréal",
  Westspur: "Pipeline Westspur",
  ManyIslands: "Many Islands Pipe Lines (Canada) Limited",
  Vector: "Gazoduc Vector",
  MNP: "Gazoduc M&NP",
};

const dashboardError = {
  title: "Erreur de tableau de bord",
  message:
    "Essayez d'actualiser la page. Veuillez envoyer un courriel à energy.markets@cer-rec.gc.ca si le problème persiste.",
};

const regionInfo = {
  ab: { c: cerPalette.Sun, n: "Alberta" },
  bc: { c: cerPalette.Forest, n: "Colombie-Britannique" },
  sk: { c: cerPalette.Aubergine, n: "Saskatchewan" },
  mb: { c: cerPalette.Ocean, n: "Manitoba" },
  on: { c: cerPalette["Night Sky"], n: "Ontario" },
  qc: { c: cerPalette.Flame, n: "Québec" },
  nb: { c: cerPalette.Forest, n: "Nouveau-Brunswick" },
  ns: { c: cerPalette["Night Sky"], n: "Nouvelle-Écosse" },
  nt: { c: cerPalette.hcLightBlue, n: "Territoires du Nord-Ouest" },
  pe: { c: cerPalette.hcRed, n: "Prince Edward Island" },
  nu: { c: cerPalette.hcPurple, n: "Nunavut" },
  yt: { c: cerPalette.hcGreen, n: "Yukon" },
};

const yesNoInfo = {
  y: { c: cerPalette.Sun, n: "Oui" },
  n: { c: cerPalette["Night Sky"], n: "Non" },
};

const units = {
  "Bcf/d": "Gpi3/j",
  "million m3/d": "millions m3/j",
  "Mb/d": "kb/j",
  "thousand m3/d": "km3/j",
  cf: "pieds cubes",
  bbl: "b",
};

const legendClick =
  "Cliquez sur un élément de légende pour le supprimer du graphique";

const locationDisclaimer = "En attente de votre position...";

const userPopUp =
  "Emplacement approximatif. Vous pouvez faire glisser ce marqueur pour explorer survenus ailleurs.";
const locationError =
  "<h4>Impossible d’accéder à votre emplacement.</h4>Activez les services de localisation de votre navigateur et actualisez la page.";

const exploreOther = (eventType) =>
  `Vous voulez explorer d’autres régions? Vous pouvez cliquer et faire glisser le marqueur de l’emplacement, puis cliquer de nouveau sur le bouton pour rechercher un ${eventType}.`;

const click = "cliquer pour voir";

const unitsDisclaimerText = (commodity) => {
  let conversionText = "";
  if (commodity === "oil") {
    conversionText =
      "Une conversion de 1 mètre cube correspondant à 6,2898 barils de pétrole est utilisée dans ce tableau de bord.";
  } else if (commodity === "gas") {
    conversionText =
      "Une conversion de 1 mètre cube correspondant à 35,3147 pieds cubes (pi³) de gaz naturel est utilisée dans ce tableau de bord.";
  }
  return conversionText;
};

const countDisclaimer = (eventType, field) =>
  `Les ${eventType} peuvent avoir plusieurs valeurs ${field}.<br>Les totaux des graphiques peuvent sembler plus élevés en raison d’une double comptabilisation.`;

/**
 * French number format.
 * @param {number} value - Input number to format.
 * @param {number} [rounding=2] - number of decimal places to round to.
 * @param {string} [thousands=" "] - Thousands seperator. Can be set to "" when eng numbers need to be fit better.
 * @returns {string} Highcharts.numberFormat(value, rounding, ",", " ");
 */
const numberFormat = (value, rounding = 2, thousands = " ") =>
  Highcharts.numberFormat(value, rounding, ",", thousands);

/**
 * French date format.
 * @param {number} value - Serialized date number.
 * @param {string} format - Date format string for month, day, year.
 * @returns {string} - Highcharts.dateFormat(format, value);
 */
const dateFormat = (value, format = "%b %d, %Y") =>
  Highcharts.dateFormat(format, value);

const barClick = (field, definition = "") =>
  `<small>${
    `${definition} ` || ""
  }Cliquer sur une bande pour consulter la définition de ${field}</small>`;

const nearbyMe = {
  rangeTitle: "Sélectionner une plage",
  findBtnTitle: (eventName) => `Rechercher les ${eventName} dans un rayon de`,
  noNearby: (eventName) =>
    `<h4>Aucun ${eventName} à proximité</h4>Essayez d’augmenter la portée de la recherche ou faites glisser le marqueur de l’emplacement pour voir les événements à proximité à un autre endroit.`,
  nearbyHeader: (numCircles, range, eventName) =>
    `Il y a ${numCircles} ${eventName} dans un rayon de ${range} km`,
};

const resetMap = "Réinitialiser la carte";

const trendYTitle = (eventName) => `Nombre de ${eventName}`;

const noEvents = {
  header: (eventName) => `Aucune donnée sur les ${eventName} disponible`,
  note(eventName, company, conditions = false) {
    if (conditions) {
      return `Aucune donnée sur les conditions n’est disponible pour ${company}. Si des données deviennent disponibles ou si des conditions sont imposées par la Commission, elles apparaîtront ici.`;
    }
    return `Il n’y a pas d’enregistrements dans les données sur les ${eventName} de la Régie pour ${company}. Si de nouveaux ${eventName} sont signalés à la Régie pour ce pipeline, ils apparaîtront ici après la mise à jour trimestrielle des données.`;
  },
};

export const frenchDashboard = {
  plains:
    "Plains Midstream Canada ULC comprend les pipelines Milk River et Wascana",

  conditions: {
    dashboardError,
    dateFormat,
    companyToSystem,
    lang: "f",
    colNames: { "In Progress": "En cours", Closed: "Remplies" },
    conditions: "conditions",
    popUpTotal: " :",
    noLocation: {
      title:
        "Certaines conditions ne sont pas liées à un emplacement géographique.",
      summary: (companyName) =>
        `Aucun résumé de l’emplacement géographique de ${companyName} :`,
    },
    title: {
      noLocation: (companyName) =>
        `Tableau de bord: ${companyName} - aucun emplacement géographique`,
      location: (companyName, column) =>
        `Tableau de bord: ${companyName} - Conditions ${column} par région`,
    },
    table: {
      projectsTitle: (column) =>
        `Projets assortis de ${column} conditions (cliquer pour ouvrir le dossier du projet dans REGDOCS*) :`,
      themesTitle: (column) =>
        `${column} Thèmes de condition (cliquer pour voir la définition du thème) :`,
      regdocsDefinition:
        "*REGDOCS est une base de données sur les activités de réglementation et opérations réglementaires menées par la Régie.",
      regdocsLink:
        "https://apps.cer-rec.gc.ca/REGDOCS/%C3%89l%C3%A9ment/Afficher/",
    },
    popUp: {
      econRegion: "Région économique",
      summary: "Sommaire des conditions :",
      lastUpdated: "Dernière mise à jour le :",
    },
    tooltip: {
      text: "Cliquer sur une région pour consulter le sommaire",
    },
    themeDefinitionsTitle: "Définitions du thème :",
    themeDefinitions: {
      "No theme specified":
        "La Régie n’a pas attribué de thème à certaines conditions.",
      "n/a": "La Régie n’a pas attribué de thème à certaines conditions.",
      Administratif:
        "Conditions permettant de faire le suivi des tâches organisationnelles.",
      "Condition standard":
        "Une condition généralement imposée relativement à tous les projets approuvés.",
      "Conditions normales":
        "Une condition généralement imposée relativement à tous les projets approuvés.",
      "Disposition de temporisation":
        "Conditions visant à s’assurer que les projets sont entrepris dans un délai précis.",
      Exécution:
        "Conditions venant renforcer les exigences réglementaires prescrites.",
      Financier:
        "Conditions dont le respect nécessite la présentation de certains détails concernant tous les aspects des obligations financières d’une société.",
      "Gestion de l’intégrité":
        "Conditions visant à s’assurer que les projets sont conçus, construits, exploités et entretenus de manière sécuritaire et efficace (utilisation de matériaux appropriés, détection de la corrosion, etc.).",
      "Gestion de la sécurité":
        "Conditions visant à éliminer ou à réduire le risque pour le public, les travailleurs, l’environnement et les biens.",
      "Gestion des situations d’urgence":
        "Conditions visant à s’assurer que les sociétés disposent d’un solide programme de prévention des incidents qui permet de gérer et d’atténuer certaines situations en cas d’urgence.",
      "Prévention des dommages":
        "Conditions visant à tenir les sociétés responsables du déroulement sécuritaire des activités à proximité des pipelines et des installations.",
      "Protection de l’environnement":
        "Conditions visant à s’assurer que la planification, la construction, l’exploitation ou la cessation d’exploitation des projets seront effectuées dans le respect de l’environnement.",
      Socioéconomique:
        "Conditions visant à répondre aux préoccupations des propriétaires fonciers, des résidents, des collectivités et des groupes autochtones susceptibles d’être touchés, etc.",
      Sûreté:
        "Conditions visant à s’assurer que les sociétés disposent du personnel voulu et des systèmes adéquats pour contrer les menaces à la sûreté, y répondre et les gérer",
      "Système de gestion":
        "Conditions particulières imposées à une société afin de s’assurer qu’une démarche efficace est utilisée pour gérer et réduire le risque. Remarque : un système de gestion n’est pas propre à un projet.",
    },
    noEvents,
  },
  incidents: {
    dashboardError,
    dynamicText: incidentsTextFra,
    companyToSystem,
    title: (systemName) =>
      `Tableau de bord: ${systemName} - Incidents entraînant un rejet de produit`,
    definitions: {
      s: {
        c: "La Régie a terminé l’examen de l’incident et a clos le dossier.",
        s: "La société a fourni tous les renseignements exigés et la Régie examine ce qui s’est produit.",
        is: "La société a informé la Régie qu’un incident était survenu et a fourni les renseignements préliminaires sur celui-ci. Une enquête est en cours.",
      },
      what: {
        dd: " Défectuosité au niveau des matériaux ou des processus de fabrication et détérioration attribuable à des dommages, au dépassement de la durée de vie utile, à l’absence d’inspection ou à un manque d’entretien.",
        cc: "Corrosion externe ou fissuration du revêtement, en raison de dommages ou d’une défaillance, fissuration au niveau des soudures attribuable à des problèmes de contrainte ou de fabrication et corrosion interne due à la présence de contaminants dans les produits.",
        ef: "Défaillance d’une des composantes de l’équipement associées au pipeline comme, par exemple, les vannes, l’alimentation électrique ou les systèmes de contrôle.",
        io: "En général, le personnel ne respecte pas les marches à suivre ou utilise l’équipement d’une manière non appropriée.",
        ei: "Activités extérieures à l’origine de dommages au pipeline ou à ses composantes comme, par exemple, des travaux d’excavation ou du vandalisme.",
        nfd: "Dommages pouvant être causés, par exemple, par un tremblement de terre, un glissement de terrain ou l’érosion.",
        oc: "Toutes les autres causes ou lorsqu’il est impossible de déterminer les circonstances de l’incident.",
        tbd: "L’incident est à l’étude.",
      },
      why: {
        ep: "Défaillances au niveau de l’évaluation, de la planification ou de la surveillance pouvant être en rapport avec le caractère non approprié des données techniques, des critères de conception, de l’évaluation de changements ou de la mise en œuvre de contrôles.",
        m: "Entretien préventif inadéquat ou réparations mal effectuées ainsi qu’usure et détérioration excessives.",
        ip: "Problèmes au niveau des achats, de la manutention des matériaux, de leur transport ou de leur entreposage.",
        te: "Outils et équipement qui ne permettent pas d’accomplir la tâche voulue ou dont l’utilisation n’est pas appropriée.",
        sp: "Élaboration, communication, mise à jour ou surveillance inadéquates des normes et procédures",
        fc: "Perte de contact avec des dispositifs automatisés, de l’équipement ou des personnes.",
        is: "Manque de surveillance d’un entrepreneur ou d’un employé pendant les travaux, qu’ils soient de construction ou d’entretien.",
        hf: "Facteurs liés à la conduite ou aux capacités d’une personne, qui peuvent par ailleurs être physiques ou psychologiques.",
        ef: "Conditions relatives à l’environnement ou au milieu naturel.",
        tbd: "L’incident est à l’étude.",
      },
    },
    dashboard: {
      numberFormat,
      legendClick,
      userPopUp,
      locationError,
      barClick,
      locationDisclaimer,
      countDisclaimer,
      resetMap,
      eventName: "incidents",
      exploreOther,
      cf: units.cf,
      bbl: units.bbl,
      pillTitles: {
        titles: {
          vol: "Estimation du volume",
          sub: "Substance",
          p: "Province",
          s: "Situation Régie",
          y: "Année",
          what: "Incident",
          why: "Pourquoi",
        },
        click,
      },
      volumeDisclaimer:
        "La taille de la bulle illustre l’estimation relative du volume du rejet en mètres cubes et n’indique pas la zone visée par le celui-ci.",
      gasRelease: "Estimation du volume de gaz rejeté:",
      liquidRelease: "Estimation du volume de liquide déversé:",
      otherRelease: "Estimation du rejet (divers):",
      nearbyHeader: nearbyMe.nearbyHeader,
      noNearby: nearbyMe.noNearby,
      rangeTitle: nearbyMe.rangeTitle,
      findBtnTitle: nearbyMe.findBtnTitle("incidents"),
      trendYTitle,
      seriesInfo: {
        sub: {
          pro: { c: cerPalette.Forest, n: "Propane" },
          ngsweet: { c: cerPalette.Flame, n: "Gaz Naturel - non sulfureux" },
          ngsour: { c: cerPalette["Dim Grey"], n: "Gaz naturel - sulfureux" },
          fgas: { c: cerPalette.hcGreen, n: "Gaz combustible" },
          loil: { c: cerPalette.hcPurple, n: "Huile lubrifiante" },
          cosweet: { c: cerPalette.Sun, n: "Pétrole brut non sulfureux" },
          sco: { c: cerPalette.Forest, n: "Pétrole brut synthétique" },
          cosour: { c: cerPalette["Dim Grey"], n: "Pétrole brut sulfureux" },
          ngl: { c: cerPalette["Night Sky"], n: "Liquides de gaz naturel" },
          co: { c: cerPalette.Ocean, n: "Condensat" },
          diesel: { c: cerPalette.hcRed, n: "Carburant diesel" },
          gas: { c: cerPalette.Flame, n: "Essence" },
          Other: { c: cerPalette.Aubergine, n: "Autre" },
        },
        s: {
          is: { c: cerPalette.Flame, n: "Initialement soumis" },
          c: { c: cerPalette["Cool Grey"], n: "Fermé" },
          s: { c: cerPalette.Ocean, n: "Soumis" },
        },
        p: regionInfo,
        why: {
          sp: { c: cerPalette.Flame, n: "Normes et procédures" },
          te: { c: cerPalette.Forest, n: "Outils et équipement" },
          m: { c: cerPalette["Night Sky"], n: "Entretien" },
          hf: { c: cerPalette.Ocean, n: "Facteurs humains" },
          ep: { c: cerPalette.Sun, n: "Ingénierie et planification" },
          ef: {
            c: cerPalette.hcAqua,
            n: "Forces de la nature ou environnement",
          },
          tbd: { c: cerPalette["Cool Grey"], n: "À déterminer" },
          ip: { c: cerPalette.Aubergine, n: "Approvisionnement inadéquat" },
          is: { c: cerPalette["Dim Grey"], n: "Supervision insuffisante" },
          fc: { c: cerPalette.hcPink, n: "Problème de communication" },
        },
        what: {
          cc: { c: cerPalette.Aubergine, n: "Corrosion et fissuration" },
          dd: {
            c: cerPalette["Cool Grey"],
            n: "Défectuosité et détérioration",
          },
          ef: { c: cerPalette["Dim Grey"], n: "Défaillance d’ équipement" },
          nfd: { c: cerPalette.Flame, n: "Forces de la nature" },
          oc: { c: cerPalette.Forest, n: "Autres causes" },
          io: { c: cerPalette["Night Sky"], n: "Erreur d’ exploitation" },
          ei: { c: cerPalette.Ocean, n: "Interférences extérieures" },
          tbd: { c: cerPalette.Sun, n: "À déterminer" },
        },
      },
    },
    noEvents,
  },
  traffic: {
    dashboardError,
    unitsDisclaimerText,
    units,
    points,
    dynamicText: trafficTrendTextFra,
    numberFormat,
    total: "Le total",
    directions: {
      n: "nord",
      e: "est",
      s: "sud",
      w: "ouest",
      ne: "nord-est",
      nw: "nord-ouest",
      se: "sud-est",
      sw: "sud-ouest",
    },
    fiveYr: {
      lastYrName: (lastYear) => `Débit ${lastYear} (dernière année de données)`,
      avgName: "Moyenne sur cinq ans",
      rangeName: (min, max) => `Plage de cinq ans (${min + 1}-${max - 1})`,
      notEnough: "Données insuffisantes pour calculer la moyenne sur cinq ans",
    },
    exportAxis: (unit) => `Exportations (${unit})`,
    importAxis: (unit) => `Importations (${unit})`,
    fiveYrTitle: (pointText) =>
      `${pointText} - période de cinq ans et fourchette`,
    trafficTitle: (pointText, dirText, frequency = "m") => {
      const freqLookup = { m: "mensuel", q: "trimestriel" };
      if (dirText[0] === false || dirText[0] !== "") {
        return `${pointText} - transport ${freqLookup[frequency]}`;
      }
      return `${pointText} - transport ${
        freqLookup[frequency]
      } (sens d’écoulement : ${dirText.join(" et ")})`;
    },
    series: {
      im: "Importation",
      in: "Intra-Canada",
      ex: "Exportation",
      cap: "Capacité",
      dh: "Lourd canadien",
      dln: "Léger canadien / NGL",
      fl: "Léger étranger",
      dl: "Léger Canadien",
      rp: "Produits Pétroliers Raffinés",
      co: "Condensat",
      ecap: "Capacité Exportation",
      icap: "Capacité Importation",
      msm: "Brut Westspur Midale (« MSM »)",
      ses: "Brut Southeast Sask (« SES »)",
      pet: "Pétrole",
      ngl: "Liquides de gaz naturel",
      dic: "Diluant (souscrit)",
      diu: "Diluant (non souscrit)",
      agg: "FR: aggregate of heavy, medium, light crude petroleum",
    },
    util: "Utilisation",
    months: {
      1: "janv",
      2: "févr",
      3: "mars",
      4: "avr",
      5: "mai",
      6: "juin",
      7: "juil",
      8: "aout",
      9: "sept",
      10: "oct",
      11: "nov",
      12: "déc",
    },
    annualTitle: "Débit annuel moyen :",
  },
  apportion: {
    dashboardError,
    unitsDisclaimerText,
    units,
    points,
    numberFormat,
    title: {
      enbridge:
        "Nombre total de commandes originales et nombre total de commandes acceptées sur le réseau",
      other: "Répartition à :",
    },
    keyPtTitle: "Répartition aux points principaux",
    series: {
      an: "Commandes acceptées",
      on: "Commandes d’expédition initiales",
      ac: "Capacité disponible",
      ap: "Pourcentage de répartition",
    },
  },
  oandm: {
    dashboardError,
    numberFormat,
    legendClick,
    companyToSystem,
    dynamicText: oandmTextFra,
    eventName: "activités d’exploitation et d’entretien",
    title: (pipeline) =>
      `Tableau de bord : ${pipeline} - Activités d’exploitation et d’entretien par année`,
    trendYTitle,
    lang: "f",
    pillTitles: {
      titles: {
        id: "Fouille d’intégrité",
        fp: "Présence de poissons",
        is: "Travaux dans un cours d’eau requis",
        sr: "Présence d’espèces en péril",
        p: "Province ou territoire",
      },
    },
    seriesInfo: {
      id: yesNoInfo,
      fp: yesNoInfo,
      is: yesNoInfo,
      sr: yesNoInfo,
      p: regionInfo,
    },
    definitions: {
      id: "Indique l’activité si elle consiste en des travaux d’excavation pour mettre à découvert, examiner ou réparer un pipeline.",
      fp: "Indique si l’activité prévoit-elle la perturbation du sol à l’aide d’un équipement motorisé à moins de 30 mètres d’une zone humide ou d’un plan d’eau ou à moins de 30 mètres du substratum d’un plan d’eau ou d’une zone humide au site d’activité et si le cours d’eau est poissonneux?",
      is: "Indique s’il y aura des travaux dans un cours d’eau sur le site de l’activité.",
      sr: "Indique s’il y a des espèces en péril répertoriées à l’annexe 1 de la <i>Loi sur les espèces en péril</i>.",
    },
    noEvents,
  },
  remediation: {
    dashboardError,
    numberFormat,
    dateFormat,
    companyToSystem,
    title: (company) =>
      `Tableau de bord : ${company} - Sites contaminés (après le 15 août 2018)`,
    dynamicText: remediationTextFra,
    dashboard: {
      userPopUp,
      numberFormat,
      exploreOther,
      locationError,
      legendClick,
      countDisclaimer,
      barClick,
      locationDisclaimer,
      resetMap,
      volumeDisclaimer:
        "La taille des bulles illustre l’emplacement approximative du site, mais n’indique pas la totalité de la zone contaminée",
      eventName: "Sites contaminés",
      trendYTitle,
      cf: units.cf,
      bbl: units.bbl,
      noNearby: nearbyMe.noNearby,
      rangeTitle: nearbyMe.rangeTitle,
      findBtnTitle: nearbyMe.findBtnTitle("sites"),
      nearbyHeader: nearbyMe.nearbyHeader,
      mapClick:
        "Cliquez sur le cercle pour ouvrir la recherche<br>REGDOCS pour",
      regdocsLink: "https://apps.cer-rec.gc.ca/REGDOCS/Recherche/Index/?txthl=",
      pillTitles: {
        titles: {
          vol: "Estimation initiale du volume de sol contaminé",
          w: "À moins de 30 m d’un plan d’eau",
          use: "Utilisation des terres applicable",
          p: "Province",
          a: "Activité au moment de la découverte",
          c: "Catégorie de contaminants",
          ps: "Pipeline ou installation",
          s: "État du site",
          y: "Année",
        },
        click,
      },
      seriesInfo: {
        ps: {
          p: { n: "Pipeline", c: cerPalette["Night Sky"] },
          f: { n: "Installation", c: cerPalette.Ocean },
          pf: { n: "Pipeline et installation", c: cerPalette.Flame },
          ns: { n: "Non fournie", c: cerPalette["Dim Grey"] },
        },
        w: {
          true: { c: cerPalette.Sun, n: "Vrai" },
          false: { c: cerPalette["Night Sky"], n: "Faux" },
          null: { c: cerPalette["Dim Grey"], n: "Non fournie" },
        },
        s: {
          prm: {
            c: cerPalette.Forest,
            n: "Après la surveillance de l'assainissement",
          },
          null: { c: cerPalette["Dim Grey"], n: "Non fournie" },
          rm: { c: cerPalette.Ocean, n: "Gestion du risque" },
          sa: { c: cerPalette.Aubergine, n: "Évaluation du site" },
          fm: { c: cerPalette.hcBlue, n: "Surveillance des installations" },
          or: { c: cerPalette["Cool Grey"], n: "Mesures correctives" },
          m: { c: cerPalette.Sun, n: "Surveillance" },
        },
        p: regionInfo, // Province
        use: {
          dli: {
            c: cerPalette["Cool Grey"],
            n: "Terrain aménagé - Industriel",
          },
          dls: {
            c: cerPalette["Night Sky"],
            n: "Terrain aménagé - Petit commerce",
          },
          dlr: {
            c: cerPalette.Aubergine,
            n: "Terrain aménagé - Résidentiel",
          },
          bl: { c: cerPalette.Sun, n: "Toundra" },
          sl: { c: cerPalette.hcAqua, n: "Terrain arbustif" },
          vb: { c: cerPalette.hcRed, n: "Steppe" },
          f: { c: cerPalette.hcGreen, n: "Forêts" },
          ac: { c: cerPalette.hcPink, n: "Terres agricoles/cultivées" },
          w: { c: cerPalette.hcLightBlue, n: "Eau/terres humides" },
          t: {
            c: cerPalette.hcPurple,
            n: "Toundra/Prairie/Parc",
          },
          al: { c: cerPalette.Ocean, n: "Terres agricoles" },
          pa: { c: cerPalette.Forest, n: "Aire protégée" },
          ndl: { c: cerPalette.Flame, n: "Terrain non mis en valeur" },
          null: { c: cerPalette["Dim Grey"], n: "Non fournie" },
        },
        a: {
          m: { c: cerPalette["Night Sky"], n: "Entretien" },
          o: { c: cerPalette.Flame, n: "Exploitation" },
          c: { c: cerPalette.Ocean, n: "Construction" },
          a: { c: cerPalette.Aubergine, n: "Cessation d'exploitation" },
          null: { c: cerPalette["Dim Grey"], n: "Non fournie" },
        },
        c: {
          1: { n: "Autre" },
          2: { n: "Hydrocarbures pétroliers (« HCP »)" },
          3: { n: "Hydrocarbures aromatiques polycycliques (« HAP »)" },
          4: { n: "Benzène, toluène, ethylbenzène et xylène (« BTEX »)" },
          5: {
            n: "Composés organiques volatils (« COV ») autres que les BTEX",
          },
          6: { n: "Composés organiques semi-volatils" },
          7: { n: "Sels" },
          8: { n: "Éther tert-butylique méthylique (« ETBM »)" },
          9: { n: "Biphényles polychlorés (« BPC »)" },
          10: { n: "Métaux" },
          11: { n: "Glycol" },
          12: { n: "Amine" },
          13: { n: "Phénols" },
          14: { n: "Soufre" },
          15: { n: "Pesticides et herbicides" },
          16: { n: "Liquide immiscible léger" },
          17: { n: "Liquide immiscible dense" },
          18: { n: "Non fournie" },
        },
      },
      definitions: {
        s: {
          definition: "Degré d’avancement des activités d’assainissement.",
          prm: "Travaux d’assainissement actifs terminés et surveillance des eaux souterraines ou de la remise en état en vigueur.",
          null: "Non fournie",
          rm: "Plan de gestion des risques soumis ou mis en œuvre",
          sa: "Évaluation environnementale du site en cours pour déterminer les prochaines étapes avant les travaux d’assainissement ou de gestion des risques.",
          fm: "Utiliser ce statut pour les installations où un programme de surveillance des eaux souterraines est en place, tel qu’il est décrit à la section 7.2 de l’ébauche de 2019 du Guide sur le processus d’assainissement.",
          or: "Plan d’assainissement soumis ou travaux d’assainissement en cours.",
        },
        a: "Indique l’activité entreprise au moment de la découverte de la contamination.",
        ps: "Indique si la contamination a été découverte le long du pipeline sur l’emprise ou dans une installation (p. ex., une station ou un terminal).",
        c: "Type de contaminants relevés au moment du dépôt de l’avis de contamination.",
      },
    },
    noEvents,
  },
  tolls: {
    dashboardError,
    numberFormat,
    companyToSystem,
    noEvents,
    eventName: "FR: tolls",
    lang: "f",
    dashboard: {
      tooltip: {
        toll: "FR: Toll :",
        path: "FR: Path :",
        product: "FR: Product :",
        service: "FR: Service:",
      },
      filters: {
        product: "FR: Select product :",
        path: "FR: Select path :",
        service: "FR: Select service :",
      },
      yAxis: "FR: Toll",
      splitDescription: "FR: Toll Description",
      pathDisclaimer: (thisPaths, totalPaths) =>
        `<p>FR: There are <strong>${thisPaths}</strong> tolls paths shown for this system. Take a look at the Open Government dataset for information on all <strong>${totalPaths}</strong> available system paths.</p>`,
    },
  },
  tcplRevenues: {
    dateFormat,
    numberFormat,
  },
};
