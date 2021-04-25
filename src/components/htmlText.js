const unitsEn = "Select units:";
const unitsFr = "Choisir une unité :";
const trafficUpdatedEn =
  "Section updated quarterly (early March, mid-May, mid-August and mid-November)";
const trafficUpdatedFr =
  "Section mise à jour trimestrielle (début mars, mi-mai, mi-août et mi-novembre)";
const instructionsEn = "Dashboard instructions";
const instructionsFr = "Dashboard instructions";
const noteEn = "Note:";
const noteFr = "Note:";
const sourceAndDescEn = "Source and description";
const sourceAndDescFr = "Source and description";
const dataSourceEn = "Data Source:";
const dataSourceFr = "Data Source:";
const descriptionEn = "Description:";
const descriptionFr = "Description:";

const en = {
  apportion: {
    header: "Apportionment",
    updated: trafficUpdatedEn,
    p1:
      "A shipper must submit nominations each month to it wishes to move its oil on a pipeline. Shippers must submit nominations for both committed (or contracted) transportation service, if available, as well as uncommitted transportation service. If the total volume of nominations for uncommitted capacity is more than what is available, the pipeline company must “apportion” the nominations.",

    p2:
      "Apportionment is the percentage by which each shipper’s nominated volume is reduced in order to match the pipeline’s uncommitted capacity. Generally, apportionment is applied equally across all shippers seeking to use that capacity: for example, if shipper&nbsp;A nominates 100&nbsp;barrels and shipper&nbsp;B nominates 1&nbsp;000&nbsp;barrels, then, under 10% apportionment, shipper&nbsp;A will be able to ship 90&nbsp;barrels, and shipper&nbsp;B will ship 900&nbsp;barrels.",
    p3:
      "The interactive graph below shows data for nominations and apportionment on the pipeline system.",
    selectUnits: unitsEn,
  },
  traffic: {
    header: "Throughput and capacity",
    updated: trafficUpdatedEn,
    selectKeyPt: "Select key point:",
    selectUnits: unitsEn,
    keyPtMap: "Key Point Map",
    zoomIn: "Zoom In",
    zoomOut: "Zoom Out",
    keyPtTrends: "Key Point Trends",
    keyPtDescription: "Key Point Description",
    instructionsTitle: instructionsEn,
    note: noteEn,
    instructions: {
      one:
        "Click on a key point button above the chart & map to view traffic at a different location. The map shows approximate locations on the pipeline where throughputs & capacity are recorded by the pipeline operator.",
      two:
        "Click and drag your mouse on the area chart to zoom into a desired date range. Click on the Reset Zoom button to reset the full date range.",
      three:
        "Click on the chart legend items below the chart to remove & add sections of data as required.",
      four:
        "The key point trends are calculated using quarterly average traffic at the key point. Natural gas throughput trends are displayed year over year (last full quarter of data compared to the same quarter last year). Crude oil and liquids key point trends are displayed quarter over quarter (last full quarter of data compared to the previous quarter).",
      five:
        "The five year average is calcualted for natural gas key points using the total throughput across all trade types and direction of flows. For bi-directional key points (both export and import) the throughput is displayed for both directions, instead of the five year average.",
    },
    sourceTitle: sourceAndDescEn,
    dataSourceTitle: dataSourceEn,
    descriptionTitle: descriptionEn,
  },
  safety: {
    header: "Safety and Environment",
    complianceBtn: "Conditions Compliance",
    incidentsBtn: "Reported Incidents",
    complianceUpdated: "Section updated March 2021",
    p1:
      "Every pipeline company in Canada must meet federal, provincial or territorial, and local requirements. This includes Acts, Regulations, rules, bylaws, and zoning restrictions. Pipelines are also bound by technical, safety, and environmental standards along with company rules, protocols and management systems. In addition to these requirements, the Commission may add conditions to regulatory instruments that each company must meet. Conditions are project-specific and are designed to protect public and the environment by reducing possible risks identified during the application process.",
    p2: `Condition compliance is part of the CER's oversight and <a href="/en/safety-environment/compliance-enforcement/index.html">enforcement</a> action is taken when required.`,
  },
};

const fr = {
  apportion: {
    header: "Répartition",
    updated: trafficUpdatedFr,
    p1:
      "Les expéditeurs doivent soumettre tous les mois une commande à chaque pipeline que doit traverser leur pétrole. Il leur faut présenter une commande pour le service de transport souscrit (sous contrat), s’il est offert, et pour le service de transport non souscrit. Si le total des commandes dépasse la capacité non souscrite disponible, les transporteurs doivent «&nbsp;répartir&nbsp;» les commandes.",
    p2:
      "La répartition est le pourcentage de réduction appliqué à la commande de chacun des expéditeurs afin de ne pas dépasser la capacité non souscrite disponible. En général, ce pourcentage est appliqué également à tous les expéditeurs ayant passé une commande. Par exemple, si la commande de l’expéditeur&nbsp;A vise 100&nbsp;barils et celle de l’expéditeur&nbsp;B, 1&nbsp;000&nbsp;barils, selon un taux de répartition de 10&nbsp;%, les deux expéditeurs pourront faire transporter 90&nbsp;barils et 900&nbsp;barils.",
    p3:
      "Le graphique interactif ci-dessous présente les données relatives aux commandes et à la répartition sur le <enter pipeline here>",
    selectUnits: unitsFr,
  },
  traffic: {
    header: "Débit et capacité",
    updated: trafficUpdatedFr,
    selectKeyPt: "Select key point:",
    selectUnits: unitsFr,
    keyPtMap: "Key Point Map",
    zoomIn: "Zoom In",
    zoomOut: "Zoom Out",
    keyPtTrends: "Key Point Trends",
    keyPtDescription: "Key Point Description",
    instructionsTitle: instructionsFr,
    note: noteFr,
    instructions: {
      one:
        "Click on a key point button above the chart & map to view traffic at a different location. The map shows approximate locations on the pipeline where throughputs & capacity are recorded by the pipeline operator.",
      two:
        "Click and drag your mouse on the area chart to zoom into a desired date range. Click on the Reset Zoom button to reset the full date range.",
      three:
        "Click on the chart legend items below the chart to remove & add sections of data as required.",
      four:
        "The key point trends are calculated using quarterly average traffic at the key point. Natural gas throughput trends are displayed year over year (last full quarter of data compared to the same quarter last year). Crude oil and liquids key point trends are displayed quarter over quarter (last full quarter of data compared to the previous quarter).",
      five:
        "The five year average is calcualted for natural gas key points using the total throughput across all trade types and direction of flows. For bi-directional key points (both export and import) the throughput is displayed for both directions, instead of the five year average.",
    },
    sourceTitle: sourceAndDescFr,
    dataSourceTitle: dataSourceFr,
    descriptionTitle: descriptionFr,
  },
};

module.exports = { en, fr };
