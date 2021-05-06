import { cerPalette } from "./util";
import { incidentsTextFra, trafficTrendTextFra } from "./dynamicText";

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
  "Kingston Midstream Westspur Limited": "Pipeline Westspur",
  "Many Islands Pipe Lines (Canada) Limited":
    "Many Islands Pipe Lines (Canada) Limited",
  "Vector Pipeline Limited Partnership": "Gazoduc Vector",
  "Maritimes & Northeast Pipeline Management Ltd.": "Gazoduc M&NP",
};

const units = {
  "Bcf/d": "milliard de pieds cubes",
  "million m3/d": "million de pieds cubes par jour",
  "Mb/d": "kb/j",
  "thousand m3/d": "k m3/j",
};

const unitsDisclaimerText = (commodity) => {
  let conversionText = "";
  if (commodity === "oil") {
    conversionText =
      "FR: A conversion of 1 cubic meter = 6.2898 barrels of oil is used in this dashboard";
  } else if (commodity === "gas") {
    conversionText =
      "FR: A conversion of 1 cubic meter = 35.3147 Cubic feet (cf) natural gas is used in this dashboard";
  }
  return conversionText;
};

const points = {
  0: [
    "system",
    "Pipeline throughput is measured at the system level (entire pipeline) instead of individual key points.",
  ],
  1: [
    "Border",
    "Pipeline border crossing and interconnection between the Alliance Canada and Alliance USA pipeline near Elmore Saskatchewan (Sherwood, ND in the U.S.).  The CER’s regulation of the Alliance pipeline ends at this border point.",
  ],
  2: [
    "Zone 2",
    "Located near the Blueberry Compressor Station, Zone 2 aggregates liquids rich gas primarily from the Montney Basin in northeast BC & northwest AB. The majority of Alliance receipt points are upstream of Zone 2, with smaller volumes received by the system south of Zone 2.",
  ],
  3: [
    "Huntingdon/FortisBC Lower Mainland",
    "Export connection with the U.S. pipeline grid at Huntingdon, B.C. Exports to the U.S. are typically bound for use in crude oil refineries on the West Coast of Washington State. Intracanada throughput connects with the FortisBC local distribution network for use in Vancouver and the BC lower mainland.",
  ],
  4: [
    "Kingsvale",
    "Connection with the FortisBC Southern Crossing pipeline. The Southern Crossing moves smaller volumes of natural gas across southern BC from the NGTL West Gate point.",
  ],
  5: [
    "NOVA/Gordondale",
    "Connection with the NGTL System. The only Westcoast key point in Alberta. Most gas moving on Westcoast makes its way south through BC, but smaller volumes at NOVA/Gordondale & Sunset Creek move East into Alberta onto the NGTL system.",
  ],
  6: [
    "Sunset Creek",
    "Connection with the NGTL System. Situated near the Station 2 trading point, where gas can either move south on the Westcoast system, or East into Alberta.",
  ],
  7: [
    "St. Stephen",
    "Import/export interconnect with the US portion of M&NP at the Canada-U.S. border near St. Stephen, New Brunswick.",
  ],
  8: [
    "Chippawa",
    "Interconnect with the Empire State Pipeline at the Canada-U.S. border near Niagara Falls, Ontario. Prior to 2015, Chippawa was an export point until increasing gas production in the northeastern U.S. began to displace imports from Canada. Chippawa key point is bi-directional.",
  ],
  9: [
    "Cromer/Regina",
    "The Canadian Mainline receives U.S. crude oil from the Wascana Pipeline and connects to the Cooperative Refinery Complex.",
  ],
  10: [
    "Eastern Triangle - NOL Receipts",
    "Includes receipts from the Northern Ontario Line (NOL) segment, measured at compressor station 116 near North Bay, Ontario. The Eastern Triangle is comprised of three segments - Barrie, Montreal and the North Bay Short Cut (NBSC).",
  ],
  11: [
    "Eastern Triangle - Parkway Deliveries",
    "Delivery interconnect with the Union Gas Pipeline, near Milton, Ontario. Throughputs include nominations bound for Dawn storage, via the Union Gas System, and tend to be seasonal (primarily in the summer), depending on market conditions. ",
  ],
  12: [
    "Eastern Triangle - Parkway Receipts",
    "Receipt interconnect with the Union Gas Pipeline, near Milton, Ontario. Includes supply from Dawn storage.",
  ],
  13: [
    "Emerson I",
    "Interconnect with the Viking Gas Transmission Pipeline at the Canada-U.S. border near Emerson, Manitoba.",
  ],
  14: [
    "Emerson II",
    "Interconnect with the Great Lakes Gas Transmission Pipeline on the Canada-U.S. border near Emerson, Manitoba. Emerson II key point is bi-directional.",
  ],
  15: [
    "ex-Cromer",
    "Canadian Mainline receives U.S. and Saskatchewan crude oil from the Enbridge Bakken Pipeline as well as Saskatchewan production from the Westspur Pipeline at the Cromer terminal just north of Cromer Manitoba. The Mainline moves near the Bakken production region (southern Saskatchewan, southwest Manitoba, & North Dakota), receiving light crude oil produced nearby.",
  ],
  16: [
    "ex-Gretna",
    "Canadian Mainline crosses the Canada-U.S. border and joins with the Enbridge Lakehead system. The CER’s regulation of the Canadian Mainline ends at this border point.",
  ],
  17: [
    "Into-Sarnia",
    "Enbridge Lakehead system delivers Canadian as well as some U.S. production into Sarnia, Ontario on Line 5 and Line 78. Line 5 carries light oil and NGLs while Line 78 carries primarily heavier crudes. From Sarnia, Line 9 delivers crude oil to Montreal, Quebec and Line 7/11 delivers to the Nanticoke refinery.",
  ],
  18: [
    "Iroquois",
    "Interconnect with the Iroquois Gas Transmission System at the Canada-U.S. border near Iroquois, Ontario. The Iroquois pipeline transports Canadian gas into U.S. northeast. Iroquois key point is bi-directional.",
  ],
  19: [
    "Niagara",
    "Import interconnect with the Tennessee Gas Pipeline and the National Fuel Gas Pipeline at the Canada-U.S. border near Niagara Falls, Ontario. Prior to 2012, Niagara was an export point",
  ],
  20: [
    "Northern Ontario Line",
    "Segment of the Mainline which begins near compressor 41 in Manitoba and extends to compressor station 116 near North Bay, Ontario.",
  ],
  21: [
    "Other US Northeast",
    "Interconnect with three U.S. pipelines at the Canada-U.S. border near Cornwall, Ontario and Napierville and Phillipsburg, Quebec. ‘Other US Northeast’ is an aggregate of these three export points and includes interconnects with the St. Lawrence Gas Company, North Country Gas Pipeline and Vermont Gas Systems respectively. ",
  ],
  22: [
    "Prairies",
    "Interconnect with the NOVA Gas Transmission Ltd. (NGTL) system at the Alberta/Saskatchewan border. Empress is one of the primary receipt points on the Mainline. Gas moves east for use in Manitoba, Ontario, Quebec, and exports into the U.S. Midwest and U.S. Northeast. ",
  ],
  23: [
    "St Clair",
    "Interconnect with the Great Lakes Gas Transmission pipeline, at the Canada-U.S. border near St. Clair, Ontario. St Clair key point is bi-directional.",
  ],
  24: [
    "Ft. Saskatchewan",
    "The end of the Cochin pipeline near Ft. Saskatchewan AB. Condensate is transferred to provincially regulated pipelines and transported to oil sands operations in northern Alberta.",
  ],
  27: [
    "Kingsgate",
    "Interconnect with the Gas Transmission Northwest Pipeline (GTN) at the Canada-U.S. border near Kingsgate, British Columbia. GTN supplies markets in the Pacific Northwest, California and Nevada.",
  ],
  28: [
    "Monchy",
    "Interconnect with the Northern Border Pipeline at the Canada U.S. border near Monchy, Saskatchewan. Northern Border supplies markets in the mid-continent U.S.",
  ],
  29: [
    "International boundary at or near Haskett, Manitoba",
    "Pipeline border crossing between Manitoba and North Dakota, U.S. The CER's regulation of the Keystone pipeline ends at the US/Canada border.",
  ],
  30: [
    "East Gate",
    "NGTL interconnect with the TC Energy Canadian Mainline (near Empress, Alberta) and the Foothills Pipeline (near McNeill, Alberta). Most gas moves from East Gate to the TC Mainline for use in central and eastern Canada, and is exported to the US Midwest and Northeast.",
  ],
  31: [
    "North and East",
    "Throughputs to delivery areas in northern Alberta, including natural gas used for oil sands operations.",
  ],
  32: [
    "Upstream of James River",
    "Receives gas from the Horn River, North Montney Mainline and Groundbirch pipelines in the northwestern portion of the NGTL system. Typically the highest traffic key point on the system, capturing a significant amount of gas produced in the WCSB.",
  ],
  33: [
    "West Gate",
    "NGTL interconnect with TC Energy’s Foothills Pipeline in southwestern Alberta at the British Columbia border. Gas travels through the Foothills system for export into the western United States.",
  ],
  34: [
    "Zama",
    "The end of the Norman Wells pipeline in northwest Alberta. The pipeline connects with provincially regulated systems, and enters the Alberta light crude oil market.",
  ],
  35: [
    "Burnaby",
    "Delivers light crude oil to the 55,000 b/d Parkland Refinery in Burnaby BC, and delivers refined petroleum products for use in Burnaby and surrounding areas.",
  ],
  36: [
    "Sumas",
    "Connection between the Trans Mountain Pipeline and the Trans Mountain Puget Sound Pipeline in Abbotsford, BC. Light crude oil and smaller volumes of heavy crude oil are diverted for export to nearby refineries in Anacortes, Cherry Point, and Ferndale on the west coast of Washington State.",
  ],
  37: [
    "Westridge",
    "The smallest delivery point on the system located within Port Metro Vancouver, the Westridge Marine Terminal is able to load crude oil tankers with primarily heavy crude oil for various markets, including Asia and California.",
  ],
  38: [
    "East Hereford",
    "Export interconnect with the Portland Natural Gas Transmission System at the Canada-U.S. border near East Hereford, Québec. TQM delivers natural gas customers in the U.S. states of Vermont, New Hampshire, Maine and Massachusetts.",
  ],
  39: [
    "Saint Lazare",
    "Interconnect with the TC Canadian Mainline near Saint Lazare, Québec. TransCanada’s Canadian Mainline delivers natural gas produced in the WCSB and the Appalachian Basin for use in Montreal and surrounding areas.",
  ],
  40: [
    "Calgary",
    "Connection between the NGTL system and local distribution pipelines used to service the Calgary market area. Throughput here is highly seasonal as gas consumption increases in the city during the winter months for heating.",
  ],
  41: [
    "Edmonton",
    "Located northeast of Calgary, the Edmonton key point captures gas post Upstream of James River, bound north to service the Edmonton market area. Throughput here is highly seasonal as gas consumption increases in the city during the winter months for heating.",
  ],
  42: [
    "OSDA Kirby",
    "Stands for Oil Sands Delivery Area. Gas throughput here is typically bound for use in nearby Cold Lake oil sands Steam-Assisted Gravity Drainage (SAGD) and Cyclic Steam Stimulation (CSS) operations. These unconventional oil production methods rely on gas to generate the steam used to heat underground reservoirs, allowing bitumen to reach the surface.",
  ],
  43: [
    "OSDA Liege",
    "Stands for Oil Sands Delivery Area. Located just northwest of Fort McMurray, gas throughput here is typically bound for use in nearby Athabasca oil sands mining and in-situ operations. Bitumen mining operations use natural gas to convert mined bitumen into synthetic crude oil.",
  ],
  44: [
    "Saturn",
    "NGTL segment near the Saturn compressor station located southwest of Fort St. John in British Columbia. Connects NGTL with production from the North Montney Mainline and Aitken storage. Component of total deliveries at Upstream of James River key point.",
  ],
};

