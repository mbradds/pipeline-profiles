/**
 * @file Contains all of the HTML text (mainly static paragraphs) in seperate english and french objects.
 * These language objects are imported into webpack, and applied to each profile page via handlebars.
 *
 * This file only handles the HTML specific text. The dashboard text and dynamic text are handled seperately:
 *
 * Dashboard text:
 * Contained in ../modules/langEnglish.js and langFrench.js These files handle the language parameters and text for the
 * highcharts and leaflet based dashboards, including the wet4 buttons, titles, etc.
 *
 * Dynamic text:
 * Handled in ../modules/dynamicText.js with seperate english and french functions. Functions are duplicated (en|fr) to
 * more easily accomodate the different sentence structure, and save on code size (only english methods appear in the
 * english profile-code bundle.)
 *
 */

import { createRequire } from "module";

const require = createRequire(import.meta.url);
const tollsDescription = require("../data_output/tolls/descriptions.json");

const sourceAndDescEn = "Source and description";
const sourceAndDescFr = "Source et description de la figure";
const dataSourceEn = "Data Source:";
const dataSourceFr = "Source de données :";
const descriptionEn = "Description: ";
const descriptionFr = "Description : ";
const sourceTextEn = "Open Government";
const sourceTextFr = "Gouvernement ouvert";

const openGovLink = (link, lang) => {
  let [p1, p2] = ["", ""];
  if (lang === "en") {
    p1 =
      "Open data can be freely used and shared by anyone for any purpose. The ";
    p2 = "data for these graphs are available [CSV]";
  } else if (lang === "fr") {
    p1 =
      "Les données ouvertes peuvent être utilisées et transmises librement. Les ";
    p2 = "données pour ces graphiques sont disponibles [CSV]";
  } else {
    return false;
  }
  return `${p1}<a href="${link}" rel="external">${p2}</a>.`;
};

