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
  "Bcf/d": "Gpi3/j",
  "million m3/d": "millions m3/j",
  "Mb/d": "kb/j",
  "thousand m3/d": "km3/j",
};

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

const points = {
  0: [
    "Réseau",
    "Le débit du pipeline est mesuré au niveau du système (tout le pipeline) au lieu de points clés individuels.",
  ],
  1: [
    "Frontière",
    "Franchissement de la frontière et raccordement du pipeline d’Alliance Canada à celui d’Alliance USA près d’Elmore, en Saskatchewan (à Sherwood, dans le Dakota du Nord, aux États-Unis). C’est à ce point frontalier que prend fin la réglementation du pipeline d’Alliance par la Régie.",
  ],
  2: [
    "Zone 2",
    "Située près de la station de compression Blueberry, recueille principalement du gaz riche en liquides provenant de la formation Montney, dans le Nord-Est de la Colombie-Britannique et le Nord-Ouest de l’Alberta. La majorité des points de réception d’Alliance se trouvent en amont de la zone 2, et les volumes reçus par le réseau au sud de la zone 2 sont de moindre importance.",
  ],
  3: [
    "Huntingdon/FortisBC Lower Mainland",
    "Raccordement d’exportation au réseau pipelinier américain à Huntingdon, en Colombie-Britannique. Les exportations vers les États-Unis sont habituellement destinées aux raffineries de pétrole brut de la côte Ouest de l’État de Washington. Le réseau au Canada se raccorde au réseau de distribution local de FortisBC qui achemine le produit à Vancouver et dans la vallée du bas Fraser, en Colombie-Britannique.",
  ],
  4: [
    "Kingsvale",
    "Raccordement au gazoduc Southern Crossing de FortisBC, qui achemine de petits volumes de gaz naturel dans le Sud de la Colombie-Britannique à partir du poste d’entrée Ouest du réseau de NGTL.",
  ],
  5: [
    "NOVA/Gordondale",
    "Raccordement au réseau de NGTL. C’est le seul point principal de Westcoast en Alberta. La plus grande partie du gaz acheminé par Westcoast traverse la Colombie-Britannique vers le sud, mais des volumes plus faibles à NOVA/Gordondale et Sunset Creek sont acheminés vers l’est, en Alberta, jusqu’au réseau de NGTL.",
  ],
  6: [
    "Sunset Creek",
    "Raccordement au réseau de NGTL. Situé près du point de commerce de la station 2, où le gaz peut être acheminé vers le sud sur le réseau de Westcoast ou vers l’est, en Alberta.",
  ],
  7: [
    "St. Stephen",
    "L’interconnexion d’importation-exportation avec la partie du réseau de M&NP en sol américain, à la frontière canado-américaine près de St. Stephen, au Nouveau-Brunswick, constitue un des principaux points.",
  ],
  8: [
    "Chippawa",
    "Raccordement au réseau Empire State Pipeline, à la frontière canado-américaine, près de Niagara Falls, en Ontario. Chippawa était un point d’exportation jusqu’en 2015 lorsque l’augmentation de la production gazière dans le Nord-Est des États-Unis a commencé à déplacer les importations du Canada. Le point Chippawa est bidirectionnel.",
  ],
  9: [
    "Cromer/Regina",
    "La canalisation principale au Canada reçoit du pétrole brut américain du pipeline Wascana et se connecte au complexe de raffinerie coopérative.",
  ],
  10: [
    "Triangle de l’Est – Points de réception de la CNO",
    "Comprend les points de réception de la CNO, mesurés à la station de compression 116 près de North Bay, en Ontario. Le triangle de l’Est comprend trois tronçons : Barrie, Montréal et le raccourci North Bay.",
  ],
  11: [
    "Triangle de l’Est – Points de livraison Parkway",
    "Raccordement au gazoduc d’Enbridge, près de Milton, en Ontario. Les volumes comprennent les commandes d’expédition destinées à l’aire de stockage à Dawn, par le réseau gazier d’Enbridge, et sont généralement saisonniers (principalement en été), selon les conditions du marché.",
  ],
  12: [
    "Triangle de l’Est — Points de réception Parkway",
    "Raccordement au gazoduc d’Enbridge, près de Milton, en Ontario. Comprend l’approvisionnement en provenance de l’aire de stockage à Dawn.",
  ],
  13: [
    "Emerson I",
    "Raccordement au réseau de Viking Gas Transmission Pipeline, à la frontière canado-américaine près d’Emerson, au Manitoba.",
  ],
  14: [
    "Emerson II",
    "Raccordement au réseau de Great Lakes Gas Transmission Pipeline, à la frontière canado-américaine, près d’Emerson, au Manitoba. Le point Emerson II est bidirectionnel.",
  ],
  15: [
    "ex-Cromer",
    "La canalisation principale au Canada reçoit du pétrole brut des États-Unis et de la Saskatchewan par le pipeline Bakken d’Enbridge, et du pétrole produit en Saskatchewan par le pipeline Westspur, au terminal Cromer, juste au nord de Cromer, au Manitoba. La canalisation passe près de la région productrice de Bakken (dans le Sud de la Saskatchewan, le Sud-Ouest du Manitoba et le Dakota du Nord), où elle reçoit du pétrole brut léger produit à proximité.",
  ],
  16: [
    "ex-Gretna",
    "La canalisation principale au Canada traverse la frontière canado-américaine et rejoint le réseau Lakehead d’Enbridge. C’est à ce point frontalier que prend fin la réglementation de la canalisation par la Régie.",
  ],
  17: [
    "Vers Sarnia",
    "Le réseau Lakehead d’Enbridge achemine la production canadienne et une partie de la production américaine jusqu’à Sarnia, en Ontario, par les canalisations 5 et 78. La canalisation 5 transporte du pétrole léger et des liquides de gaz naturel (« LGN »), tandis que la canalisation 78 transporte surtout des bruts plus lourds. À partir de Sarnia, la canalisation 9 achemine du pétrole brut à Montréal, au Québec, et la canalisation 7/11, à la raffinerie de Nanticoke, en Ontario.",
  ],
  18: [
    "Iroquois",
    "Raccordement au réseau d’Iroquois Gas Transmission System, à la frontière canado-américaine, près d’Iroquois, en Ontario. Le pipeline Iroquois transporte du gaz canadien vers le Nord-Est des États-Unis. Le point Iroquois est bidirectionnel.",
  ],
  19: [
    "Niagara",
    "Raccordement au réseau de Tennessee Gas Pipeline et de National Fuel Gas Pipeline, à la frontière canado-américaine, près de Niagara Falls, en Ontario. Niagara était un point d’exportation jusqu’en 2012 lorsque l’augmentation de la production gazière dans le Nord-Est des États-Unis a commencé à déplacer les importations du Canada. Le point Niagara est bidirectionnel.",
  ],
  20: [
    "Canalisation du Nord de l’Ontario",
    "Tronçon du réseau principal qui s’étend de la station de compression 41, près de Winnipeg, au Manitoba, à la station de compression 116, près de North Bay, en Ontario.",
  ],
  21: [
    "Nord-Est des États-Unis (autre)",
    "Raccordement à trois réseaux américains en Ontario, à la frontière canado-américaine, près de Cornwall, et au Québec, près de Napierville et de Philipsburg. Ces trois points d’exportation font partie de la catégorie « Autres points dans le Nord-Est des États-Unis », qui comprend aussi les raccordements aux réseaux de St. Lawrence Gas Company, de North Country Pipeline et de Vermont Gas Systems, respectivement.",
  ],
  22: [
    "Prairies",
    "Raccordement au réseau de NGTL près d’Empress, en Alberta, à la limite entre l’Alberta et la Saskatchewan, et points de réception de la Saskatchewan. Empress est l’un des principaux points de réception du réseau. Le gaz est acheminé vers l’est à destination du Manitoba, de l’Ontario et du Québec, ainsi qu’en vue de son exportation vers le Midwest américain et le Nord-Est des États-Unis.",
  ],
  // 23: [
  //   "St Clair",
  //   "Interconnect with the Great Lakes Gas Transmission pipeline, at the Canada-U.S. border near St. Clair, Ontario. St Clair key point is bi-directional.",
  // ],
  24: [
    "Ft. Saskatchewan",
    "Extrémité du pipeline Cochin au terminal qui appartenait autrefois à Kinder Morgan (aujourd’hui à Pembina), près de Fort Saskatchewan, en Alberta. Les condensats sont ensuite transférés aux terminaux de stockage de diluants à proximité (terminal de diluants de l’Alberta de Keyera, terminal d’Enbridge et carrefour canadien de diluants de Pembina). À partir d’Edmonton et de Fort Saskatchewan, les diluants sont acheminés vers le nord sur des pipelines sous réglementation provinciale de l’Alberta vers des installations d’exploitation des sables bitumineux près de Fort McMurray, en Alberta.",
  ],
  27: [
    "Kingsgate",
    "Raccordement au réseau de Gas Transmission Northwest Pipeline (« GTN »), à la frontière canado-américaine, près de Kingsgate, en Colombie-Britannique. GTN alimente des marchés du Nord-Ouest du Pacifique, de la Californie et du Nevada.",
  ],
  28: [
    "Monchy",
    "Raccordement au pipeline Northern Border, à la frontière canado-américaine, près de Monchy, en Saskatchewan. Le pipeline Northern Border approvisionne des marchés du centre du continent américain et de Chicago.",
  ],
  29: [
    "Frontière internationale, près de Haskett, au Manitoba",
    "Point de franchissement de la frontière entre le Manitoba et le Dakota du Nord, aux États-Unis. C’est à ce point frontalier que prend fin la réglementation du pipeline Keystone par la Régie.",
  ],
  30: [
    "Poste d’entrée Est",
    "Raccordement du réseau de NGTL au réseau principal au Canada de TransCanada PipeLines (près d’Empress, en Alberta) et au réseau de Foothills (près de McNeill, en Alberta).",
  ],
  31: [
    "Nord et Est",
    "Points de réception pour l’acheminement de gaz naturel vers les régions de livraison du Nord de l’Alberta, notamment aux fins des activités d’exploitation des sables bitumineux.",
  ],
  32: [
    "Point en amont de la rivière James",
    "Partie nord-ouest du réseau de NGTL, comprenant les points de réception des pipelines Horn River, North Montney et Groundbirch. Point habituellement le plus achalandé du réseau de NGTL, où circule une quantité importante du gaz produit dans le BSOC.",
  ],
  33: [
    "Poste d’entrée Ouest",
    "Raccordement du réseau de NGTL au réseau de Foothills, dans le Sud-Ouest de l’Alberta, à la frontière avec la Colombie-Britannique. Le gaz est acheminé par le réseau de Foothills en vue de son exportation vers les marchés du Nord‑Ouest du Pacifique, de la Californie et du Nevada.",
  ],
  34: [
    "Zama",
    "Fin du pipeline Norman Wells dans le Nord-Ouest de l’Alberta. Le pipeline se raccorde à des réseaux sous réglementation provinciale et accède au marché albertain du pétrole brut léger.",
  ],
  35: [
    "Burnaby",
    "Achemine du pétrole brut léger à la raffinerie Parkland à Burnaby, en Colombie-Britannique, à hauteur de 55 000 b/j, ainsi que des produits pétroliers raffinés destinés à Burnaby et aux villes avoisinantes.",
  ],
  36: [
    "Sumas",
    "Raccordement entre le pipeline Trans Mountain et le pipeline Puget Sound de Trans Mountain à Abbotsford, en Colombie-Britannique Du pétrole brut léger, et brut lourd en moindre quantité, est acheminé vers les raffineries voisines d’Anacortes, de Cherry Point et de Ferndale, sur la côte Ouest de l’État de Washington.",
  ],
  37: [
    "Westridge",
    "Plus petit point de livraison du réseau, le terminal maritime Westridge, situé à Port Metro Vancouver, peut charger des navires-citernes de pétrole brut (lourd, principalement) à destination de divers marchés, dont l’Asie et la Californie.",
  ],
  38: [
    "East Hereford",
    "Point d’exportation où le réseau se raccorde au réseau de Portland Natural Gas Transmission System, à la frontière canado-américaine près d’East Hereford, au Québec, afin d’acheminer du gaz naturel vers des marchés du Vermont, du New Hampshire, du Maine et du Massachusetts.",
  ],
  39: [
    "Saint Lazare",
    "Point d’interconnexion avec le réseau principal de TC près de Saint-Lazare, au Québec. Ce réseau transporte du gaz naturel produit dans le bassin sédimentaire de l’Ouest canadien et le bassin des Appalaches et destiné à Montréal et aux villes avoisinantes.",
  ],
  40: [
    "Calgary",
    "Point de raccordement du réseau de NGTL et des pipelines de distribution locaux qui desservent le marché de Calgary. Les volumes sont très saisonniers, car la consommation de gaz augmente en hiver pour répondre aux besoins en chauffage.",
  ],
  41: [
    "Edmonton",
    "Réception du gaz provenant du point en amont de la rivière James, à acheminer vers le nord pour desservir le marché d’Edmonton. Les volumes sont très saisonniers, car la consommation de gaz augmente en hiver pour répondre aux besoins en chauffage.",
  ],
  42: [
    "Zone de livraison des sables bitumineux Kirby",
    "Le gaz qui passe par cet endroit est destiné aux activités de drainage par gravité au moyen de vapeur et de stimulation cyclique par la vapeur des sables bitumineux à Cold Lake qui se trouve à proximité. Ces méthodes de production de pétrole non classiques utilisent le gaz pour produire la vapeur qui sert à chauffer les réservoirs souterrains, permettant ainsi au bitume d’atteindre la surface.",
  ],
  43: [
    "Zone de livraison des sables bitumineux Liege",
    "Le gaz qui passe par cette zone située au nord-ouest de Fort McMurray est habituellement destiné à l’extraction à ciel ouvert et à la récupération in situ des sables bitumineux de l’Athabasca. Les activités d’extraction à ciel ouvert utilisent le gaz naturel pour convertir le bitume extrait en pétrole brut synthétique.",
  ],
  44: [
    "Saturn",
    "Tronçon du réseau de NGTL près de la station de compression du même nom située au sud-ouest de Fort St. John, en Colombie-Britannique. Relie le réseau de NGTL à la production en provenance de la canalisation principale North Montney et à l’installation de stockage Aitken. Composante des livraisons totales au point principal en amont de la rivière James.",
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
      lastYrName: (lastYear) => `Débit ${lastYear} (dernière année de données)`,
      avgName: "Moyenne sur cinq ans",
      rangeName: (min, max) => `Gamme de cinq ans (${min + 1}-${max - 1})`,
      notEnough: "Données insuffisantes pour calculer la moyenne sur cinq ans",
    },
    exportAxis: (unit) => `Exportations (${unit})`,
    importAxis: (unit) => `Importations (${unit})`,
    fiveYrTitle: (pointText) =>
      `${pointText} - Période de cinq ans et fourchette`,
    trafficTitle: (pointText, dirText) =>
      `${pointText} - transport mensuel ${dirText}`,
    flow: "Sens d’écoulement :",
    series: {
      im: "importation",
      in: "Intra-Canada",
      ex: "exportation",
      cap: "Capacité",
      dh: "lourd canadien",
      dln: "léger canadien / ngl",
      fl: "léger étranger",
      dl: "léger canadien",
      rp: "produits pétroliers raffinés",
      co: "condensat",
      ecap: "Capacité exportation",
      icap: "Capacité importation",
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
  },
  apportion: {
    unitsDisclaimerText,
    units,
    points,
    numberFormat,
    title: {
      enbridge: "Commandes d’expédition pour tout le réseau",
      other: "Répartition à :",
    },
    series: {
      an: "Commandes acceptées",
      on: "Commandes d’expédition initiales",
      ac: "Capacité disponible",
      ap: "Pourcentage de répartition",
    },
  },
};
