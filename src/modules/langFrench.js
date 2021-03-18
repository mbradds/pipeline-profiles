import { cerPalette } from "./util.js";
const companyToSystem = {
  "NOVA Gas Transmission Ltd.": "NGTL System",
  "TransCanada PipeLines Limited": "TC Canadian Mainline",
  "Enbridge Pipelines Inc.": "Enbridge Canadian Mainline",
  "Enbridge Pipelines (NW) Inc.": "Norman Wells Pipeline",
  "Enbridge Bakken Pipeline Company Inc.": "Enbridge Bakken System",
  "Express Pipeline Ltd.": "Express Pipeline",
  "Trans Mountain Pipeline ULC": "Trans Mountain Pipeline",
  "Trans Quebec and Maritimes Pipeline Inc.": "TQM Pipeline",
  "Trans-Northern Pipelines Inc.": "Trans-Northern Pipeline",
  "TransCanada Keystone Pipeline GP Ltd.": "Keystone Pipeline",
  "Westcoast Energy Inc.": "Enbridge BC Pipeline",
  "Alliance Pipeline Ltd.": "Alliance Pipeline",
  "PKM Cochin ULC": "Cochin Pipeline",
  "Foothills Pipe Lines Ltd.": "Foothills System",
  "Southern Lights Pipeline": "Southern Lights Pipeline",
  "Emera Brunswick Pipeline Company Ltd.": "Brunswick Pipeline",
  "Plains Midstream Canada ULC": "Plains Midstream Canada ULC",
  "Genesis Pipeline Canada Ltd.": "Genesis Pipeline",
  "Montreal Pipe Line Limited": "Montreal Pipeline",
  "Trans-Northern Pipelines Inc.": "Trans-Northern Pipeline",
  "Kingston Midstream Westspur Limited": "Westspur Pipeline",
  "Many Islands Pipe Lines (Canada) Limited":
    "Many Islands Pipe Lines (Canada) Limited",
  "Vector Pipeline Limited Partnership": "Vector Pipeline",
  "Maritimes & Northeast Pipeline Management Ltd.": "M&NP Pipeline",
};

export const frenchDashboard = {
  plains:
    "Plains Midstream Canada ULC includes the Aurora, Milk River, and Wascana pipelines",

  conditions: {
    companyToSystem: companyToSystem,
    conditions: "conditions",
    noLocation: {
      title: "Some conditions are not tied to a geographic location.",
      summary: (companyName) => {
        return `No geographic location summary for ${companyName}:`;
      },
    },
    title: {
      noLocation: (companyName) => {
        return `Dashboard: ${companyName} - no geographic location`;
      },
      location: (companyName, column) => {
        return `Dashboard: ${companyName} - ${column} Conditions by Region`;
      },
    },
    table: {
      projectsTitle: (column) => {
        return `Projects with ${column} Conditions (click to open REGDOCS* project folder):`;
      },
      themesTitle: (column) => {
        return `${column} Condition Themes (click to view theme definition):`;
      },
      regdocsDefinition:
        "*REGDOCS is a regulatory database for activities and transactions conducted at the CER.",
    },
    popUp: {
      econRegion: "Economic Region",
      summary: "Conditions Summary:",
      lastUpdated: "Last updated on:",
    },
    instructions: {
      header: "Map Instructions:",
      line1: "Click on a region to view conditions info",
      line2: "Click map area outside of regions to hide info",
      disclaimer:
        "Some conditions apply to multiple regions. Conditions may be double counted across regions, resulting in a higher number of conditions than the totals seen in the buttons above.",
    },
    tooltip: {
      text: "Click on region to view summary",
    },
    themeDefinitions: {
      "No theme specified":
        "Some conditions have not been assigned a theme by the CER.",
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
      Finances:
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
      header: "No conditions data available",
      note: (companyName) => {
        return `There is no conditions data available for ${companyName}. If data becomes available, or conditions are issued by the commission, they will show up here.`;
      },
    },
  },
  incidents: {
    companyToSystem: companyToSystem,
    title: (systemName) => {
      return `Dashboard: ${systemName} - Incidents with a product release`;
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
      "What Happened": {
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
        "À déterminer": "The incident is under review",
      },
      "Why It Happened": {
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
        "À déterminer": "The incident is under review.",
      },
    },
    dashboard: {
      what: "What Happened FR",
      why: "Why It Happened FR",
      estRelease: "Est. Release Volume FR:",
      pillTitles: {
        titles: { Status: "REC Status" },
        click: "click to view FR",
      },
      volumeDisclaimer:
        "Bubble size illustrates the relative est. release volume in m3, and does not indicate area covered by the release",
      userPopUp:
        "Approximate location. You can drag this marker around to explore incident events in other locations.",
      locationError:
        "<h4>Can't access your location.</h4>Try enabling your browser's location services and refresh the page.",
      nearbyHeader: (numCircles, range) => {
        return `There are ${numCircles} incidents within ${range} km`;
      },
      gasRelease: "Estimated gas volume released:",
      liquidRelease: "Estimated liquid volume released:",
      otherRelease: "Estimated miscellaneous release:",
      exploreOther:
        "Want to explore other regions? You can click and drag the location marker and re-click the find incidents button.",
      noNearby: (eventType) => {
        return `<h4>No nearby ${eventType}</h4>Try increasing the search range, or drag your location marker to see nearby events at a different location.`;
      },
      rangeTitle: "Select range",
      findBtnTitle: "Find Incidents within",
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
          "Dioxyde de soufre": cerPalette["hcPurple"],
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
        "Why It Happened": {
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
        "What Happened": {
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
      header: "No incidents data available",
      note: (companyName) => {
        return `There are no records in the CER's incident data for ${companyName}. If new incidents are reported to the CER for this pipeline, they will appear here following the quarterly data update.`;
      },
    },
  },
};