const en = {
  units: "Select units:",
  trafficUpdated:
    "Section updated quarterly (early March, mid-May, mid-August and mid-November)",
  trafficUpdatedLine9: "Section updated annually (mid-April)",
  instructions: "Dashboard instructions",
  note: "Note:",
  apportion: {
    header: "Apportionment",
    p1: "A shipper must submit nominations each month it wishes to move its oil on a pipeline. Shippers must submit nominations for both committed (or contracted) transportation service, if available, as well as uncommitted transportation service. If the total volume of nominations for uncommitted capacity is more than what is available, the pipeline company must “apportion” the nominations.",

    p2: "Apportionment is the percentage by which each shipper’s nominated volume is reduced in order to match the pipeline’s uncommitted capacity. Generally, apportionment is applied equally across all shippers seeking to use that capacity: for example, if shipper&nbsp;A nominates 100&nbsp;barrels and shipper&nbsp;B nominates 1&nbsp;000&nbsp;barrels, then, under 10% apportionment, shipper&nbsp;A will be able to ship 90&nbsp;barrels, and shipper&nbsp;B will ship 900&nbsp;barrels.",
    p3: {
      other:
        "The interactive graph below shows data for nominations and apportionment on the pipeline system.",
      enbridge:
        "The Enbridge Canadian Mainline consists of multiple different lines, and apportionment can vary depending on the line and key point. In a given month, some lines may be apportioned while others may not be. The interactive graph below shows data for nominations and apportionment on the Enbridge Mainline.",
    },
    description: {
      enbridge:
        "The first chart displays pipeline nomination data for the Enbridge Canadian Mainline at the system level. Original nominations are shown as a blue area on the chart, and accepted nominations are shown as a yellow line. The second series of charts shows detailed apportionment data at the key point level for the Enbridge Canadian Mainline.",
      other:
        "The above chart displays pipeline nomination data for the pipeline system. Original nominations are shown as a blue area on the chart, with available pipeline capacity shown as a yellow line. If available, the apportionment percent can be toggled onto the chart as a green line by clicking on “Apportionment Percent” directly below the chart.",
    },
    source: {
      sourceTitle: sourceAndDescEn,
      dataSourceTitle: dataSourceEn,
      descriptionTitle: descriptionEn,
      sourceText: sourceTextEn,
      sourceLink:
        "https://open.canada.ca/data/en/dataset/dc343c43-a592-4a27-8ee7-c77df56afb34",
      subTextId: "conversion-disclaimer-apportion",
    },
  },
  traffic: {
    header: "Throughput and capacity",
    selectKeyPt: "Select key point:",
    keyPtMap: "Key Point Map",
    zoomIn: "Zoom In",
    zoomOut: "Zoom Out",
    keyPtTrends: "Key Point Trends",
    keyPtDescription: "Key Point Description",
    capacityNote:
      "The physical capacity of a pipeline is based on many factors such as the products being carried, direction of flow, pipeline pumping capacity, and maintenance work or other pressure restrictions. The actual physical capacity of the pipeline may, at times, be higher than the assumed operational capacity stated here.",
    dailyData: `Looking for <strong>daily data</strong>? Daily <strong>natural gas</strong> traffic datasets are available on <a href="https://open.canada.ca/data/en/dataset/dc343c43-a592-4a27-8ee7-c77df56afb34" rel="external">Open Government</a>.`,
    instructions: {
      one: "Click on a key point button above the chart &amp; map to view traffic at a different location. The map shows approximate locations on the pipeline where throughputs &amp; capacity are recorded by the pipeline operator.",
      two: "Click and drag your mouse on the area chart to zoom into the desired date range. Click on the Reset Zoom button to reset the full date range.",
      three:
        "Click on the chart legend items below the chart to remove &amp; add sections of data as required.",
      four: "The key point trends are calculated using quarterly average traffic at the key point. Natural gas throughput trends are displayed year over year (last full quarter of data compared to the same quarter last year). Crude oil and liquids key point trends are displayed quarter over quarter (last full quarter of data compared to the previous quarter).",
      five: "The five-year average is calculated for natural gas key points using the total throughput across all trade types and direction of flows. For bi-directional key points (both export and import) the throughput is displayed for both directions, instead of the five-year average.",
    },
    source: {
      sourceTitle: sourceAndDescEn,
      dataSourceTitle: dataSourceEn,
      descriptionTitle: descriptionEn,
      sourceText: sourceTextEn,
      sourceLink:
        "https://open.canada.ca/data/en/dataset/dc343c43-a592-4a27-8ee7-c77df56afb34",
      description:
        "The above dashboard displays pipeline throughput and capacity at key point(s) along the system. Where possible, the five-year average and five-year range for throughput is shown with the current year throughput to better highlight the trends. For pipeline key points with a defined location, a map is displayed next to the graph showing the approximate key point location where pipeline throughput and capacity are recorded.",
      subTextId: "conversion-disclaimer-traffic",
    },
  },
  safety: {
    header: "Safety and Environment",
    buttons: {
      conditions: "Conditions Compliance",
      incidents: "Reported Incidents",
      oandm: "Operations and Maintenance Activities",
      remediation: "Contaminated Sites and Remediation",
      ua: "Damage Prevention Regulations Contravention Reports",
    },
    updated: {
      conditions: "Section updated August 2022",
      incidents: "Section updated August 2022",
      oandm: "Section updated August 2022",
      remediation: "Section updated August 2022",
      ua: "Section updated August 2022",
    },
    conditions: {
      paragraphs: [
        "Every pipeline company in Canada must meet federal, provincial or territorial, and local requirements. This includes Acts, Regulations, rules, bylaws, and zoning restrictions. Pipelines are also bound by technical, safety, and environmental standards along with company rules, protocols and management systems. In addition to these requirements, the Commission may add conditions to regulatory instruments that each company must meet. Conditions are project-specific and are designed to protect public and the environment by reducing possible risks identified during the application process.",
        `Condition compliance is part of the CER's oversight and <a href="/en/safety-environment/compliance-enforcement/index.html">enforcement</a> action is taken when required.`,
        `Conditions can be related to a specific region, or apply to the pipeline project as a whole. The map below displays the number of in progress and closed conditions mapped to economic regions as defined by <a href="https://www12.statcan.gc.ca/census-recensement/2011/geo/bound-limit/bound-limit-eng.cfm">Statistics Canada.</a>`,
        "Conditions can typically be either in-progress or closed. The CER follows up on in-progress conditions.",
      ],
      details1: {
        listType: "ul",
        summary: "In-Progress",
        introParagraph:
          "This status refers to conditions that continue to be monitored by the CER. This happens when:",
        listItems: [
          {
            text: "condition filings have not yet been received by the CER; or,",
          },
          {
            text: "filings have been received but are under review or do not yet meet requirements; or,",
          },
          {
            text: "a project is not completed and it has conditions, which have not been met; or,",
          },
          {
            text: "a project has a post-construction condition, but a requirement has not yet been completed; or,",
          },
          {
            text: "some conditions may be active indefinitely or refer to the continued operation of a pipeline.",
          },
        ],
      },
      details2: {
        listType: "ul",
        summary: "Closed",
        introParagraph: "This status refers to:",
        listItems: [
          {
            text: "condition requirements that have been satisfied, and no further submissions from the company are required; or",
          },
          {
            text: "conditions whose filings or actions apply to a specific phase that have been fulfilled as the phase is completed (i.e. a specific filing during construction phase). Note: comments on the required actions can still be received.",
          },
        ],
      },
      inProgressBtn: "In-Progress Conditions with location:",
      closedBtn: "Closed Conditions with location:",
      noLocationBtn: "No Geographic Location (not on map):",
      instructions: {
        one: "Click on a region to view conditions info",
        two: "Click map area outside of regions to hide info",
        three:
          "Some conditions apply to multiple regions. Conditions may be double counted across regions, resulting in a higher number of conditions than the totals seen in the buttons above.",
      },
      viz: `Have you checked out the CER's <a href="https://apps2.cer-rec.gc.ca/conditions/">interactive conditions data visualization</a>? This tool offers a deep dive into the CER's conditions compliance data and process, exploring conditions across all CER regulated companies by keyword, project, and location.`,
      source: {
        sourceTitle: sourceAndDescEn,
        dataSourceTitle: dataSourceEn,
        descriptionTitle: descriptionEn,
        sourceText: sourceTextEn,
        sourceLink:
          "https://open.canada.ca/data/en/dataset/e8402029-2543-4300-bf6a-81a788a08f70",
        description:
          "The above map displays the number of CER conditions associated with projects approved by the Commission. The map is split into two tabs which show in-progress and closed conditions separately, mapped to an economic region. If a company has no in-progress conditions specific to an economic region, the dashboard will default to show the closed conditions by region. An additional view is available which contains the number of in-progress and closed conditions that don't have a corresponding economic region in the dataset. The map regions are shaded based on the number of conditions, with lighter coloured regions containing fewer conditions compared to darker colors. Conditions that apply to more than one region are double counted in the map, and these conditions will appear in the map region total and map region breakdown for each applicable region. The condition counts contained in the map navigation buttons represent total conditions without region double counting.",
        openGov: openGovLink("/open/conditions/conditions.csv", "en"),
      },
    },
    incidents: {
      paragraphs: [
        `The information presented here is based on CER data (2008 to current) for incidents reported under the
      <a href="https://laws-lois.justice.gc.ca/eng/regulations/sor-99-294/index.html">Onshore Pipeline
        Regulations</a>
      and the
      <a href="https://laws-lois.justice.gc.ca/eng/regulations/SOR-2003-39/index.html">Processing Plant
        Regulations</a>. New data is added quarterly.
      <a href="/en/safety-environment/industry-performance/infographic/index.html">Learn more</a>
      on how incident data collection has evolved since the NEB (now the CER)
      was established in 1959.`,
        `Companies must report events, such as incidents, to the CER in
    accordance with the CER
    <a
      href="/en/about/acts-regulations/cer-act-regulations-guidance-notes-related-documents/canada-energy-regulator-event-reporting-guidelines/index.html">Event
      Reporting Guidelines</a>. Knowing what happened, and why, helps us find ways to prevent them
    from happening again.`,
      ],
      details1: {
        listType: "ol",
        summary: "What is an incident? (Onshore Pipeline Regulations (OPR))",
        introParagraph:
          "As defined in the OPR, “incident” means an occurrence that results in:",
        listItems: [
          {
            text: "the death or serious injury to a person;",
          },
          {
            text: "a significant adverse effect on the environment;",
          },
          {
            text: "an unintended fire or explosion;",
          },
          {
            text: "an unintended or uncontained release of low vapour pressure (LVP) hydrocarbons in excess of 1.5&nbsp;m&sup3;",
          },
          {
            text: "an unintended or uncontrolled release of gas or high vapour pressure (HVP) hydrocarbons;",
          },
          {
            text: "the operation of a pipeline beyond its design limits as determined under CSA Z662 or CSA Z276 or any operating limits imposed by the CER.",
          },
        ],
      },
      details2: {
        listType: "ol",
        summary: "What is an incident? (Processing Plant Regulations (PPR))",
        introParagraph:
          "As defined in the PPR, “incident” is defined as an occurrence that results or could result in a significant adverse effect on property, the environment, or the safety of persons. For the purposes of incident reporting in the PPR, events that fall under this definition include, but are not limited to:",

        listItems: [
          {
            text: "the death or serious injury to a person;",
          },
          {
            text: "a significant adverse effect on the environment;",
          },
          {
            text: "an unintended fire or explosion that results in or has the potential to result in damage to company, public/crown or personal property;",
          },
          {
            text: "an unintended or uncontained release of low vapour pressure (LVP) hydrocarbons in excess of 1.5&nbsp;m&sup3;",
          },
          {
            text: "an unintended or uncontrolled release of gas, HVP hydrocarbons, hydrogen sulfide or other poisonous gas; or",
          },
          {
            text: "the operation of a plant beyond its design limits or any limits imposed by the CER.",
          },
        ],
      },
      details3: {
        one: "Incidents and the CER",
        two: "Companies self-report incidents and are expected to take a precautionary approach in doing so. This means that even when there is doubt as to whether an incident should be reported, the company must report it. The approach is, “When in doubt, report.” This is consistent with CER-regulated companies’ responsibility for anticipating, preventing, mitigating and managing incidents of any size or duration.",
        three:
          "The CER reviews all reported incidents to assess whether companies have taken the appropriate corrective actions and to identify potential trends in incidents. Each incident is given a status indicating the current stage of the CER's incident review.",
        four: "CER Status",
        five: "<strong>Initially Submitted:</strong> The company has notified the CER that an incident has occurred and provided preliminary information. A review has been initiated.",
        six: "<strong>Submitted:</strong> The company has submitted all of the required information and the CER is reviewing the incident.",
        seven:
          "<strong>Closed:</strong> The CER’s incident review has been completed and the file is closed.",
      },
      details4: {
        one: "Incident type definitions: one incident can have multiple types",
        two: "<strong>Release of Substance (featured in the dashboard)</strong> - Any time a product is unintentionally released. (Releases of non-gas low pressure products in volumes of less than 1.5&nbsp;m&sup3; are exempt from reporting.)",
        three:
          "<strong>Adverse Environmental Effects</strong> - When any chemical substance is released at a concentration or volume that has the potential to change the ambient environment in a manner that would cause harm to human life, wildlife or vegetation (e.g., glycol, potassium carbonate, methanol, methanol mix from hydrostatic testing, etc.).",
        four: "<strong>Explosion</strong> - An unintended explosion",
        five: "<strong>Fatality</strong> - Any death involving employees, contractors or members of the public related to the construction, operation, maintenance or abandonment of pipelines",
        six: "<strong>Fire</strong> - An unintended fire",
        seven:
          "<strong>Operation Beyond Design Limits</strong> Includes situations, such as:",
        eight:
          "over-pressures - i.e., pressures that are higher than the maximum the equipment was designed to safely handle;",
        nine: "vibration beyond design limits;",
        ten: "slope movements causing movement in the pipeline beyond design limits;",
        eleven: "pipe exposures in rivers or streams; and",
        twelve:
          "introduction of an inappropriate product (e.g., sour gas in excess of CSA limits)",
        thirteen:
          "Operation beyond design limit is typically linked to an over-pressure of the product in the pipe; however, if a pipe was exposed to excessive vibration and was not designed for this, this could be considered operation beyond design limits. Operation beyond design limits does not include equipment contacting the pipe, or corrosion pits, etc.",
        fourteen:
          "<strong>Serious Injury (CER or Transportation Safety Board)</strong> - Any serious injury involving employees, contractors or members of the public related to the construction, operation or maintenance of pipelines.",
      },
      dashboard: {
        id: "incidents",
        mapPillIds: ["substance-bar", "status-bar", "year-bar", "province-bar"],
        chartPillIds: [
          "substance-trend",
          "status-trend",
          "what-trend",
          "why-trend",
          "province-trend",
        ],
        hasRadio: true,
        countRadio: "Incident Count",
        volRadio: "Incident Volume",
        mapBtn: "Incident Map",
        trendBtn: "Incident Trends",
        nearby: {
          type: "incidents",
          header: "Are there any incidents near me?",
          selectRange: "Select range (100km):",
          find: "Find Incidents within 100km",
          refill: "Refill Map Bubbles",
        },
        source: {
          sourceTitle: sourceAndDescEn,
          dataSourceTitle: dataSourceEn,
          descriptionTitle: descriptionEn,
          sourceText: sourceTextEn,
          sourceLink:
            "https://open.canada.ca/data/en/dataset/7dffedc4-23fa-440c-a36d-adf5a6cc09f1",
          description:
            "The above map displays the location of product release incidents that have occurred on the pipeline system since 2008. The map defaults to show incidents as bubbles which are coloured based on the substance released. Incidents on the map can be re-categorized based on the most recently available status of the CER's incident review, the year in which the incident was reported, and the province/territory where the incident occurred. The incident map bubble can be switched to show the estimated volume of product released, with larger map bubbles showing larger release volumes relative to other product releases on the system. The incident data can also be toggled to display a stacked bar chart of incidents over time by clicking on the incident trends button above the map. The stacked bars display the number of product release incidents by year, with bar colour segments corresponding to the various products released. Similar to the map, incidents can be re-categorized by clicking on the side buttons to view a breakdown of incidents by status, what happened, why it happened, and province/territory.",
          openGov: openGovLink(
            "https://open.canada.ca/data/en/dataset/fd17f08f-f14d-433f-91df-c90a34e1e9a6",
            "en"
          ),
        },
      },
      viz: `Have you checked out the CER's <a href="https://apps2.cer-rec.gc.ca/pipeline-incidents/">interactive incident data visualization</a>? This tool offers a deep dive into the CER's incident data trends, exploring incidents across all CER regulated companies.`,
    },
    remediation: {
      paragraphs: [
        "As part of the CER’s environmental protection activities, we require companies to manage and remediate contamination throughout the lifecycle of the facilities. As a first step, regulated companies are required to report contamination to the CER through the online submission of the Notification of Contamination (NOC).",
        `After the NOC is submitted, companies must demonstrate they are
        actively managing the contamination according to the
        <a href="/en/safety-environment/environment/remediation/remediation-process-guide-2020/index.html">Remediation Process Guide</a>. The progress and current status of remediation at the
        contaminated site are captured in the annual
        update submitted by a company each year for a contaminated site.`,
        "Third party contamination is on-site contamination that is shown to not be emanating or migrating from the company’s facilities or company-owned or leased lands or Right-of-Way. While third-party contamination is not the result of company activities, the CER still requires that this contamination is reported to the CER through the submission of the NOC.",
        `The dashboard below contains information that is contained in the NOC's
        and annual updates found in REGDOCS. The CER publishes NOCs that have
        been submitted to the CER since August 2018, when the CER started
        collecting this information electronically and annual updates that have
        been submitted since 2021. For information on contaminated sites for
        which NOCs were submitted prior to August 2018, email
        <a href="mailto:remediation@cer-rec.gc.ca">remediation@cer-rec.gc.ca</a>.`,
        "There are many different methods and approaches to remediate contamination. Thus, when a company submits a plan for remediation (i.e., remedial action plan) for CER review, they are required to include an options analysis to support the remedial method chosen, select appropriate remediation criteria and demonstrate engagement with potentially affected persons, among other requirements. CER analysts also review closure reports submitted by the company once the remediation is completed to ensure remediation has been completed appropriately.",
      ],
      dashboard: {
        id: "remediation",
        mapPillIds: [
          "rem-year-bar",
          "rem-province-bar",
          "rem-water-bar",
          "rem-use-bar",
        ],
        chartPillIds: [
          "rem-status-trend",
          "rem-activity-trend",
          "rem-pipeline-trend",
          "rem-contaminant-trend",
        ],
        hasRadio: false,
        mapBtn: "Contaminated Sites Map",
        trendBtn: "Contaminated Sites Trends",
        nearby: {
          type: "remediation",
          header: "Are there any contaminated sites near me?",
          selectRange: "Select range (100km):",
          find: "Find sites within 100km",
          refill: "Refill Map Bubbles",
        },
        source: {
          sourceTitle: sourceAndDescEn,
          dataSourceTitle: dataSourceEn,
          descriptionTitle: descriptionEn,
          sourceText: sourceTextEn,
          sourceLink: "https://open.canada.ca/data/en/organization/cer-rec",
          description:
            "The above map displays the approximate location of contaminated sites that have been reported since August 2018. The map defaults to show contaminated sites as bubbles which are coloured based on the year the Notice of Contamination was submitted. Contaminated sites on the map can be re-categorized based on the province/territory, if the site is within 30 metres of a water body, and the applicable land use at the site. The contaminated sites can also be toggled to display a stacked bar chart of events over time by clicking on the contaminated sites trends button above the map. The stacked bars display the number of contaminated sites reported by year. Like the map, contaminated sites can be re-categorized by clicking on the side buttons to view a breakdown of contaminated sites by site status, activity at time of discovery, pipeline or facility, and contaminant type.",
          openGov: openGovLink(
            "https://open.canada.ca/data/en/organization/cer-rec",
            "en"
          ),
        },
      },
    },
    oandm: {
      paragraphs: [
        "Oil and gas pipeline companies regularly conduct routine operations and maintenance (O&#38;M) activities on CER regulated pipelines. These activities include things such as pipeline repairs, investigative and integrity digs, and many other activities while promoting safety, security, environmental protection, economic efficiency, and respect for the rights of those that may be affected.",
        'Companies are required to adhere to <a href="https://laws-lois.justice.gc.ca/eng/regulations/sor-99-294/index.html"><i>Canadian Energy Regulator Act’s Onshore Pipeline Regulations</i></a> and operate their facilities in a manner that is safe and protects the environment. Authorizations for pipelines typically allow companies to construct and operate a facility, and companies are not required to apply for additional approval to undertake most O&#38;M activities. In certain circumstances, companies are required to notify the CER in advance with sufficient information to make a determination as to whether to inspect O&#38;M activities that could result in safety consequences to landowners or the public, environmental consequences, or a negative impact on normal third-party use of the right-of-way (ROW) or adjacent property.',
      ],
      details1: {
        listType: "ol",
        summary:
          "What activities are O&#38;M activities (eligible activities)?",
        introParagraph: "Operations and maintenance activities include:",
        listItems: [
          {
            text: "All activities necessary to safely operate an existing pipeline;",
          },
          {
            text: "Maintenance activities, upgrades or repairs to an existing pipeline or part of a pipeline that do not increase the approved maximum operating pressure (MOP), the stress level or diameter of the pipeline; or",
          },
          {
            text: "Physically removing an existing section of pipe up to 5 km in length, and putting a new section of pipe in its place, as long as this replacement does not increase the approved MOP, stress level or diameter of the pipeline.",
          },
        ],
      },
      details2: {
        listType: "ol",
        summary:
          "What O&#38;M Activities require CER approval (restrictions on eligible activities)?",
        introParagraph:
          "Where any of the following restrictions exist, the company must apply to the Commission in accordance with the <i>CER Act</i> and the related regulations and may not carry out the proposed activity until approval from the Commission has been obtained. The restrictions apply where:",
        listItems: [
          {
            text: "The work includes welding on an in-service pipeline by a pipeline company that has not previously performed in-service welding in accordance with the requirements of CSA Z662-15, Clause 7.17, ‘Welding on In-Service Piping’, or the equivalent clause in the most recent edition of CSA Z662; or",
          },
          {
            text: "The work involves the construction of an aerial crossing, excluding work on company owned or leased land relating to facilities (e.g., terminal stations, processing plants, compressor/pump stations).",
          },
        ],
      },
      details3: {
        listType: "ol",
        summary:
          "What kinds of activities are not O&#38;M activities (ineligible activities)?",
        introParagraph: "O&#38;M activities do not include:",
        listItems: [
          {
            text: "Upgrades that result in increases above previously approved and specified levels to:",
            subList: [
              "the MOP,",
              "stress levels,",
              "the diameter of the pipeline, and/or",
              "airborne emissions or noise levels.",
            ],
          },
          {
            text: `"Looping" (i.e., adding pipe parallel or adjacent to, and interconnected with, an existing pipeline for the general purpose of increasing capacity);`,
          },
          {
            text: "Construction of a new pipeline; or",
          },
          {
            text: "Deactivation (for longer than 12 months), reactivation (where a pipeline has been deactivated for more than 12 months), decommissioning, or abandonment. ",
          },
        ],
      },
      alert: `The dashboard and figures presented below only include O&#38;M
      activities from 2015 onwards that require notification to the CER.
      Consult the
      <a href="/en/about/acts-regulations/cer-act-regulations-guidance-notes-related-documents/onshore-pipeline/operations-maintenance-activities-pipelines-under-national-energy-board-act-requirements-guidance-notes-2.html">O&#38;M Requirements and Guidance Notes</a>
      for a list of O&#38;M event activities that call for notification to be
      filed with the CER.`,
      guidelines: `View the
      <a href="/en/about/acts-regulations/cer-act-regulations-guidance-notes-related-documents/onshore-pipeline/operations-maintenance-activities-pipelines-under-national-energy-board-act-requirements-guidance-notes-2.html">requirements and guidance notes</a>
      (O&#38;M Guidelines) for more information on how these events are
      regulated while promoting safety, security, environmental
      protection, economic efficiency, and respect for the rights of
      those that may be affected.`,
      dashboard: {
        id: "oandm",
        chartPillIds: [
          "oandm-region-trend",
          "oandm-dig-trend",
          "oandm-instream-trend",
          "oandm-fish-trend",
          "oandm-species-trend",
        ],
      },
      source: {
        sourceTitle: sourceAndDescEn,
        dataSourceTitle: dataSourceEn,
        descriptionTitle: descriptionEn,
        sourceText: sourceTextEn,
        sourceLink:
          "https://open.canada.ca/data/en/dataset/1c47ebcc-17fd-4954-811f-3cdd0c30bf86",
        description:
          "The above bar chart displays the number of O&#38;M activities from 2015 to current, arranged based on the starting year of the activity. Each bar is stacked based on several parameters, with the default view showing the province/territory where the O&#38;M activity occurred. Navigation buttons to the right of the bar chart provide the option to view the number of O&#38;M activities by province/territory, if the activity includes an integrity dig, if in-stream work is required, if there are fish present, and if there are species at risk present.",
        openGov: openGovLink(
          "https://open.canada.ca/data/en/dataset/1c47ebcc-17fd-4954-811f-3cdd0c30bf86",
          "en"
        ),
      },
    },
    ua: {
      paragraphs: [
        "Damage prevention is where people and pipelines meet; it is the proactive process that keeps people, the environment, and pipelines safe.",
        "The CER takes action to protect Canadians and the environment. Some of these actions include the regulation of activities near the pipelines that we regulate. Unauthorized activities on or around pipelines are unsafe and illegal. If pipelines are contacted or damaged, the result could be very serious.",
        "The <a href='https://www.cer-rec.gc.ca/en/about/acts-regulations/cer-act-regulations-guidance-notes-related-documents/damage-prevention-regulations/index.html'>CER Damage Prevention Regulations (DPRs)</a> outline the obligations of the pipeline companies to have robust damage prevention and public awareness programs that provide people living and working near pipelines the information to ensure those activities near their pipelines are done safely with respect to the pipeline. The DPRs also outline the requirements for people living and working near pipelines to communicate with pipeline companies when they are planning any construction activity (digging, building, driving on the right-of-way) and to follow the instructions that the pipeline company gives them.",
        "Damage prevention is a shared responsibility, and we all play a part in making sure that everyone stays safe when working near a pipeline.",
        "Pipeline companies must immediately report to the CER any activity near their pipeline that does not follow the rules and specifications set out in the DPRs. These violations are called contravention reports. The CER provides an Open Government dataset containing information on each reported contravention. Some summary statistics and a dashboard displaying this data is available below.",
      ],
      dashboard: {
        id: "unauthorized-activities",
        mapPillIds: [
          "ua-damage-bar",
          "ua-disturbance-bar",
          "ua-year-bar",
          "ua-who-discovered-bar",
        ],
        chartPillIds: [
          "ua-type-trend",
          "ua-damage-trend",
          "ua-who-discovered-trend",
          "ua-method-trend",
        ],
        hasRadio: false,
        mapBtn: "DPR Contravention Reports Map",
        trendBtn: "DPR Contravention Reports Trends",
        nearby: {
          type: "unauthorized-activities",
          header: "Are there any DPR contraventions near me?",
          selectRange: "Select range (100km):",
          find: "Find activities within 100km",
          refill: "Refill Map Bubbles",
        },
        source: {
          sourceTitle: sourceAndDescEn,
          dataSourceTitle: dataSourceEn,
          descriptionTitle: descriptionEn,
          sourceText: sourceTextEn,
          sourceLink:
            "https://open.canada.ca/data/en/dataset/43c4a4ea-6da8-4b02-8f07-986caafd9223",
          description: "Coming soon!",
          openGov: openGovLink(
            "https://open.canada.ca/data/en/dataset/43c4a4ea-6da8-4b02-8f07-986caafd9223",
            "en"
          ),
        },
      },
    },
  },
  tolls: {
    header: "Tolls (in progress)",
    updated: "Section updated July 2022",
    descriptionHeader: "System Tolls Description",
  },
};

