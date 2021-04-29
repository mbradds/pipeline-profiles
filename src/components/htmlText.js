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
const sourceAndDescFr = "Source et description de la figure";
const dataSourceEn = "Data Source:";
const dataSourceFr = "Source de données :";
const descriptionEn = "Description:";
const descriptionFr = "Description :";

const en = {
  sourceTitle: sourceAndDescEn,
  dataSourceTitle: dataSourceEn,
  descriptionTitle: descriptionEn,
  selectUnits: unitsEn,
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
    dailyData: `Looking for <strong>daily data</strong>? Daily <strong>natural gas</strong> traffic datasets are available on <a href="https://open.canada.ca/data/en/dataset/dc343c43-a592-4a27-8ee7-c77df56afb34" target="_blank" rel="external">Open Government</a>.`,
    trafficSourceLink: `<a href="https://open.canada.ca/data/en/dataset/dc343c43-a592-4a27-8ee7-c77df56afb34" target="_blank" rel="external">Open Government</a>`,
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
  },
  safety: {
    header: "Safety and Environment",
    complianceBtn: "Conditions Compliance",
    incidentsBtn: "Reported Incidents",
    complianceUpdated: "Section updated March 2021",
    conditionsp1:
      "Every pipeline company in Canada must meet federal, provincial or territorial, and local requirements. This includes Acts, Regulations, rules, bylaws, and zoning restrictions. Pipelines are also bound by technical, safety, and environmental standards along with company rules, protocols and management systems. In addition to these requirements, the Commission may add conditions to regulatory instruments that each company must meet. Conditions are project-specific and are designed to protect public and the environment by reducing possible risks identified during the application process.",
    conditionsp2: `Condition compliance is part of the CER's oversight and <a href="/en/safety-environment/compliance-enforcement/index.html">enforcement</a> action is taken when required.`,
    conditionsp3: `Conditions can be related to a specific region, or apply to the pipeline project as a whole. The map below displays the number of in progress and closed conditions mapped to economic regions as defined by <a href="https://www12.statcan.gc.ca/census-recensement/2011/geo/bound-limit/bound-limit-eng.cfm">Statistics Canada.</a>`,
    conditionsp4:
      "Conditions can typically be either in-progress or closed. The CER follows up on in-progress conditions.",
    inProgress: "In-Progress",
    inProgressLst: {
      one:
        "This status refers to conditions that continue to be monitored by the CER. This happens when:",
      two: "condition filings have not yet been received by the CER; or,",
      three:
        "filings have been received but are under review or do not yet meet requirements; or,",
      four:
        "a project is not completed and it has conditions, which have not been met; or,",
      five:
        "a project has a post-construction condition, but a requirement has not yet been completed; or,",
      six:
        "some conditions may be active indefinitely or refer to the continued operation of a pipeline.",
    },
    closed: "Closed",
    closedLst: {
      one: "This status refers to:",
      two:
        "condition requirements that have been satisfied, and no further submissions from the company are required; or",
      three:
        "conditions whose filings or actions apply to a specific phase that have been fulfilled as the phase is completed (i.e. a specific filing during construction phase). Note: comments on the required actions can still be received.",
    },
    inProgressBtn: "In-Progress Conditions with location:",
    closedBtn: "Closed Conditions with location:",
    noLocationBtn: "No Geographic Location (not shown on map):",
    conditionsDescription:
      "The above map displays the number of CER conditions associated with projects approved by the Commission. The map is split into two tabs which show in-progress and closed conditions separately, mapped to an economic region. If a company has no in-progress conditions specific to an economic region, the dashboard will default to show the closed conditions by region. An additional view is available which contains the number of in-progress and closed conditions that don't have a corresponding economic region in the dataset. The map regions are shaded based on the number of conditions, with lighter colored regions containing fewer conditions compared to darker colors. Conditions that apply to more than one region are double counted in the map, and these conditions will appear in the map region total and map region breakdown for each applicable region. The condition counts contained in the map navigation buttons represent total conditions without region double counting.",
    conditionsSourceLink: `<a href="https://open.canada.ca/data/en/dataset/e8402029-2543-4300-bf6a-81a788a08f70" target="_blank" rel="external">Open Government</a>`,
    conditionsOpenData: `Open data can be freely used and shared by anyone for any purpose. The <a href="/open/conditions/conditions.csv">data for these graphs are available [CSV]</a>.`,
    conditionsViz: `Have you checked out the CER's <a href="https://apps2.cer-rec.gc.ca/conditions/" target="_blank" rel="external">interactive conditions data visualization</a>? This tool offers a deep dive into the CER's conditions compliance data and process, exploring conditions across all CER regulated companies by keyword, project, and location.`,
    incidentsHeader: "Pipeline Incidents",
    incidentsUpdated: "Section updated March 2021",
    incidentsp1: `The information presented here is based on CER data (2008 to current) for incidents reported under the
    <a href="https://laws-lois.justice.gc.ca/eng/regulations/sor-99-294/index.html" target="_blank">Onshore Pipeline
      Regulations</a>
    and the
    <a href="https://laws.justice.gc.ca/eng/regulations/SOR-2003-39/index.html" target="_blank">Processing Plant
      Regulations</a>. New data is added quarterly.
    <a href="https://www.cer-rec.gc.ca/en/safety-environment/industry-performance/infographic/index.html"
      target="_blank">Learn more</a>
    on how incident data collection has evolved since the NEB (now the CER)
    was established in 1959.`,
    incidentsp2: `Companies must report events, such as incidents, to the CER in
    accordance with the CER
    <a
      href="/en/about/acts-regulations/cer-act-regulations-guidance-notes-related-documents/canada-energy-regulator-event-reporting-guidelines/index.html">Event
      Reporting Guidelines</a>. Knowing what happened, and why, helps us find ways to prevent them
    from happening again.`,
    incidentsDetails1: {
      one: "What is an incident? (Onshore Pipeline Regulations (OPR))",
      two:
        "As defined in the OPR, “incident” means an occurrence that results in:",
      three: "the death or serious injury to a person;",
      four: "a significant adverse effect on the environment;",
      five: "an unintended fire or explosion;",
      six:
        "an unintended or uncontained release of low vapour pressure (LVP) hydrocarbons in excess of 1.5&nbsp;m&sup3;",
      seven:
        "an unintended or uncontrolled release of gas or high vapour pressure (HVP) hydrocarbons;",
      eight:
        "the operation of a pipeline beyond its design limits as determined under CSA Z662 or CSA Z276 or any operating limits imposed by the CER.",
    },
    incidentsDetails2: {
      one: "What is an incident? (Processing Plant Regulations (PPR))",
      two:
        "As defined in the PPR, “incident” is defined as an occurrence that results or could result in a significant adverse effect on property, the environment, or the safety of persons. For the purposes of incident reporting in the PPR, events that fall under this definition include, but are not limited to:",
      three: "the death or serious injury to a person;",
      four: "a significant adverse effect on the environment;",
      five:
        "an unintended fire or explosion that results in or has the potential to result in damage to company, public/crown or personal property;",
      six:
        "an unintended or uncontained release of low vapour pressure (LVP) hydrocarbons in excess of 1.5&nbsp;m&sup3;",
      seven:
        "an unintended or uncontrolled release of gas, HVP hydrocarbons, hydrogen sulfide or other poisonous gas; or",
      eight:
        "the operation of a plant beyond its design limits or any limits imposed by the CER.",
    },
    incidentsDetails3: {
      one: "Incidents and the CER",
      two:
        "Companies self-report incidents and are expected to take a precautionary approach in doing so. This means that even when there is doubt as to whether an incident should be reported, the company must report it. The approach is, “When in doubt, report.” This is consistent with CER-regulated companies’ responsibility for anticipating, preventing, mitigating and managing incidents of any size or duration.",
      three:
        "The CER reviews all reported incidents to assess whether companies have taken the appropriate corrective actions and to identify potential trends in incidents. Each incident is given a status indicating the current stage of the CER's incident review.",
      four: "CER Status",
      five:
        "<strong>Initially Submitted:</strong> The company has notified the CER that an incident has occurred and provided preliminary information. A review has been initiated.",
      six:
        "<strong>Submitted:</strong> The company has submitted all of the required information and the CER is reviewing the incident.",
      seven:
        "<strong>Closed:</strong> The CER’s incident review has been completed and the file is closed.",
    },
    incidentsDetails4: {
      one: "Incident type definitions: one incident can have multiple types",
      two:
        "<strong>Release of Substance (featured in the dashboard)</strong> - Any time a product is unintentionally released. (Releases of non-gas low pressure products in volumes of less than 1.5&nbsp;m&sup3 are exempt from reporting.)",
      three:
        "<strong>Adverse Environmental Effects</strong> - When any chemical substance is released at a concentration or volume that has the potential to change the ambient environment in a manner that would cause harm to human life, wildlife or vegetation (e.g., glycol, potassium carbonate, methanol, methanol mix from hydrostatic testing, etc.).",
      four: "<strong>Explosion</strong> - An unintended explosion",
      five:
        "<strong>Fatality</strong> - Any death involving employees, contractors or members of the public related to the construction, operation, maintenance or abandonment of pipelines",
      six: "<strong>Fire</strong> - An unintended fire",
      seven:
        "<strong>Operation Beyond Design Limits</strong> Includes situations, such as:",
      eight:
        "over-pressures - i.e., pressures that are higher than the maximum the equipment was designed to safely handle;",
      nine: "vibration beyond design limits;",
      ten:
        "slope movements causing movement in the pipeline beyond design limits;",
      eleven: "pipe exposures in rivers or streams; and",
      twelve:
        "introduction of an inappropriate product (e.g., sour gas in excess of CSA limits)",
      thirteen:
        "Operation beyond design limit is typically linked to an over-pressure of the product in the pipe; however, if a pipe was exposed to excessive vibration and was not designed for this, this could be considered operation beyond design limits. Operation beyond design limits does not include equipment contacting the pipe, or corrosion pits, etc.",
      fourteen:
        "<strong>Serious Injury (CER or Transportation Safety Board)</strong> - Any serious injury involving employees, contractors or members of the public related to the construction, operation or maintenance of pipelines.",
    },
    incidentsCountRadio: "Incident Count",
    incidentsVolRadio: "Incident Volume",
    incidentsMapBtn: "Incident Map",
    incidentsTrendBtn: "Incident Trends",
    incidentsNearMe: "Are there any incidents near me?",
    incidentsSelectRange: "Select range (100km):",
    incidentsFind: "Find Incidents within 100km",
    incidentsRefill: "Refill Map Bubbles",
    incidentsDescription:
      "<strong>Description:</strong> The above map displays the location of product release incidents that have occured on the pipeline system since 2008. The map defaults to show incidents as bubbles which are colored based on the substance released. Incidents on the map can be re-categorized based on the most recently available status of the CER's incident review, the year in which the incident was reported, and the province/territory where the incident occured. The incident map bubble can be switched to show the estimated volume of product released, with larger map bubbles showing larger release volumes relative to other product releases on the system. The incident data can also be toggled to display a stacked bar chart of incidents over time by clicking on the incident trends button above the map. The stacked bars dispaly the number of product release incidents by year, with bar color segments corresponding to the various products released. Similiar to the map, incidents can be re-categorized by clicking on the side buttons to view a breakdown of incidents by status, what happened, why it happened, and province/territory.",
    incidentsSourceLink: `<a href="https://open.canada.ca/data/en/dataset/7dffedc4-23fa-440c-a36d-adf5a6cc09f1" target="_blank" rel="external">Open Government</a>`,
    incidentsOpenData: `Open data can be freely used and shared by anyone for any purpose. The <a href="https://open.canada.ca/data/en/dataset/fd17f08f-f14d-433f-91df-c90a34e1e9a6" target="_blank" rel="external">data for these graphs are available</a>.`,
    incidentsViz: `Have you checked out the CER's <a href="https://apps2.cer-rec.gc.ca/pipeline-incidents/" target="_blank" rel="external">interactive incident data visualization</a>? This tool offers a deep dive into the CER's incident data trends, exploring incidents across all CER regulated companies.`,
  },
};

