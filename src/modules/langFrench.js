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
} from "./dynamicText.js";

import points from "../data_output/traffic/points/fr.json";

const companyToSystem = {
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
  y: { c: cerPalette.Sun, n: "Yes" },
  n: { c: cerPalette["Night Sky"], n: "No" },
};

const units = {
  "Bcf/d": "Gpi3/j",
  "million m3/d": "millions m3/j",
  "Mb/d": "kb/j",
  "thousand m3/d": "km3/j",
};

const legendClick =
  "Cliquez sur un élément de légende pour le supprimer du graphique";

const userPopUp =
  "Emplacement approximatif. Vous pouvez faire glisser ce marqueur pour explorer survenus ailleurs.";
const locationError =
  "<h4>Impossible d’accéder à votre emplacement.</h4>Activez les services de localisation de votre navigateur et actualisez la page.";

const exploreOther = (eventType) =>
  `Vous voulez explorer d’autres régions? Vous pouvez cliquer et faire glisser le marqueur de l’emplacement, puis cliquer de nouveau sur le bouton pour rechercher ${eventType}.`;

const click = "clique pour voir";

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
  `${eventType} peuvent avoir plusieurs valeurs ${field}.<br>Les totaux des graphiques peuvent sembler plus élevés en raison d’une double comptabilisation.`;

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
    },
    popUp: {
      econRegion: "Région économique",
      summary: "Sommaire des conditions :",
      lastUpdated: "Dernière mise à jour le :",
    },
    instructions: {
      header: "Instructions liées à la carte :",
      line1:
        "Cliquer sur une région pour consulter les renseignements sur les conditions.",
      line2:
        "Cliquer sur la carte à l’extérieur des régions pour masquer l’information.",
      disclaimer:
        "Certaines conditions s’appliquent à plusieurs régions. Certaines conditions peuvent être comptées en double d’une région à l’autre, ce qui donne un nombre plus élevé de conditions que les totaux indiqués dans les boutons ci-dessus.",
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
    noConditions: {
      header: "Aucune donnée disponible sur les conditions",
      note: (companyName) =>
        `Aucune donnée sur les conditions n’est disponible pour ${companyName}. Si des données deviennent disponibles ou si des conditions sont imposées par la Commission, elles apparaîtront ici.`,
    },
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
      exploreOther: exploreOther("un incident"),
      cf: "pieds cubes",
      bbl: "b",
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
      locationDisclaimer: "En attente de votre position...",
      countDisclaimer,
      countDisclaimerEvent: "Les incidents",
      nearbyHeader: (numCircles, range) =>
        `Il y a ${numCircles} incidents dans un rayon de ${range} km`,
      gasRelease: "Estimation du volume de gaz rejeté:",
      liquidRelease: "Estimation du volume de liquide déversé:",
      otherRelease: "Estimation du rejet (divers):",
      noNearby: (eventType) =>
        `<h4>Aucun ${eventType} à proximité</h4>Essayez d’augmenter la portée de la recherche ou faites glisser le marqueur de l’emplacement pour voir les événements à proximité à un autre endroit.`,
      barClick: (field) =>
        `<p>Cliquer sur une bande pour consulter la définition de ${field}</p>`,

      rangeTitle: "Sélectionner une plage",
      findBtnTitle: "Rechercher les incidents dans un rayon de",
      trendYTitle: "Nombre d’incidents",
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
    noIncidents: {
      header: "Aucune donnée sur les incidents disponible",
      note: (companyName) =>
        `Il n’y a pas d’enregistrements dans les données sur les incidents de la Régie pour ${companyName}. Si de nouveaux incidents sont signalés à la Régie pour ce pipeline, ils apparaîtront ici après la mise à jour trimestrielle des données.`,
    },
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
    title: (pipeline) => `Dashboard: ${pipeline} - O&M Activites by Year`,
    trendYTitle: "Number of Events",
    pillTitles: {
      titles: {
        id: "FR: Integrity Dig?",
        fp: "FR: Fish Present?",
        is: "FR: In Stream Work Required?",
        sr: "FR: Species At Risk Present?",
        p: "FR: Province/Territory",
      },
    },
    noEvents: {
      header: `No O&M data available`,
      note: (company) => `There are no O&M activities reported for ${company}`,
    },
    seriesInfo: {
      id: yesNoInfo,
      fp: yesNoInfo,
      is: yesNoInfo,
      sr: yesNoInfo,
      p: regionInfo,
    },
    definitions: {
      id: "FR: Indicates if the activity includes excavation to expose, assess, or repair an existing pipeline.",
      fp: "FR: Indicates if there will be ground disturbance using power-operated equipment within 30M of a wetland or a water body or within 30M of the substrate of a wetland or water body at the activity site, and the water body is fish-bearing.",
      is: "FR: Indicates if there will be any in-stream work at activity site.",
      sr: "FR: Indicates if there are species present which are listed on schedule 1 of the Species At Risk Act at the activity site.",
    },
  },
  remediation: {
    dashboardError,
    numberFormat,
    dateFormat,
    companyToSystem,
    title: (company, cutoffDate) =>
      `Dashboard: ${company} - Contaminated Sites (post ${cutoffDate})`,
    dashboard: {
      userPopUp,
      numberFormat,
      exploreOther: exploreOther("events"),
      locationError,
      legendClick,
      countDisclaimer,
      countDisclaimerEvent: "Contaminated sites (FR)",
      trendYTitle: "Number of Contaminated Sites",
      cf: "cubic feet",
      bbl: "bbl",
      volumeDisclaimer: undefined,
      locationDisclaimer: undefined,
      rangeTitle: "Sélectionner une plage",
      findBtnTitle: "Rechercher les sites dans un rayon de",
      nearbyHeader: (numCircles, range) =>
        `There are ${numCircles} contaminated sites within ${range} km`,
      noNearby: () =>
        `<h4>No nearby contaminated sites</h4>Try increasing the search range, or drag your location marker to see nearby events at a different location.`,
      pillTitles: {
        titles: {
          vol: "FR: Initial estimate of contaminated soil",
          w: "FR: Within 30M of water-body",
          use: "FR: Applicable Land Use",
          p: "FR: Province",
          a: "FR: Activity at time of discovery",
          c: "FR: Contaminants at the Site",
          ps: "FR: Pipeline or Facility?",
          s: "FR: Site Status",
          y: "FR: Year",
        },
        click,
      },
      seriesInfo: {
        w: {
          true: { c: cerPalette.Sun, n: "True" },
          false: { c: cerPalette["Night Sky"], n: "False" },
          null: { c: cerPalette["Dim Grey"], n: "Not provided" },
        },
        s: {
          prm: {
            c: cerPalette.Forest,
            n: "après la surveillance de l'assainissement",
          },
          null: { c: cerPalette["Dim Grey"], n: "Not provided" },
          rm: { c: cerPalette.Ocean, n: "Gestion du risque" },
          sa: { c: cerPalette.Aubergine, n: "évaluation du site" },
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
          ndl: { c: cerPalette.Flame, n: "Non-developed Land" },
          null: { c: cerPalette["Dim Grey"], n: "Not provided" },
        },
        a: {
          m: { c: cerPalette["Night Sky"], n: "Entretien" },
          o: { c: cerPalette.Flame, n: "Exploitation" },
          c: { c: cerPalette.Ocean, n: "Construction" },
          a: { c: cerPalette.Aubergine, n: "Cessation d'exploitation" },
          null: { c: cerPalette["Dim Grey"], n: "Not Provided" },
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
          18: { n: "Not Provided" },
        },
      },
    },
    noEvents: {
      header: `FR: No Contaminated Sites Data`,
      note: (company) =>
        `FR: There are no reported contaminated sites for ${company}`,
    },
  },
  tolls: {
    dashboardError,
    numberFormat,
    companyToSystem,
    noTolls: {
      header: "Tolls data not available",
      note: (companyName) =>
        `Tolls information for ${companyName} may be available in REGDOCS.`,
    },
  },
};