const numberFormat = (value, rounding = 2) =>
  Highcharts.numberFormat(value, rounding, ",", " ");

const dateFormat = (value, format = "%b %d, %Y") =>
  Highcharts.dateFormat(format, value);

export const frenchDashboard = {
  plains:
    "Plains Midstream Canada ULC comprend les pipelines Milk River et Wascana",

  conditions: {
    dateFormat,
    companyToSystem,
    colNames: { "In Progress": "En cours", Closed: "Remplies" },
    conditions: "conditions",
    noLocation: {
      title:
        "Certaines conditions ne sont pas liées à un emplacement géographique.",
      summary: (companyName) =>
        `Aucun résumé de l’emplacement géographique de ${companyName}:`,
    },
    title: {
      noLocation: (companyName) =>
        `Tableau de bord: ${companyName} - aucun emplacement géographique`,
      location: (companyName, column) =>
        `Tableau de bord: ${companyName} - ${column} Conditions par région`,
    },
    table: {
      projectsTitle: (column) =>
        `Projets assortis de ${column} conditions (cliquer pour ouvrir le dossier du projet dans REGDOCS*):`,
      themesTitle: (column) =>
        `${column} Thèmes de condition (cliquer pour voir la définition du thème):`,
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
      note: (companyName) =>
        `Aucune donnée sur les conditions n’est disponible pour ${companyName}. Si des données deviennent disponibles ou si des conditions sont imposées par la Commission, elles apparaîtront ici.`,
    },
  },
  incidents: {
    dynamicText: incidentsTextFra,
    companyToSystem,
    title: (systemName) =>
      `Tableau de bord: ${systemName} - Incidents entraînant un rejet de produit`,
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
      countDisclaimer: (eventType, field) =>
        `<p>Les incidents peuvent avoir plusieurs valeurs ${field}.<br>Les totaux des graphiques peuvent sembler plus élevés en raison d’une double comptabilisation.</p>`,
      userPopUp:
        "Emplacement approximatif. Vous pouvez faire glisser ce marqueur pour explorer les incidents survenus ailleurs.",
      locationError:
        "<h4>Impossible d’accéder à votre emplacement.</h4>Activez les services de localisation de votre navigateur et actualisez la page.",
      nearbyHeader: (numCircles, range) =>
        `Il y a ${numCircles} incidents dans un rayon de ${range} km`,
      gasRelease: "Estimation du volume de gaz rejeté:",
      liquidRelease: "Estimation du volume de liquide déversé:",
      otherRelease: "Estimation du rejet (divers):",
      exploreOther:
        "Vous voulez explorer d’autres régions? Vous pouvez cliquer et faire glisser le marqueur de l’emplacement, puis cliquer de nouveau sur le bouton pour rechercher un incident.",
      noNearby: (eventType) =>
        `<h4>Aucun ${eventType} à proximité</h4>Essayez d’augmenter la portée de la recherche ou faites glisser le marqueur de l’emplacement pour voir les événements à proximité à un autre endroit.`,
      barClick: (field) =>
        `<p>Cliquer sur une bande pour consulter la définition de ${field}</p>`,
      legendClick:
        "Cliquez sur un élément de légende pour le supprimer du graphique",
      rangeTitle: "Sélectionner une plage",
      findBtnTitle: "Rechercher les incidents dans",
      trendYTitle: "Nombre d’incidents",
      EVENTCOLORS: {
        Substance: {
          Propane: cerPalette.Forest,
          "Gaz Naturel - non sulfureux": cerPalette.Flame,
          "Gaz naturel - sulfureux": cerPalette["Dim Grey"],
          "Huile lubrifiante": cerPalette.hcPurple,
          "Pétrole brut non sulfureux": cerPalette.Sun,
          "Pétrole brut synthétique": cerPalette.Forest,
          "Pétrole brut sulfureux": cerPalette["Dim Grey"],
          "Liquides de gaz naturel": cerPalette["Night Sky"],
          Condensat: cerPalette.Ocean,
          "Carburant diesel": cerPalette.hcRed,
          Essence: cerPalette.Flame,
          Autre: cerPalette.Aubergine,
        },
        Status: {
          "Initialement Soumis": cerPalette.Flame,
          Fermé: cerPalette["Cool Grey"],
          Soumis: cerPalette.Ocean,
        },
        Province: {
          Alberta: cerPalette.Sun,
          "Colombie-Britannique": cerPalette.Forest,
          Saskatchewan: cerPalette.Aubergine,
          Manitoba: cerPalette.Ocean,
          Ontario: cerPalette["Night Sky"],
          Québec: cerPalette.Flame,
          "Nouveau-Brunswick": cerPalette.Forest,
          "Nouvelle-Écosse": cerPalette["Night Sky"],
          "Territoires du Nord-Ouest": cerPalette.hcLightBlue,
        },
        why: {
          "Normes et procédures": cerPalette.Flame,
          "Outils et équipement": cerPalette.Forest,
          Entretien: cerPalette["Night Sky"],
          "Facteurs humains": cerPalette.Ocean,
          "Ingénierie et planification": cerPalette.Sun,
          "Forces de la nature ou environnement": cerPalette.hcAqua,
          "To be determined": cerPalette["Cool Grey"],
          "Approvisionnement inadéquat": cerPalette.Aubergine,
          "Supervision insuffisante": cerPalette["Dim Grey"],
          "Problème de communication": cerPalette.hcPink,
        },
        what: {
          "Corrosion et fissuration": cerPalette.Aubergine,
          "Défectuosité et détérioration": cerPalette["Cool Grey"],
          "Défaillance d’équipement": cerPalette["Dim Grey"],
          "Forces de la nature": cerPalette.Flame,
          "Autres causes": cerPalette.Forest,
          "Erreur d’exploitation": cerPalette["Night Sky"],
          "Interférences extérieures": cerPalette.Ocean,
          "To be determined": cerPalette.Sun,
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
    unitsDisclaimerText,
    units,
    points,
    dynamicText: trafficTrendTextFra,
    numberFormat,
    directions: {
      north: "nord",
      east: "est",
      south: "sud",
      west: "ouest",
      northeast: "nord-est",
      northwest: "nord-ouest",
      southeast: "sud-est",
      southwest: "sud-ouest",
      "east & north": "est & nord",
      "southeast & east": "sud-est & est",
      "east & southeast": "est & sud-est",
      "west & south": "ouest & sud",
    },
    fiveYr: {
      lastYrName: (lastYear) => `${lastYear} throughput (last year of data) FR`,
      avgName: "Five Year Average FR",
      rangeName: (min, max) => `Five Year Range (${min + 1}-${max - 1}) FR`,
      notEnough: "Not enough data to calculate five-year average FR",
    },
    exportAxis: (unit) => `Exports (${unit}) FR`,
    importAxis: (unit) => `Imports (${unit}) FR`,
    fiveYrTitle: (pointText) => `${pointText} - Five year average & range FR`,
    trafficTitle: (pointText, dirText) =>
      `${pointText} - monthly traffic ${dirText} FR`,
    flow: "Direction of flow: FR",
    trade: {
      import: "importation",
      intracanada: "intracanada FR",
      export: "exportation",
      Capacity: "Capacité",
    },
    util: "Utilization FR",
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
  apportion: {
    unitsDisclaimerText,
    units,
    points,
    numberFormat,
    title: {
      enbridge: "FR System wide nominations",
      other: "FR Apportionment at:",
    },
    series: {
      "Accepted Nominations": "FR Accepted Nominations",
      "Original Nominations": "FR Original Nominations",
      "Available Capacity": "FR Available Capacity",
      "Apportionment Percent": "FR Apportionment Percent",
    },
  },
};
