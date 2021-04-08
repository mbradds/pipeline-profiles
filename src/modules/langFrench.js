import { cerPalette } from "./util.js";
import { incidentsTextFra, trafficTrendTextFra } from "./dynamicText.js";

const companyToSystem = {
  "NOVA Gas Transmission Ltd.": "Réseau de NGTL",
  "TransCanada PipeLines Limited": "Réseau de TC au Canada",
  "Enbridge Pipelines Inc.": "Réseau d’Enbridge au Canada",
  "Enbridge Pipelines (NW) Inc.": "Pipeline Norman Wells",
  "Enbridge Bakken Pipeline Company Inc.": "Réseau Bakken d’Enbridge",
  "Express Pipeline Ltd.": "Pipeline Express",
  "Trans Mountain Pipeline ULC": "Pipeline Trans Mountain",
  "Trans Quebec and Maritimes Pipeline Inc.": "Gazoduc TQM",
  "Trans-Northern Pipelines Inc.": "Pipeline Trans-Nord",
  "TransCanada Keystone Pipeline GP Ltd.": "Pipeline Keystone",
  "Westcoast Energy Inc.": "Gazoduc BC d’Enbridge",
  "Alliance Pipeline Ltd.": "Gazoduc Alliance",
  "PKM Cochin ULC": "Pipeline Cochin",
  "Foothills Pipe Lines Ltd.": "Réseau de Foothills",
  "Southern Lights Pipeline": "Pipeline Southern Lights",
  "Emera Brunswick Pipeline Company Ltd.": "Gazoduc Brunswick",
  "Plains Midstream Canada ULC": "Plains Midstream Canada ULC",
  "Genesis Pipeline Canada Ltd.": "Pipeline Genesis",
  "Montreal Pipe Line Limited": "Pipeline Montréal",
  "Trans-Northern Pipelines Inc.": "Pipeline Trans-Nord",
  "Kingston Midstream Westspur Limited": "Pipeline Westspur",
  "Many Islands Pipe Lines (Canada) Limited":
    "Many Islands Pipe Lines (Canada) Limited",
  "Vector Pipeline Limited Partnership": "Gazoduc Vector",
  "Maritimes & Northeast Pipeline Management Ltd.": "Gazoduc M&NP",
};

const numberFormat = (value, rounding = 2) => {
  return Highcharts.numberFormat(value, rounding, ",", " ");
};

const dateFormat = (value, format = "%b %d, %Y") => {
  return Highcharts.dateFormat(format, value);
};

