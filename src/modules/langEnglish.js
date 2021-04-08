import { cerPalette } from "./util.js";
import { incidentsTextEng, trafficTrendTextEng } from "./dynamicText.js";

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

const numberFormat = (value, rounding = 2) => {
  return Highcharts.numberFormat(value, rounding, ".", ",");
};

const dateFormat = (value, format = "%b %d, %Y") => {
  return Highcharts.dateFormat(format, value);
};

export const englishDashboard = {
  plains:
    "Plains Midstream Canada ULC includes the Milk River and Wascana pipelines",

  conditions: {
    dateFormat: dateFormat,
    companyToSystem: companyToSystem,
    colNames: { "In Progress": "In Progress", Closed: "Closed" },
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
    themeDefinitionsTitle: "Theme Definitions:",
    themeDefinitions: {
      "No theme specified":
        "Some conditions have not been assigned a theme by the CER.",
      Administrative: "Conditions that help track organizational tasks.",

      "Damage Prevention":
        "Conditions that hold companies accountable for the safe conduct in and around pipelines and facilities.",

      "Emergency Management":
        "Conditions that ensure companies have a robust program that anticipates and prevents incidents, and manages and mitigates situations during an emergency.",

      Enforcement:
        "Conditions that reinforce prescribed regulatory requirements to be met.",

      "Environmental Protection":
        "Conditions that mandate projects to be planned, built, operated or abandoned in a manner that protects the environment.",

      Financial:
        "Conditions that require certain details or all aspects of a company’s financial obligations be fulfilled.",

      "Integrity Management":
        "Conditions that ensure projects are designed, built, operated and maintained in a safe and effective manner. For instance, the use of appropriate materials, the detection of corrosion, etc.",

      "Management System":
        "Company specific conditions that ensure the use of an effective and efficient approach to manage and reduce risk. Note: A management system is not project specific.",

      "Safety Management":
        "Conditions that eliminate or reduce risk to the public, workers, the environment and assets.",

      Security:
        "Conditions that ensure companies have adequate personnel and systems to deter, respond and manage security threats.",

      "Socio-Economic":
        "Conditions that address the concerns of potentially affected landowners, residents, communities, indigenous groups, etc.",

      "Standard Condition":
        "A condition that is typically imposed on all approved projects.",
      "Sunset Clause":
        "Conditions that ensure projects begin within a specific period of time.",
    },
    noConditions: {
      header: "No conditions data available",
      note: (companyName) => {
        return `There is no conditions data available for ${companyName}. If data becomes available, or conditions are issued by the commission, they will show up here.`;
      },
    },
  },
  incidents: {
    dynamicText: incidentsTextEng,
    companyToSystem: companyToSystem,
    title: (systemName) => {
      return `Dashboard: ${systemName} - Incidents with a product release`;
    },
    definitions: {
      Status: {
        Closed:
          "The CER’s incident review has been completed and the file is closed.",
        Submitted:
          "The company has submitted all of the required information and the CER is reviewing the incident.",
        "Initially Submitted":
          "The company has notified the CER that an incident has occurred and provided preliminary information. An investigation is has been initiated.",
      },
      what: {
        "Defect and Deterioration":
          "Defects in manufacturing processes or materials, or deterioration as a result of damage or service life limitations, lack of inspection or maintenance",
        "Corrosion and Cracking":
          "External corrosion or cracking caused by damage to coating systems or failed coating systems; weld cracking as a result of stress or workmanship issues; or internal corrosion as a result of contaminates in products",
        "Equipment Failure":
          "A failure of the pipeline’s equipment components. Examples of equipment include valves, electrical power systems and control systems",
        "Incorrect Operation":
          "Typically, personnel fail to follow procedures or use equipment improperly",
        "External Interference":
          "External activities that cause damage to the pipeline or components. Examples include excavation damage and vandalism",
        "Natural Force Damage":
          "Damage caused by natural forces, such as earthquakes, landslides and wash-outs",
        "Other Causes":
          "All other causes or when an incident’s circumstances could not be determined",
        "To be determined": "The incident is under review",
      },
      why: {
        "Engineering and Planning":
          "Failures of assessment, planning or monitoring that may be related to inadequate specifications or design criteria, evaluation of change, or implementation of controls",
        Maintenance:
          "Inadequate preventive maintenance or repairs, and excessive wear and tear",
        "Inadequate Procurement":
          "Failures in the purchasing, handling, transport and storage of materials",
        "Tools and Equipment":
          "Tools and equipment that are inadequate for the task or used improperly",
        "Standards and Procedures":
          "Inadequate development, communication, maintenance or monitoring of standards and procedures",
        "Failure in communication":
          "Loss of communication with automatic devices, equipment or people",
        "Inadequate Supervision":
          "Lack of oversight of a contractor or employee during construction or maintenance activities",
        "Human Factors":
          "Individual conduct or capability, or physical and psychological factors",
        "Natural or Environmental Forces":
          "External natural or environmental conditions",
        "To be determined": "The incident is under review.",
      },
    },
    dashboard: {
      what: "What Happened",
      why: "Why It Happened",
      estRelease: "Est. Release Volume:",
      cf: "cubic feet",
      decimal: ".",
      bbl: "bbl",
      pillTitles: {
        titles: {
          Status: "CER Status",
          why: "Why It Happened",
          what: "What Happened",
        },
        click: "click to view",
      },
      volumeDisclaimer:
        "Bubble size illustrates the relative est. release volume in m3, and does not indicate area covered by the release",
      locationDisclaimer: "Waiting for your location...",
      countDisclaimer: (eventType, field) => {
        return `<p>${eventType} can have multiple ${field} values. Chart totals may appear larger due to double counting.</p>`;
      },
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
      barClick: (field) => {
        return `<p>Click on a bar to view ${field} sub definition</p>`;
      },
      legendClick: "Click on a legend item to remove it from the chart",
      rangeTitle: "Select range",
      findBtnTitle: "Find Incidents within",
      trendYTitle: "Number of Incidents",
      EVENTCOLORS: {
        Substance: {
          Propane: cerPalette["Forest"],
          "Natural Gas - Sweet": cerPalette["Flame"],
          "Natural Gas - Sour": cerPalette["Dim Grey"],
          "Fuel Gas": cerPalette["hcGreen"],
          "Lube Oil": cerPalette["hcPurple"],
          "Crude Oil - Sweet": cerPalette["Sun"],
          "Crude Oil - Synthetic": cerPalette["Forest"],
          "Crude Oil - Sour": cerPalette["Dim Grey"],
          "Natural Gas Liquids": cerPalette["Night Sky"],
          Condensate: cerPalette["Ocean"],
          "Diesel Fuel": cerPalette["hcRed"],
          Gasoline: cerPalette["Flame"],
          Other: cerPalette["Aubergine"],
        },
        Status: {
          "Initially Submitted": cerPalette["Flame"],
          Closed: cerPalette["Cool Grey"],
          Submitted: cerPalette["Ocean"],
        },
        Province: {
          Alberta: cerPalette["Sun"],
          "British Columbia": cerPalette["Forest"],
          Saskatchewan: cerPalette["Aubergine"],
          Manitoba: cerPalette["Ocean"],
          Ontario: cerPalette["Night Sky"],
          Quebec: cerPalette["Flame"],
          "New Brunswick": cerPalette["Forest"],
          "Nova Scotia": cerPalette["Night Sky"],
          "Northwest Territories": cerPalette["hcLightBlue"],
        },
        why: {
          "Standards and Procedures": cerPalette["Flame"],
          "Tools and Equipment": cerPalette["Forest"],
          Maintenance: cerPalette["Night Sky"],
          "Human Factors": cerPalette["Ocean"],
          "Engineering and Planning": cerPalette["Sun"],
          "Natural or Environmental Forces": cerPalette["hcAqua"],
          "To be determined": cerPalette["Cool Grey"],
          "Inadequate Procurement": cerPalette["Aubergine"],
          "Inadequate Supervision": cerPalette["Dim Grey"],
          "Failure in communication": cerPalette["hcPink"],
        },
        what: {
          "Corrosion and Cracking": cerPalette["Aubergine"],
          "Defect and Deterioration": cerPalette["Cool Grey"],
          "Equipment Failure": cerPalette["Dim Grey"],
          "Natural Force Damage": cerPalette["Flame"],
          "Other Causes": cerPalette["Forest"],
          "Incorrect Operation": cerPalette["Night Sky"],
          "External Interference": cerPalette["Ocean"],
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
  traffic: {
    dynamicText: trafficTrendTextEng,
    numberFormat: numberFormat,
    units: {
      "Bcf/d": "Bcf/d",
      "Million m3/d": "Million m3/d",
      "Mb/d": "Mb/d",
      "Thousand m3/d": "Thousand m3/d",
    },
    months: {
      1: "Jan",
      2: "Feb",
      3: "Mar",
      4: "Apr",
      5: "May",
      6: "Jun",
      7: "Jul",
      8: "Aug",
      9: "Sep",
      10: "Oct",
      11: "Nov",
      12: "Dec",
    },
  },
};