const fr = {
  units: "Choisir une unité :",
  trafficUpdated:
    "Section mise à jour tous les trimestres (début mars, mi-mai, mi-août et mi-novembre)",
  trafficUpdatedLine9: "Section mise à jour annuellement (mi-avril)",
  instructions: "Instructions pour le tableau de bord",
  note: "Remarque :",
  apportion: {
    header: "Répartition",
    p1: "Les expéditeurs doivent soumettre tous les mois une commande à chaque pipeline que doit traverser leur pétrole. Il leur faut présenter une commande pour le service de transport souscrit (sous contrat), s’il est offert, et pour le service de transport non souscrit. Si le total des commandes dépasse la capacité non souscrite disponible, les transporteurs doivent «&nbsp;répartir&nbsp;» les commandes.",
    p2: "La répartition est le pourcentage de réduction appliqué à la commande de chacun des expéditeurs afin de ne pas dépasser la capacité non souscrite disponible. En général, ce pourcentage est appliqué également à tous les expéditeurs ayant passé une commande. Par exemple, si la commande de l’expéditeur&nbsp;A vise 100&nbsp;barils et celle de l’expéditeur&nbsp;B, 1&nbsp;000&nbsp;barils, selon un taux de répartition de 10&nbsp;%, les deux expéditeurs pourront faire transporter 90&nbsp;barils et 900&nbsp;barils.",
    p3: {
      other:
        "Le graphique interactif ci-dessous présente les données relatives aux commandes d’expédition et à la répartition sur le réseau pipelinier.",
      enbridge:
        "Le réseau principal au Canada d’Enbridge comprend de multiples canalisations, et la répartition peut varier selon la canalisation et le point principal. Au cours d’un mois donné, certaines canalisations peuvent faire l’objet d’une répartition et d’autres, non. Le graphique interactif ci-dessous présente les données relatives aux commandes et à la répartition sur le réseau principal d’Enbridge.",
    },
    description: {
      enbridge:
        "Le premier graphique présente les données sur les commandes d’expédition pour l’ensemble du réseau principal au Canada d’Enbridge. Les commandes d’expédition originales sont indiquées en bleu et les commandes acceptées, par une ligne jaune. La deuxième série de graphiques présente les données détaillées sur la répartition aux points principaux du réseau principal au Canada d’Enbridge.",
      other:
        "Le graphique ci-dessus présente les données sur les commandes d’expédition des pipelines pour l’ensemble du réseau. Les commandes d’expédition originales sont indiquées en bleu sur le graphique et la capacité pipelinière, par une ligne jaune. Si le pourcentage de répartition est disponible, il est possible de faire basculer vers le graphique sous forme d’une ligne verte en cliquant sur « Pourcentage de répartition » directement sous le graphique.",
    },
    source: {
      sourceTitle: sourceAndDescFr,
      dataSourceTitle: dataSourceFr,
      descriptionTitle: descriptionFr,
      sourceText: sourceTextFr,
      sourceLink:
        "https://ouvert.canada.ca/data/fr/dataset/dc343c43-a592-4a27-8ee7-c77df56afb34",
      subTextId: "conversion-disclaimer-apportion",
    },
  },
  traffic: {
    header: "Débit et capacité",
    selectKeyPt: "Sélectionnez un point principal :",
    keyPtMap: "Carte des principaux points",
    zoomIn: "Zoom avant",
    zoomOut: "Zoom arrière",
    keyPtTrends: "Tendances des principaux points",
    keyPtDescription: "Description des principaux points",
    capacityNote:
      "La capacité physique d’un pipeline dépend de nombreux facteurs, tels que les produits transportés, le sens d’écoulement, la capacité de pompage du pipeline, les travaux d’entretien et les restrictions de pression. La capacité physique réelle du pipeline peut parfois être supérieure à la capacité opérationnelle hypothétique indiquée ici.",
    dailyData: `Vous recherchez des  <strong>données quotidiennes</strong>? Des ensembles de données quotidiennes sur le trafic de gaz naturel sont disponibles sur <a href="https://open.canada.ca/data/fr/dataset/dc343c43-a592-4a27-8ee7-c77df56afb34" rel="external">Gouvernement ouvert</a>.`,
    instructions: {
      one: "Cliquez sur un point principal au-dessus du graphique et de la carte pour voir le transport à un autre endroit. La carte montre les emplacements approximatifs sur le pipeline où l’exploitant du pipeline enregistre les débits et la capacité.",
      two: "Cliquez et faites glisser votre souris sur le graphique pour faire un zoom jusqu’à la plage de dates souhaitée. Cliquez sur le bouton Réinitialiser le zoom pour réinitialiser toute la plage de dates.",
      three:
        "Cliquez sur les éléments de la légende sous le graphique pour supprimer et ajouter des sections de données au besoin.",
      four: "Les tendances des principaux points sont calculées à partir du transport moyen trimestriel au point principal. Les tendances de débit de gaz naturel sont présentées d’une année à l’autre (données du dernier trimestre complet par rapport au même trimestre l’année précédente). Les tendances pour le pétrole brut et les liquides aux principaux points sont présentées d’un trimestre à l’autre (dernier trimestre complet par rapport au trimestre précédent).",
      five: "La moyenne sur cinq ans est calculée pour les principaux points pour le gaz naturel à partir du débit total pour tous les types d’échanges commerciaux et le sens d’écoulement. Pour les principaux points dans les deux sens (exportations et importations), le débit est affiché pour les deux directions, au lieu de la moyenne sur cinq ans.",
    },
    source: {
      sourceTitle: sourceAndDescFr,
      dataSourceTitle: dataSourceFr,
      descriptionTitle: descriptionFr,
      sourceText: sourceTextFr,
      sourceLink:
        "https://ouvert.canada.ca/data/fr/dataset/dc343c43-a592-4a27-8ee7-c77df56afb34",
      description:
        "Le tableau de bord ci-dessus indique le débit et la capacité du pipeline aux principaux points sur le réseau. Lorsque cela est possible, la moyenne sur cinq ans et la fourchette de débit sur cinq ans sont illustrées avec le débit de l’année en cours pour mieux faire ressortir les tendances. Pour les principaux points du pipeline dont l’emplacement est défini, une carte est affichée à côté du graphique, montrant l’emplacement approximatif où le débit et la capacité du pipeline sont enregistrés.",
      subTextId: "conversion-disclaimer-traffic",
    },
  },
  safety: {
    header: "Sécurité et environnement",
    buttons: {
      conditions: "Conformité aux conditions",
      incidents: "Incidents signalés",
      oandm: "Activités d’exploitation et d’entretien",
      remediation: "Sites contaminés et assainissement",
      ua: "Unauthorized Activities FR",
    },
    updated: {
      conditions: "Mise à jour : aout 2022",
      incidents: "Mise à jour : aout 2022",
      oandm: "Mise à jour : aout 2022",
      remediation: "Mise à jour : aout 2022",
      ua: "Mise à jour : aout 2022",
    },
    conditions: {
      paragraphs: [
        "Au Canada, les sociétés pipelinières sont tenues de satisfaire à des exigences fédérales, provinciales ou territoriales et locales, qu’il s’agisse notamment de lois, de règlements municipaux ou autres, de règles ou de restrictions de zonage. Les pipelines doivent aussi respecter des normes techniques, des normes relatives à la sécurité et à la protection de l’environnement, sans oublier les règles internes de la société, ses protocoles et ses systèmes de gestion. La Commission peut aussi intégrer des conditions aux instruments réglementaires qui lient les sociétés. Particulières à chaque projet, ces conditions sont conçues pour protéger le public et l’environnement par l’atténuation des risques possibles relevés durant le processus d’examen de la demande.",
        `La conformité aux conditions fait partie des activités de surveillance de la Régie, et des <a href="/fr/securite-environnement/conformite-execution/index.html">mesures d’exécution</a> sont prises au besoin.`,
        `Les conditions peuvent viser une région précise ou s’appliquer au projet pipelinier dans son ensemble. La carte ci-dessous montre le nombre de conditions en cours et remplies en fonction des régions économiques définies par <a href="https://www12.statcan.gc.ca/census-recensement/2011/geo/bound-limit/bound-limit-fra.cfm">Statistique Canada.</a>`,
        "Les conditions sont habituellement en cours ou remplies. La Régie assure un suivi des conditions en cours.",
      ],
      details1: {
        listType: "ul",
        summary: "En cours",
        introParagraph:
          "Cet état désigne les conditions dont la Régie continue de faire le suivi. C’est le cas dans les situations suivantes :",
        listItems: [
          {
            text: "les documents pertinents n’ont pas encore été déposés auprès de la Régie;",
          },
          {
            text: "les documents ont été déposés, mais sont à l’étude ou ne répondent pas aux exigences;",
          },
          {
            text: "un projet n’est pas terminé et certaines des conditions qui s’y appliquent ne sont pas remplies;",
          },
          {
            text: "un projet est soumis à une condition post-construction et celle-ci n’a pas encore été remplie;",
          },
          {
            text: "les conditions sont en vigueur indéfiniment ou visent l’exploitation continue d’un pipeline.",
          },
        ],
      },
      details2: {
        listType: "ul",
        summary: "Remplies",
        introParagraph: "Cet état désigne les situations suivantes :",
        listItems: [
          {
            text: "la société a respecté les exigences de la condition et aucun autre dépôt n’est exigé;",
          },
          {
            text: "les conditions, pour lesquelles les documents à déposer ou les mesures à prendre s’appliquent à une étape précise du projet, ont été remplies puisque l’étape est terminée (p. ex., des pièces précises à déposer pendant l’étape de la construction). Remarque : Il demeure possible de recevoir des commentaires sur les mesures à prendre.",
          },
        ],
      },
      inProgressBtn: "Conditions en cours avec emplacement :",
      closedBtn: "Conditions remplies avec emplacement :",
      noLocationBtn: "Aucun lieu (non indiqué sur la carte) :",
      viz: `Avez-vous consulté la <a href="https://apps2.cer-rec.gc.ca/conditions-projet/">visualisation interactive des données sur les conditions</a> de la Régie? Cet outil permet un examen détaillé des données et du processus de conformité aux conditions de la Régie. Il est ainsi possible de consulter les conditions pour toutes les sociétés réglementées par la Régie par mot-clé, projet et emplacement.`,
      instructions: {
        one: "Cliquer sur une région pour consulter les renseignements sur les conditions.",
        two: "Cliquer sur la carte à l’extérieur des régions pour masquer l’information.",
        three:
          "Certaines conditions s’appliquent à plusieurs régions. Certaines conditions peuvent être comptées en double d’une région à l’autre, ce qui donne un nombre plus élevé de conditions que les totaux indiqués dans les boutons ci-dessus.",
      },
      source: {
        sourceTitle: sourceAndDescFr,
        dataSourceTitle: dataSourceFr,
        descriptionTitle: descriptionFr,
        sourceText: sourceTextFr,
        sourceLink:
          "https://ouvert.canada.ca/data/fr/dataset/e8402029-2543-4300-bf6a-81a788a08f70",
        description:
          "La carte ci-dessus indique le nombre de conditions imposées par la Régie aux projets approuvés par la Commission. La carte est divisée en deux onglets. Les conditions en cours et les conditions remplies sont ainsi montrées séparément en fonction des régions économiques. Si aucune condition en cours n’est associée à une société pour une région économique précise, le tableau de bord affichera par défaut les conditions remplies par régions. Un autre affichage présente le nombre de conditions en cours et de conditions conformes qui ne sont pas associées à une région économique dans l’ensemble de données. Les régions de la carte sont colorées en fonction du nombre de conditions, celles de couleur plus pâle affichant un nombre réduit de conditions par rapport aux régions plus foncées. Les conditions qui visent plus d’une région sont comptabilisées en double sur la carte et figurent dans le total et la ventilation pour chaque région applicable. Les nombres de conditions qui figurent sur les boutons de navigation de la carte représentent le total des conditions, sans double comptabilisation.",
        openGov: openGovLink("/ouvert/conditions/conditions.csv", "fr"),
      },
    },
    incidents: {
      paragraphs: [
        `L’information présentée ici provient des données de la Régie de
      l’énergie du Canada de 2008 à aujourd’hui sur les incidents signalés en
      application du
      <a
        href="https://laws-lois.justice.gc.ca/fra/reglements/DORS-99-294/index.html"
        >Règlement de la Régie canadienne de l’énergie sur les pipelines
        terrestres</a
      >
      et du
      <a
        href="https://laws-lois.justice.gc.ca/fra/reglements/DORS-2003-39/index.html"
        >Règlement sur les usines de traitement</a
      >. De nouvelles données sont ajoutées tous les trimestres.
      <a
        href="/fr/securite-environnement/rendement-lindustrie/infographie/index.html"
        >Obtenez plus d’information</a
      >
      sur l’évolution des méthodes de collecte de données sur les incidents
      depuis la création de l’Office national de l’énergie (maintenant la
      Régie) en 1959.`,
        `Les sociétés doivent signaler les événements comme les incidents à la
    Régie conformément aux
    <a
      href="/fr/regie/lois-reglements/loi-regie-canadienne-lenergie-reglements-notes-dorientation-documents-connexes/regie-energie-canada-lignes-directrices-rapports-evenement/index.html"
      >Lignes directrices sur les rapports d’événement</a
    >. Le fait de savoir et de comprendre ce qui s’est passé nous aide à
    trouver des moyens de prévenir d’autres incidents similaires.`,
      ],
      details1: {
        listType: "ol",
        summary:
          "Qu’est-ce qu’un incident? (Règlement de la Régie canadienne de l’énergie sur les pipelines terrestres [le « RPT »])",
        introParagraph:
          "Selon la définition qu’en donne le RPT, un « incident » est un événement qui entraîne :",
        listItems: [
          {
            text: "le décès d’une personne ou une blessure grave;",
          },
          {
            text: "un effet négatif important sur l’environnement;",
          },
          {
            text: "un incendie ou une explosion non intentionnels;",
          },
          {
            text: "un rejet d’hydrocarbures à basse pression de vapeur (« BPV ») non confiné ou non intentionnel de plus de 1,5&nbsp;m&sup3;",
          },
          {
            text: "un rejet de gaz ou d’hydrocarbures à haute pression de vapeur (« HPV ») non intentionnel ou non contrôlé;",
          },
          {
            text: "l’exploitation d’un pipeline au-delà de ses tolérances de conception déterminées selon les normes CSA Z662 ou CSA Z276 ou au-delà des limites d’exploitation imposées par la Régie.",
          },
        ],
      },
      details2: {
        listType: "ol",
        summary:
          "Qu’est-ce qu’un incident? (Règlement de la Régie canadienne de l’énergie sur les usines de traitement [« RUT »])",
        introParagraph:
          "Pour sa part, le RUT définit un « incident » comme étant un fait qui produit ou pourrait produire un effet négatif important sur les biens, l’environnement ou la sécurité des personnes. Aux fins de signalement d’un incident, les événements compris dans la définition que donne le RUT comprennent notamment ceux qui suivent :",
        listItems: [
          {
            text: "le décès d’une personne ou une blessure grave;",
          },
          {
            text: "un effet négatif important sur l’environnement;",
          },
          {
            text: "un incendie ou une explosion non intentionnels pouvant causer des dommages à des biens de la société, publics ou personnels;",
          },
          {
            text: "un rejet d’hydrocarbures à BPV non confiné ou non intentionnel de plus de 1,5&nbsp;m&sup3;",
          },
          {
            text: "un rejet de gaz, d’hydrocarbures à HPV, de sulfure d’hydrogène ou d’autres gaz toxiques non intentionnel ou non contrôlé;",
          },
          {
            text: "l’exploitation d’une usine au-delà de ses tolérances de conception ou au-delà des limites d’exploitation imposées par la Régie.",
          },
        ],
      },
      details3: {
        one: "Les incidents et la Régie",
        two: "Ce sont les sociétés qui signalent elles-mêmes les incidents, suivant une approche qu’on s’attend être fondée sur la prudence. C’est-à-dire que lorsqu’il y a hésitation quant à la nécessité de signaler un événement, il doit l’être. En d’autres termes, « dans le doute, on signale ». Cette façon de faire est remplies à la responsabilité qu’ont les sociétés réglementées par la Régie de prévoir, de prévenir, d’atténuer et de gérer les incidents, sans égard à leur ampleur ou à leur durée.",
        three:
          "La Régie se penche sur tous les incidents signalés afin de voir si la société a pris les mesures correctives appropriées et aussi pour cerner d’éventuelles tendances. Un statut est attribué à chaque incident afin d’indiquer l’état actuel de l’examen de la Régie.",
        four: "Statut de la Régie",
        five: "<strong>Initialement soumis :</strong> La société a informé la Régie qu’un incident était survenu et a fourni les renseignements préliminaires sur celui-ci. Un examen a été entrepris.",
        six: "<strong>Soumis :</strong> La société a fourni tous les renseignements exigés et la Régie examine ce qui s’est produit.",
        seven:
          "<strong>Fermé :</strong> La Régie a terminé l’examen de l’incident et a clos le dossier.",
      },
      details4: {
        one: "Définitions des types d’incidents : un incident peut être associé à plusieurs types",
        two: "<strong>Rejet d’une substance (figure dans le tableau de bord)</strong>- Tout rejet non intentionnel d’un produit. (Les rejets à basse pression de produits autres que du gaz d’un volume inférieur à 1,5&nbsp;m&sup3; n’ont pas à être signalés.)",
        three:
          "<strong>Effets négatifs sur l’environnement</strong> - Lorsqu’il y a rejet d’une substance chimique à une concentration ou dans une quantité suffisante pour modifier l’environnement ambiant et mettre en danger la vie humaine, la faune ou la végétation (p. ex., glycol, carbonate de potassium, méthanol, mélange de méthanol provenant d’un essai hydrostatique, etc.).",
        four: "<strong>Explosion</strong> - Une explosion non intentionnelle.",
        five: "<strong>Décès</strong> - Le décès d’un employé, d’un entrepreneur ou d’un membre du public en rapport avec la construction, le fonctionnement, l’entretien ou la cessation d’exploitation d’un pipeline.",
        six: "<strong>Incendie</strong> - Un incendie non intentionnel.",
        seven:
          "<strong>Exploitation au-delà des tolérances de conception</strong>- De telles situations comprennent notamment les suivantes :",
        eight:
          "cas de surpression – lorsque les pressions sont supérieures aux limites établies pour un fonctionnement sans danger de l’équipement.",
        nine: "vibration supérieure aux tolérances de conception;",
        ten: "mouvements du sol à l’origine d’un déplacement du pipeline plus grand que celui autorisé selon les limites de conception;",
        eleven: "affleurement d’une conduite dans une rivière ou un ruisseau;",
        twelve:
          "présence d’un produit inapproprié (p. ex., gaz acide au-delà des limites établies par les normes CSA).",
        thirteen:
          "L’exploitation au-delà des tolérances de conception est habituellement liée à une surpression causée par le produit dans la canalisation. Cependant, si cette dernière est soumise à une vibration excessive pour laquelle elle n’a pas été conçue, il pourrait s’agir là encore d’un type d’exploitation au-delà des tolérances de conception, qui n’inclut toutefois pas les chocs avec la conduite, les piqûres de corrosion, etc.",
        fourteen:
          "<strong>Blessure grave (Régie ou Bureau de la sécurité des transports)</strong>- Toute blessure grave causée à un employé, un entrepreneur ou un membre du public en rapport avec la construction, l’exploitation ou l’entretien d’un pipeline.",
      },
      dashboard: {
        id: "incidents",
        mapPillIds: ["substance-bar", "status-bar", "year-bar", "province-bar"],
        chartPillIds: [
          "substance-trend",
          "status-trend",
          "what-trend",
          "why-trend",
          "province-trend",
        ],
        hasRadio: true,
        countRadio: "Nombre d'incidents",
        volRadio: "Volume des incidents",
        mapBtn: "Carte des incidents",
        trendBtn: "Tendance des incidents",
        nearby: {
          type: "incidents",
          header: "Y a-t-il des incidents près de chez moi?",
          selectRange: "Sélectionner une plage (100km) :",
          find: "Rechercher les incidents dans un rayon de 100km",
          refill: "Remplir les bulles de carte",
        },
        source: {
          sourceTitle: sourceAndDescFr,
          dataSourceTitle: dataSourceFr,
          descriptionTitle: descriptionFr,
          sourceText: sourceTextFr,
          sourceLink:
            "https://ouvert.canada.ca/data/fr/dataset/7dffedc4-23fa-440c-a36d-adf5a6cc09f1",
          description:
            "La carte ci-dessus montre l’emplacement des déversements de produit survenus sur le réseau pipelinier depuis 2008. Par défaut, les incidents sont affichés sous forme de bulles qui sont colorées en fonction de la substance rejetée. Les incidents sur la carte peuvent aussi être classés en fonction de l’état d’avancement de l’examen de la Régie, de l’année à laquelle l’incident a été signalé et de la province ou du territoire où l’incident s’est produit. Les bulles de la carte des incidents peuvent également indiquer le volume estimatif des déversements, les bulles plus grandes correspondant à des volumes plus élevés. Il est également possible de présenter les données sur les incidents au fil du temps sous forme de graphique à barres empilées. Pour ce faire, il suffit de cliquer sur le bouton Tendance des incidents situé au-dessus de la carte. Les barres empilées représentent le nombre d’incidents de déversement de produit par année, et les segments de couleur des barres correspondent aux divers produits déversés. Comme sur la carte, les incidents peuvent être reclassés en cliquant sur les boutons latéraux pour afficher la répartition des incidents selon le statut, ce qui s’est produit et pourquoi, et la province ou le territoire touché.",
          openGov: openGovLink(
            "https://ouvert.canada.ca/data/fr/dataset/fd17f08f-f14d-433f-91df-c90a34e1e9a6",
            "fr"
          ),
        },
      },
      viz: `Avez-vous consulté la <a href="https://apps2.cer-rec.gc.ca/incidents-pipeliniers/"> visualisation interactive des données sur les incidents</a> de la Régie? Cet outil permet un examen détaillé des tendances relatives aux données sur les incidents de la Régie, et ce, pour les incidents liés à l’ensemble des sociétés réglementées par la Régie.`,
    },
    remediation: {
      paragraphs: [
        "Dans le cadre de ses activités de protection de l’environnement, la Régie exige des sociétés qu’elles gèrent les contaminations et y remédient tout au long du cycle de vie des installations. Comme première étape, les sociétés réglementées sont tenues de signaler toute contamination à la Régie au moyen d’un avis de contamination en ligne.",
        `Une fois l’avis déposé, les sociétés doivent démontrer qu’elles gèrent activement la contamination conformément au
        <a href="/fr/securite-environnement/environnement/assainissement/guide-processus-assainissement-2020/index.html"><i>Guide sur le processus d’assainissement</i></a>. Les progrès réalisés sur le site contaminé et l’état du processus d’assainissement sont présentés dans les mises à jour annuelles de la société.`,
        "La contamination par des tiers est une contamination sur un site qui ne provient pas des installations de la société ou qui ne s’étend pas à l’extérieur des installations de celle-ci ou des terrains qu’elle possède ou loue ou de l’emprise. Bien que la contamination par des tiers ne résulte pas des activités de la société, la Régie exige tout de même qu’elle soit signalée au moyen d’un avis de contamination.",
        `Le tableau de bord ci-dessous renferme l’information contenue dans les avis de contamination et les mises à jour annuelles qui se trouvent dans REGDOCS. La Régie publie dans REGDOCS les avis de contamination qui lui ont été transmis depuis août 2018, moment à partir duquel elle a commencé à recueillir cette information de façon électronique, ainsi que les mises à jour annuelles jusqu’en 2021.
        Pour obtenir des renseignements sur les sites contaminés pour lesquels des avis de contamination ont été soumis avant août 2018, envoyez un courriel à
        <a href="mailto:remediation@cer-rec.gc.ca">remediation@cer-rec.gc.ca</a>.`,
        "Il existe de nombreuses méthodes et approches différentes pour assainir un site contaminé. Ainsi, lorsqu’une société soumet à l’examen de la Régie un plan d’assainissement, elle doit inclure une analyse des options à l’appui de la méthode d’assainissement choisie, sélectionner les critères de remédiation appropriés et démontrer qu’elle a consulté les personnes susceptibles d’être touchées, entre autres exigences. Les analystes de la Régie examinent également les rapports de clôture soumis par la société une fois l’assainissement terminé pour s’assurer qu’il a été effectué correctement.",
      ],
      dashboard: {
        id: "remediation",
        mapPillIds: [
          "rem-year-bar",
          "rem-province-bar",
          "rem-water-bar",
          "rem-use-bar",
        ],
        chartPillIds: [
          "rem-status-trend",
          "rem-activity-trend",
          "rem-pipeline-trend",
          "rem-contaminant-trend",
        ],
        hasRadio: false,
        mapBtn: "Carte des sites contaminés",
        trendBtn: "Tendances des sites contaminés",
        nearby: {
          type: "remediation",
          header: "Y a-t-il des sites contaminés près de chez moi?",
          selectRange: "Sélectionner une plage (100km) :",
          find: "Trouver des sites dans un rayon de 100km",
          refill: "Remplir les bulles de carte",
        },
        source: {
          sourceTitle: sourceAndDescFr,
          dataSourceTitle: dataSourceFr,
          descriptionTitle: descriptionFr,
          sourceText: sourceTextFr,
          sourceLink: "https://open.canada.ca/data/en/organization/cer-rec",
          description:
            "La carte ci-dessus montre l’emplacement approximatif des sites contaminés qui ont été signalés depuis août 2018. Par défaut, la carte montre les sites contaminés sous forme de bulles de couleur en fonction de l’année où l’avis de contamination a été soumis. Les sites contaminés sur la carte peuvent être reclassés en fonction de la province ou du territoire, de la présence à moins de 30 mètres d’un plan d’eau et de l’utilisation des terres à cet endroit. Il est également possible de présenter les sites contaminés et les incidents au fil du temps sous forme de graphique à barres empilées. Pour ce faire, il suffit de cliquer sur le bouton correspondant situé au-dessus de la carte. Les barres empilées indiquent le nombre de sites contaminés déclarés par année. Comme sur la carte, les sites contaminés peuvent être reclassés en cliquant sur les boutons latéraux pour afficher la répartition des sites contaminés selon le statut, les activités au moment de la découverte, le pipeline ou l’installation et le type de contaminant.",
          openGov: openGovLink(
            "https://open.canada.ca/data/en/organization/cer-rec",
            "fr"
          ),
        },
      },
    },
    oandm: {
      paragraphs: [
        "Les sociétés d’oléoducs et de gazoducs mènent régulièrement des activités d’exploitation et d’entretien sur les pipelines réglementés par la Régie. Ces activités comprennent la réparation du pipeline, les fouilles exploratoires et d’intégrité, ainsi que de nombreuses autres activités. Elles favorisent la sécurité, la sûreté, la protection de l’environnement, l’efficience économique et le respect des droits des personnes susceptibles d’être touchées.",
        'Les sociétés sont tenues de se conformer au <a href="https://laws-lois.justice.gc.ca/eng/regulations/sor-99-294/index.html"><i>Règlement de la Régie canadienne de l’énergie sur les pipelines terrestres</i></a> et d’exploiter leurs installations en toute sécurité et de manière à protéger l’environnement. Les autorisations relatives aux pipelines permettent habituellement aux sociétés de construire et d’exploiter une installation, et elles ne sont pas tenues de demander des approbations supplémentaires pour entreprendre la plupart des activités d’exploitation et d’entretien. Dans certaines circonstances, les compagnies sont tenues de fournir au préalable à la Régie des renseignements suffisants pour qu’elle décide s’il y a lieu ou non d’inspecter des activités d’exploitation et d’entretien qui pourraient avoir des conséquences sur la sécurité des propriétaires fonciers ou du public ou sur l’environnement, ou des effets néfastes pour l’utilisation normale de l’emprise ou d’une propriété adjacente par une tierce partie.',
      ],
      details1: {
        listType: "ol",
        summary:
          "Quelles sont les activités d’exploitation et d’entretien (activités admissibles)?",
        introParagraph:
          "Les activités d’exploitation et d’entretien comprennent :",
        listItems: [
          {
            text: "toutes les activités nécessaires à l’exploitation d’un pipeline existant en toute sécurité;",
          },
          {
            text: "les activités d’entretien, les mises à niveau ou les travaux de réparation d’un pipeline ou d’une partie d’un pipeline existant qui n’augmentent pas la pression maximale d’exploitation (« PME ») autorisée, la contrainte ni le diamètre du pipeline;",
          },
          {
            text: "le retrait physique d’une section de conduite existante d’au plus cinq kilomètres de longueur et son remplacement par une nouvelle section, à condition que celle-ci n’augmente pas la PME autorisée, la contrainte ou le diamètre du pipeline.",
          },
        ],
      },
      details2: {
        listType: "ol",
        summary:
          "Quelles activités d’exploitation et d’entretien doivent être approuvées par la Régie (restrictions relatives aux activités admissibles)?",
        introParagraph:
          "Quand une ou l’autre des conditions ci-après est présente, la compagnie doit, conformément à <i>Loi sur la Régie canadienne de l’énergie</i> (la « LRCE ») et à ses règlements d’application, présenter une demande d’autorisation à la Commission et ne peut pas mener l’activité proposée avant d’avoir obtenu l’autorisation de la Commission à cet effet. Les restrictions s’appliquent quand :",
        listItems: [
          {
            text: "les travaux comprennent le soudage d’un pipeline en service par une compagnie pipelinière n’ayant pas déjà exécuté de tels travaux de soudage conformément aux exigences de l’article 7.17 « Soudage d’un pipeline en service » de la norme CSA Z662-15, ou l’article équivalent de la version la plus récente de la norme CSA Z662;",
          },
          {
            text: "les travaux comprennent la construction d’une traverse aérienne, à l’exclusion des travaux sur des terrains appartenant à la compagnie ou loués par elle pour les installations (p. ex., terminaux, usines de traitement, stations de compression ou de pompage).",
          },
        ],
      },
      details3: {
        listType: "ol",
        summary:
          "Quels types d’activités ne constituent pas des activités d’exploitation et d’entretien (activités non admissibles)?",
        introParagraph:
          "Les activités d’exploitation et d’entretien ne comprennent pas :",
        listItems: [
          {
            text: "les mises à niveau ayant pour effet d’accroître, à des niveaux supérieurs à ceux déjà approuvés et aux spécifications :",
            subList: [
              "la PME;",
              "la contrainte;",
              "le diamètre du pipeline;",
              "les émissions dans l’atmosphère ou les niveaux de bruit permanents;",
            ],
          },
          {
            text: "les canalisations de doublement (c.-à-d. l’ajout d’une conduite parallèle, adjacente ou raccordée à un pipeline existant en vue d’en accroître la capacité);",
          },
          {
            text: "la construction d’un nouveau pipeline;",
          },
          {
            text: "la mise hors service (pour une période de plus de 12 mois), la remise en service (après qu’un pipeline a été mis hors service pour une période de plus de 12 mois), la désaffectation ou la cessation d’exploitation.",
          },
        ],
      },
      alert: `Le tableau de bord et les chiffres présentés ci-dessous ne comprennent que les activités d’exploitation et d’entretien réalisés à partir de 2015 qui doivent être signalées à la Régie.
      Consultez les
      <a href="/fr/regie/lois-reglements/loi-regie-canadienne-lenergie-reglements-notes-dorientation-documents-connexes/pipelines-terrestres/activites-dexploitation-dentretien-pipelines-sous-regime-loi-loffice-national-lenergie-exigences-2.html"><i>Exigences et notes d’orientation relatives aux activités d’exploitation et d’entretien</i></a>
      pour obtenir une liste des activités d’exploitation et d’entretien pour lesquelles une demande doit être présentée auprès de la Régie.`,
      guidelines: `Consultez les
      <a href="/fr/regie/lois-reglements/loi-regie-canadienne-lenergie-reglements-notes-dorientation-documents-connexes/pipelines-terrestres/activites-dexploitation-dentretien-pipelines-sous-regime-loi-loffice-national-lenergie-exigences-2.html">exigences et les notes d’orientation</a>
      (lignes directrices sur l’exploitation et l’entretien) pour obtenir un complément d’information sur la façon dont ces événements sont réglementés afin de favoriser la sûreté, la sécurité, la protection de l’environnement, l’efficience économique et le respect des droits des personnes susceptibles d’être touchées.`,
      dashboard: {
        id: "oandm",
        chartPillIds: [
          "oandm-region-trend",
          "oandm-dig-trend",
          "oandm-instream-trend",
          "oandm-fish-trend",
          "oandm-species-trend",
        ],
      },
      source: {
        sourceTitle: sourceAndDescFr,
        dataSourceTitle: dataSourceFr,
        descriptionTitle: descriptionFr,
        sourceText: sourceTextFr,
        sourceLink:
          "https://open.canada.ca/data/fr/dataset/1c47ebcc-17fd-4954-811f-3cdd0c30bf86",
        description:
          "Le diagramme à barres ci-dessus montre le nombre d’activités d’exploitation et d’entretien de 2015 à aujourd’hui, organisées en fonction de l’année de début de l’activité. Chaque barre tient compte de plusieurs paramètres, la vue par défaut indiquant la province ou le territoire où l’activité d’exploitation et d’entretien a eu lieu. Les boutons de navigation à droite du diagramme à barres permettent de voir le nombre d’activités d’exploitation et d’entretien par province ou territoire, si l’activité comprend une fouille d’intégrité, si des travaux dans un cours d’eau sont requis, s’il y a des poissons et s’il y a des espèces en péril sur les lieux.",
        openGov: openGovLink(
          "https://open.canada.ca/data/fr/dataset/1c47ebcc-17fd-4954-811f-3cdd0c30bf86",
          "fr"
        ),
      },
    },
    ua: {
      paragraphs: undefined,
      dashboard: {
        id: "unauthorized-activities",
        mapPillIds: [
          "ua-damage-bar",
          "ua-disturbance-bar",
          "ua-year-bar",
          "ua-who-discovered-bar",
        ],
        chartPillIds: [
          "ua-type-trend",
          "ua-damage-trend",
          "ua-who-discovered-trend",
          "ua-method-trend",
        ],
        hasRadio: false,
        mapBtn: "Unauthorized Activities Map",
        trendBtn: "Unauthorized Activities Trends",
        nearby: {
          type: "unauthorized-activities",
          header: "Are there any unauthorized activities near me?",
          selectRange: "Select range (100km):",
          find: "Find activities within 100km",
          refill: "Refill Map Bubbles",
        },
        source: {
          sourceTitle: sourceAndDescEn,
          dataSourceTitle: dataSourceEn,
          descriptionTitle: descriptionEn,
          sourceText: sourceTextEn,
          sourceLink: "https://open.canada.ca/data/en/organization/cer-rec",
          description: "Coming soon!",
          openGov: openGovLink(
            "https://open.canada.ca/data/en/organization/cer-rec",
            "en"
          ),
        },
      },
    },
  },
  tolls: {
    header: "Droits",
    updated: "FR: Section updated July 2022",
    descriptionHeader: "Description des droits du réseau",
  },
};

export const profileText = { en, fr, tollsDescription };