export const frenchDashboard = {
  plains:
    "Plains Midstream Canada ULC comprend les pipelines Milk River et Wascana",

  conditions: {
    dateFormat: dateFormat,
    companyToSystem: companyToSystem,
    colNames: { "In Progress": "En cours", Closed: "Remplies" },
    conditions: "conditions",
    noLocation: {
      title:
        "Certaines conditions ne sont pas liées à un emplacement géographique.",
      summary: (companyName) => {
        return `Aucun résumé de l’emplacement géographique de ${companyName}:`;
      },
    },
    title: {
      noLocation: (companyName) => {
        return `Tableau de bord: ${companyName} - aucun emplacement géographique`;
      },
      location: (companyName, column) => {
        return `Tableau de bord: ${companyName} - ${column} Conditions par région`;
      },
    },
    table: {
      projectsTitle: (column) => {
        return `Projets assortis de ${column} conditions (cliquer pour ouvrir le dossier du projet dans REGDOCS*):`;
      },
      themesTitle: (column) => {
        return `${column} Thèmes de condition (cliquer pour voir la définition du thème):`;
      },
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
      text: "Cliquer sur une région pour consulter le sommaire.",
    },
    themeDefinitionsTitle: "Définitions du thème:",
    themeDefinitions: {
      "No theme specified":
        "La Régie n’a pas attribué de thème à certaines conditions.",
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
      note: (companyName) => {
        return `Aucune donnée sur les conditions n’est disponible pour ${companyName}. Si des données deviennent disponibles ou si des conditions sont imposées par la Commission, elles apparaîtront ici.`;
      },
    },
  },
  incidents: {
    dynamicText: incidentsTextFra,
    companyToSystem: companyToSystem,
    title: (systemName) => {
      return `Tableau de bord: ${systemName} - Incidents entraînant un rejet de produit`;
    },
    definitions: {
      Status: {
        Fermé:
          "La Régie a terminé l’examen de l’incident et a clos le dossier.",
        Soumis:
          "La société a fourni tous les renseignements exigés et la Régie examine ce qui s’est produit.",
        "Initialement soumis":
          "La société a informé la Régie qu’un incident était survenu et a fourni les renseignements préliminaires sur celui-ci. Une enquête est en cours.",
      },
      what: {
        "Défectuosité et détérioration":
          " Défectuosité au niveau des matériaux ou des processus de fabrication et détérioration attribuable à des dommages, au dépassement de la durée de vie utile, à l’absence d’inspection ou à un manque d’entretien.",
        "Corrosion et fissuration":
          "Corrosion externe ou fissuration du revêtement, en raison de dommages ou d’une défaillance, fissuration au niveau des soudures attribuable à des problèmes de contrainte ou de fabrication et corrosion interne due à la présence de contaminants dans les produits.",
        "Défaillance d’équipement":
          "Défaillance d’une des composantes de l’équipement associées au pipeline comme, par exemple, les vannes, l’alimentation électrique ou les systèmes de contrôle.",
        "Erreur d’exploitation":
          "En général, le personnel ne respecte pas les marches à suivre ou utilise l’équipement d’une manière non appropriée.",
        "Interférences extérieures":
          "Activités extérieures à l’origine de dommages au pipeline ou à ses composantes comme, par exemple, des travaux d’excavation ou du vandalisme.",
        "Forces de la nature":
          "Dommages pouvant être causés, par exemple, par un tremblement de terre, un glissement de terrain ou l’érosion.",
        "Autres causes":
          "Toutes les autres causes ou lorsqu’il est impossible de déterminer les circonstances de l’incident.",
        "À déterminer": "L’incident est à l’étude.",
      },
      why: {
        "Ingénierie et planification":
          "Défaillances au niveau de l’évaluation, de la planification ou de la surveillance pouvant être en rapport avec le caractère non approprié des données techniques, des critères de conception, de l’évaluation de changements ou de la mise en œuvre de contrôles.",
        Entretien:
          "Entretien préventif inadéquat ou réparations mal effectuées ainsi qu’usure et détérioration excessives.",
        "Approvisionnement inadéquat":
          "Problèmes au niveau des achats, de la manutention des matériaux, de leur transport ou de leur entreposage.",
        "Outils et équipement":
          "Outils et équipement qui ne permettent pas d’accomplir la tâche voulue ou dont l’utilisation n’est pas appropriée.",
        "Normes et procédures":
          "Élaboration, communication, mise à jour ou surveillance inadéquates des normes et procédures",
        "Problème de communication":
          "Perte de contact avec des dispositifs automatisés, de l’équipement ou des personnes.",
        "Supervision insuffisante":
          "Manque de surveillance d’un entrepreneur ou d’un employé pendant les travaux, qu’ils soient de construction ou d’entretien.",
        "Facteurs humains":
          "Facteurs liés à la conduite ou aux capacités d’une personne, qui peuvent par ailleurs être physiques ou psychologiques.",
        "Forces de la nature ou environnement":
          "Conditions relatives à l’environnement ou au milieu naturel.",
        "À déterminer": "L’incident est à l’étude.",
      },
    },
    dashboard: {
      what: "Incident",
      why: "Cause",
      estRelease: "Estimation du volume",
      cf: "pieds cubes",
      bbl: "b",
      decimal: ",",
      pillTitles: {
        titles: {
          Status: "REC État",
          Year: "Année",
          what: "Incident",
          Why: "Cause",
        },
        click: "clique pour voir",
      },
      volumeDisclaimer:
        "La taille de la bulle illustre l’estimation relative du volume du rejet en mètres cubes et n’indique pas la zone visée par le celui-ci.",
      locationDisclaimer: "En attente de votre position...",
      countDisclaimer: (eventType, field) => {
        return `<p>Les incidents peuvent avoir plusieurs valeurs ${field}.<br>Les totaux des graphiques peuvent sembler plus élevés en raison d’une double comptabilisation.</p>`;
      },
      userPopUp:
        "Emplacement approximatif. Vous pouvez faire glisser ce marqueur pour explorer les incidents survenus ailleurs.",
      locationError:
        "<h4>Impossible d’accéder à votre emplacement.</h4>Activez les services de localisation de votre navigateur et actualisez la page.",
      nearbyHeader: (numCircles, range) => {
        return `Il y a ${numCircles} incidents dans un rayon de ${range} km`;
      },
      gasRelease: "Estimation du volume de gaz rejeté:",
      liquidRelease: "Estimation du volume de liquide déversé:",
      otherRelease: "Estimation du rejet (divers):",
      exploreOther:
        "Vous voulez explorer d’autres régions? Vous pouvez cliquer et faire glisser le marqueur de l’emplacement, puis cliquer de nouveau sur le bouton pour rechercher un incident.",
      noNearby: (eventType) => {
        return `<h4>Aucun ${eventType} à proximité</h4>Essayez d’augmenter la portée de la recherche ou faites glisser le marqueur de l’emplacement pour voir les événements à proximité à un autre endroit.`;
      },
      barClick: (field) => {
        return `<p>Cliquer sur une bande pour consulter la définition de ${field}</p>`;
      },
      legendClick:
        "Cliquez sur un élément de légende pour le supprimer du graphique",
      rangeTitle: "Sélectionner une plage",
      findBtnTitle: "Rechercher les incidents dans",
      trendYTitle: "Nombre d’incidents",
      EVENTCOLORS: {
        Substance: {
          Propane: cerPalette["Forest"],
          "Gaz Naturel - non sulfureux": cerPalette["Flame"],
          "Gaz naturel - sulfureux": cerPalette["Dim Grey"],
          "Huile lubrifiante": cerPalette["hcPurple"],
          "Pétrole brut non sulfureux": cerPalette["Sun"],
          "Pétrole brut synthétique": cerPalette["Forest"],
          "Pétrole brut sulfureux": cerPalette["Dim Grey"],
          "Liquides de gaz naturel": cerPalette["Night Sky"],
          Condensat: cerPalette["Ocean"],
          "Carburant diesel": cerPalette["hcRed"],
          Essence: cerPalette["Flame"],
          Autre: cerPalette["Aubergine"],
        },
        Status: {
          "Initialement Soumis": cerPalette["Flame"],
          Fermé: cerPalette["Cool Grey"],
          Soumis: cerPalette["Ocean"],
        },
        Province: {
          Alberta: cerPalette["Sun"],
          "Colombie-Britannique": cerPalette["Forest"],
          Saskatchewan: cerPalette["Aubergine"],
          Manitoba: cerPalette["Ocean"],
          Ontario: cerPalette["Night Sky"],
          Québec: cerPalette["Flame"],
          "Nouveau-Brunswick": cerPalette["Forest"],
          "Nouvelle-Écosse": cerPalette["Night Sky"],
          "Territoires du Nord-Ouest": cerPalette["hcLightBlue"],
        },
        why: {
          "Normes et procédures": cerPalette["Flame"],
          "Outils et équipement": cerPalette["Forest"],
          Entretien: cerPalette["Night Sky"],
          "Facteurs humains": cerPalette["Ocean"],
          "Ingénierie et planification": cerPalette["Sun"],
          "Forces de la nature ou environnement": cerPalette["hcAqua"],
          "To be determined": cerPalette["Cool Grey"],
          "Approvisionnement inadéquat": cerPalette["Aubergine"],
          "Supervision insuffisante": cerPalette["Dim Grey"],
          "Problème de communication": cerPalette["hcPink"],
        },
        what: {
          "Corrosion et fissuration": cerPalette["Aubergine"],
          "Défectuosité et détérioration": cerPalette["Cool Grey"],
          "Défaillance d’équipement": cerPalette["Dim Grey"],
          "Forces de la nature": cerPalette["Flame"],
          "Autres causes": cerPalette["Forest"],
          "Erreur d’exploitation": cerPalette["Night Sky"],
          "Interférences extérieures": cerPalette["Ocean"],
          "To be determined": cerPalette["Sun"],
        },
      },
    },
    noIncidents: {
      header: "Aucune donnée sur les incidents disponible",
      note: (companyName) => {
        return `Il n’y a pas d’enregistrements dans les données sur les incidents de la Régie pour ${companyName}. Si de nouveaux incidents sont signalés à la Régie pour ce pipeline, ils apparaîtront ici après la mise à jour trimestrielle des données.`;
      },
    },
  },
  traffic: {
    dynamicText: trafficTrendTextFra,
    numberFormat: numberFormat,
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
  },
};