const fr = {
  sourceTitle: sourceAndDescFr,
  dataSourceTitle: dataSourceFr,
  descriptionTitle: descriptionFr,
  selectUnits: unitsFr,
  apportion: {
    header: "Répartition",
    updated: trafficUpdatedFr,
    p1:
      "Les expéditeurs doivent soumettre tous les mois une commande à chaque pipeline que doit traverser leur pétrole. Il leur faut présenter une commande pour le service de transport souscrit (sous contrat), s’il est offert, et pour le service de transport non souscrit. Si le total des commandes dépasse la capacité non souscrite disponible, les transporteurs doivent «&nbsp;répartir&nbsp;» les commandes.",
    p2:
      "La répartition est le pourcentage de réduction appliqué à la commande de chacun des expéditeurs afin de ne pas dépasser la capacité non souscrite disponible. En général, ce pourcentage est appliqué également à tous les expéditeurs ayant passé une commande. Par exemple, si la commande de l’expéditeur&nbsp;A vise 100&nbsp;barils et celle de l’expéditeur&nbsp;B, 1&nbsp;000&nbsp;barils, selon un taux de répartition de 10&nbsp;%, les deux expéditeurs pourront faire transporter 90&nbsp;barils et 900&nbsp;barils.",
    p3:
      "Le graphique interactif ci-dessous présente les données relatives aux commandes et à la répartition sur le <enter pipeline here>",
  },
  traffic: {
    header: "Débit et capacité",
    updated: trafficUpdatedFr,
    selectKeyPt: "Select key point:",
    keyPtMap: "Key Point Map",
    zoomIn: "Zoom In",
    zoomOut: "Zoom Out",
    keyPtTrends: "Key Point Trends",
    keyPtDescription: "Key Point Description",
    instructionsTitle: instructionsFr,
    note: noteFr,
    dailyData: `Looking for <strong>daily data</strong>? Daily <strong>natural gas</strong> traffic datasets are available on <a href="https://open.canada.ca/data/en/dataset/dc343c43-a592-4a27-8ee7-c77df56afb34" target="_blank" rel="external">Open Government</a>.`,
    trafficSourceLink: `<a href="https://open.canada.ca/data/en/dataset/dc343c43-a592-4a27-8ee7-c77df56afb34" target="_blank" rel="external">Open Government</a>`,
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
  },
  safety: {
    header: "Sécurité et environnement",
    complianceBtn: "Conformité aux conditions",
    incidentsBtn: "Incidents signalés",
    complianceUpdated: "Mise à jour mars 2021",
    conditionsp1:
      "Au Canada, les sociétés pipelinières sont tenues de satisfaire à des exigences fédérales, provinciales ou territoriales et locales, qu’il s’agisse notamment de lois, de règlements municipaux ou autres, de règles ou de restrictions de zonage. Les pipelines doivent aussi respecter des normes techniques, des normes relatives à la sécurité et à la protection de l’environnement, sans oublier les règles internes de la société, ses protocoles et ses systèmes de gestion. La Commission peut aussi intégrer des conditions aux instruments réglementaires qui lient les sociétés. Particulières à chaque projet, ces conditions sont conçues pour protéger le public et l’environnement par l’atténuation des risques possibles relevés durant le processus d’examen de la demande.",
    conditionsp2: `La conformité aux conditions fait partie des activités de surveillance de la Régie, et des mesures <a href="/fr/safety-environment/compliance-enforcement/index.html">d’exécution</a> sont prises au besoin.`,
    conditionsp3: `Les conditions peuvent viser une région précise ou s’appliquer au projet pipelinier dans son ensemble. La carte ci-dessous montre le nombre de conditions en cours et remplies en fonction des régions économiques définies par <a href="https://www12.statcan.gc.ca/census-recensement/2011/geo/bound-limit/bound-limit-fra.cfm">Statistique Canada.</a>`,
    conditionsp4:
      "Les conditions sont habituellement en cours ou remplies. La Régie assure un suivi des conditions en cours.",
    inProgress: "En cours",
    inProgressLst: {
      one:
        "Cet état désigne les conditions dont la Régie continue de faire le suivi. C’est le cas dans les situations suivantes :",
      two:
        "les documents pertinents n’ont pas encore été déposés auprès de la Régie;",
      three:
        "les documents ont été déposés, mais sont à l’étude ou ne répondent pas aux exigences;",
      four:
        "un projet n’est pas terminé et certaines des conditions qui s’y appliquent ne sont pas remplies;",
      five:
        "un projet est soumis à une condition post-construction et celle-ci n’a pas encore été remplie;",
      six:
        "les conditions sont en vigueur indéfiniment ou visent l’exploitation continue d’un pipeline.",
    },
    closed: "Remplies",
    closedLst: {
      one: "Cet état désigne les situations suivantes :",
      two:
        "la société a respecté les exigences de la condition et aucun autre dépôt n’est exigé;",
      three:
        "les conditions, pour lesquelles les documents à déposer ou les mesures à prendre s’appliquent à une étape précise du projet, ont été remplies puisque l’étape est terminée (p. ex., des pièces précises à déposer pendant l’étape de la construction). Remarque : Il demeure possible de recevoir des commentaires sur les mesures à prendre.",
    },
    inProgressBtn: "Conditions en cours avec emplacement :",
    closedBtn: "Conditions remplies avec emplacement :",
    noLocationBtn: "Aucun lieu (non indiqué sur la carte) :",
    conditionsDescription:
      "La carte ci-dessus indique le nombre de conditions imposées par la Régie aux projets approuvés par la Commission. La carte est divisée en deux onglets. Les conditions en cours et les conditions remplies sont ainsi montrées séparément en fonction des régions économiques. Si aucune condition en cours n’est associée à une société pour une région économique précise, le tableau de bord affichera par défaut les conditions remplies par régions. Un autre affichage présente le nombre de conditions en cours et de conditions conformes qui ne sont pas associées à une région économique dans l’ensemble de données. Les régions de la carte sont colorées en fonction du nombre de conditions, celles de couleur plus pâle affichant un nombre réduit de conditions par rapport aux régions plus foncées. Les conditions qui visent plus d’une région sont comptabilisées en double sur la carte et figurent dans le total et la ventilation pour chaque région applicable. Les nombres de conditions qui figurent sur les boutons de navigation de la carte représentent le total des conditions, sans double comptabilisation.",
    conditionsSourceLink: `<a href="https://ouvert.canada.ca/data/fr/dataset/e8402029-2543-4300-bf6a-81a788a08f70" target="_blank" rel="external">Gouvernement ouvert</a>`,
    conditionsOpenData: `Les données ouvertes peuvent être utilisées et transmises librement. Les <a href="/ouvert/conditions/conditions.csv">données pour ces graphiques sont disponibles [CSV]</a>.`,
    conditionsViz: `Avez-vous consulté la <a href="https://apps2.cer-rec.gc.ca/conditions-projet/" target="_blank" rel="external">visualisation interactive des données sur les conditions</a> de la Régie? Cet outil permet un examen détaillé des données et du processus de conformité aux conditions de la Régie. Il est ainsi possible de consulter les conditions pour toutes les sociétés réglementées par la Régie par mot-clé, projet et emplacement.`,
    incidentsHeader: "Incidents pipeliniers",
    incidentsUpdated: "Mise à jour mars 2021",
    incidentsp1: `L’information présentée ici provient des données de la Régie de
    l’énergie du Canada de 2008 à aujourd’hui sur les incidents signalés en
    application du
    <a
      href="https://laws-lois.justice.gc.ca/fra/reglements/DORS-99-294/index.html"
      target="_blank"
      >Règlement de la Régie canadienne de l’énergie sur les pipelines
      terrestres</a
    >
    et du
    <a
      href="https://laws.justice.gc.ca/fra/reglements/DORS-2003-39/index.html"
      target="_blank"
      >Règlement sur les usines de traitement</a
    >. De nouvelles données sont ajoutées tous les trimestres.
    <a
      href="https://www.cer-rec.gc.ca/fr/securite-environnement/rendement-lindustrie/infographie/index.html"
      target="_blank"
      >Obtenez plus d’information</a
    >
    sur l’évolution des méthodes de collecte de données sur les incidents
    depuis la création de l’Office national de l’énergie (maintenant la
    Régie) en 1959.`,
    incidentsp2: `Les sociétés doivent signaler les événements comme les incidents à la
    Régie conformément aux
    <a
      href="/fr/regie/lois-reglements/loi-regie-canadienne-lenergie-reglements-notes-dorientation-documents-connexes/regie-energie-canada-lignes-directrices-rapports-evenement/index.html"
      >Lignes directrices sur les rapports d’événement</a
    >. Le fait de savoir et de comprendre ce qui s’est passé nous aide à
    trouver des moyens de prévenir d’autres incidents similaires.`,
    incidentsDetails1: {
      one:
        "Qu’est-ce qu’un incident? (Règlement de la Régie canadienne de l’énergie sur les pipelines terrestres [le « RPT »])",
      two:
        "Selon la définition qu’en donne le RPT, un « incident » est un événement qui entraîne :",
      three: "le décès d’une personne ou une blessure grave;",
      four: "un effet négatif important sur l’environnement;",
      five: "un incendie ou une explosion non intentionnels;",
      six:
        "un rejet d’hydrocarbures à basse pression de vapeur (« BPV ») non confiné ou non intentionnel de plus de 1,5&nbsp;m&sup3;",
      seven:
        "un rejet de gaz ou d’hydrocarbures à haute pression de vapeur (« HPV ») non intentionnel ou non contrôlé;",
      eight:
        "l’exploitation d’un pipeline au-delà de ses tolérances de conception déterminées selon les normes CSA Z662 ou CSA Z276 ou au-delà des limites d’exploitation imposées par la Régie.",
    },
    incidentsDetails2: {
      one:
        "Qu’est-ce qu’un incident? (Règlement de la Régie canadienne de l’énergie sur les usines de traitement [« RUT »])",
      two:
        "Pour sa part, le RUT définit un « incident » comme étant un fait qui produit ou pourrait produire un effet négatif important sur les biens, l’environnement ou la sécurité des personnes. Aux fins de signalement d’un incident, les événements compris dans la définition que donne le RUT comprennent notamment ceux qui suivent :",
      three: "le décès d’une personne ou une blessure grave;",
      four: "un effet négatif important sur l’environnement;",
      five:
        "un incendie ou une explosion non intentionnels pouvant causer des dommages à des biens de la société, publics ou personnels;",
      six:
        "un rejet d’hydrocarbures à BPV non confiné ou non intentionnel de plus de 1,5&nbsp;m&sup3;",
      seven:
        "un rejet de gaz, d’hydrocarbures à HPV, de sulfure d’hydrogène ou d’autres gaz toxiques non intentionnel ou non contrôlé;",
      eight:
        "l’exploitation d’une usine au-delà de ses tolérances de conception ou au-delà des limites d’exploitation imposées par la Régie.",
    },
    incidentsDetails3: {
      one: "Les incidents et la Régie",
      two:
        "Ce sont les sociétés qui signalent elles-mêmes les incidents, suivant une approche qu’on s’attend être fondée sur la prudence. C’est-à-dire que lorsqu’il y a hésitation quant à la nécessité de signaler un événement, il doit l’être. En d’autres termes, « dans le doute, on signale ». Cette façon de faire est remplies à la responsabilité qu’ont les sociétés réglementées par la Régie de prévoir, de prévenir, d’atténuer et de gérer les incidents, sans égard à leur ampleur ou à leur durée.",
      three:
        "La Régie se penche sur tous les incidents signalés afin de voir si la société a pris les mesures correctives appropriées et aussi pour cerner d’éventuelles tendances. Un statut est attribué à chaque incident afin d’indiquer l’état actuel de l’examen de la Régie.",
      four: "Statut de la Régie",
      five:
        "<strong>Initialement soumis :</strong> La société a informé la Régie qu’un incident était survenu et a fourni les renseignements préliminaires sur celui-ci. Un examen a été entrepris.",
      six:
        "<strong>Soumis :</strong> La société a fourni tous les renseignements exigés et la Régie examine ce qui s’est produit.",
      seven:
        "<strong>Fermé :</strong> La Régie a terminé l’examen de l’incident et a clos le dossier.",
    },
    incidentsDetails4: {
      one:
        "Définitions des types d’incidents : un incident peut être associé à plusieurs types",
      two:
        "<strong>Rejet d’une substance (figure dans le tableau de bord)</strong>- Tout rejet non intentionnel d’un produit. (Les rejets à basse pression de produits autres que du gaz d’un volume inférieur à 1,5&nbsp;m&sup3 n’ont pas à être signalés.)",
      three:
        "<strong>Effets négatifs sur l’environnement</strong> - Lorsqu’il y a rejet d’une substance chimique à une concentration ou dans une quantité suffisante pour modifier l’environnement ambiant et mettre en danger la vie humaine, la faune ou la végétation (p. ex., glycol, carbonate de potassium, méthanol, mélange de méthanol provenant d’un essai hydrostatique, etc.).",
      four: "<strong>Explosion</strong> - Une explosion non intentionnelle.",
      five:
        "<strong>Décès</strong> - Le décès d’un employé, d’un entrepreneur ou d’un membre du public en rapport avec la construction, le fonctionnement, l’entretien ou la cessation d’exploitation d’un pipeline.",
      six: "<strong>Incendie</strong> - Un incendie non intentionnel.",
      seven:
        "<strong>Exploitation au-delà des tolérances de conception</strong>- De telles situations comprennent notamment les suivantes :",
      eight:
        "cas de surpression – lorsque les pressions sont supérieures aux limites établies pour un fonctionnement sans danger de l’équipement.",
      nine: "vibration supérieure aux tolérances de conception;",
      ten:
        "mouvements du sol à l’origine d’un déplacement du pipeline plus grand que celui autorisé selon les limites de conception;",
      eleven: "affleurement d’une conduite dans une rivière ou un ruisseau;",
      twelve:
        "présence d’un produit inapproprié (p. ex., gaz acide au-delà des limites établies par les normes CSA).",
      thirteen:
        "L’exploitation au-delà des tolérances de conception est habituellement liée à une surpression causée par le produit dans la canalisation. Cependant, si cette dernière est soumise à une vibration excessive pour laquelle elle n’a pas été conçue, il pourrait s’agir là encore d’un type d’exploitation au-delà des tolérances de conception, qui n’inclut toutefois pas les chocs avec la conduite, les piqûres de corrosion, etc.",
      fourteen:
        "<strong>Blessure grave (Régie ou Bureau de la sécurité des transports)</strong>- Toute blessure grave causée à un employé, un entrepreneur ou un membre du public en rapport avec la construction, l’exploitation ou l’entretien d’un pipeline.",
    },
    incidentsCountRadio: "Nombre d'incidents",
    incidentsVolRadio: "Volume des incidents",
    incidentsMapBtn: "Carte des incidents",
    incidentsTrendBtn: "Tendance des incidents",
    incidentsNearMe: "Y a-t-il des incidents près de chez moi?",
    incidentsSelectRange: "Sélectionner une plage (100km):",
    incidentsFind: "Rechercher les incidents dans 100km",
    incidentsRefill: "Remplir les bulles de carte",
    incidentsDescription:
      "<strong>Description :</strong> La carte ci-dessus montre l’emplacement des déversements de produit survenus sur le réseau pipelinier depuis 2008. Par défaut, les incidents sont affichés sous forme de bulles qui sont colorées en fonction de la substance rejetée. Les incidents sur la carte peuvent aussi être classés en fonction de l’état d’avancement de l’examen de la Régie, de l’année à laquelle l’incident a été signalé et de la province ou du territoire où l’incident s’est produit. Les bulles de la carte des incidents peuvent également indiquer le volume estimatif des déversements, les bulles plus grandes correspondant à des volumes plus élevés. Il est également possible de présenter les données sur les incidents au fil du temps sous forme de graphique à barres empilées. Pour ce faire, il suffit de cliquer sur le bouton Tendance des incidents situé au-dessus de la carte. Les barres empilées représentent le nombre d’incidents de déversement de produit par année, et les segments de couleur des barres correspondent aux divers produits déversés. Comme sur la carte, les incidents peuvent être reclassés en cliquant sur les boutons latéraux pour afficher la répartition des incidents selon le statut, ce qui s’est produit et pourquoi, et la province ou le territoire touché.",
    incidentsSourceLink: `<a href="https://ouvert.canada.ca/data/fr/dataset/7dffedc4-23fa-440c-a36d-adf5a6cc09f1" target="_blank" rel="external">Gouvernement ouvert</a>`,
    incidentsOpenData: `Les données ouvertes peuvent être utilisées et transmises librement. Les <a href="https://ouvert.canada.ca/data/fr/dataset/fd17f08f-f14d-433f-91df-c90a34e1e9a6" target="_blank" rel="external">données pour ces graphiques sont disponibles</a>.`,
    incidentsViz: `Avez-vous consulté la <a href="https://apps2.cer-rec.gc.ca/incidents-pipeliniers/" target="_blank" rel="external"> visualisation interactive des données sur les incidents</a> de la Régie? Cet outil permet un examen détaillé des tendances relatives aux données sur les incidents de la Régie, et ce, pour les incidents liés à l’ensemble des sociétés réglementées par la Régie.`,
  },
};

module.exports = { en, fr };