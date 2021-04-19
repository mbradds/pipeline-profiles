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
      "Mb/d": "Thousand b/d",
      "Thousand m3/d": "Thousand m3/d",
    },
    directions: {
      north: "north",
      east: "east",
      south: "south",
      west: "west",
      northeast: "northeast",
      northwest: "northwest",
      southeast: "southeast",
      southwest: "southwest",
      "east & north": "east & north",
      "southeast & east": "southeast & east",
      "east & southeast": "east & southeast",
      "west & south": "west & south",
    },
    trade: {
      import: "import",
      intracanada: "intracanada",
      export: "export",
      Capacity: "Capacity",
    },
    points: {
      0: [
        "system",
        "Pipeline throughput is measured at the system level (entire pipeline) instead of individual key points.",
      ],
      1: [
        "Border",
        "Pipeline border crossing and interconnection between the Alliance Canada and Alliance USA pipeline near Elmore Saskatchewan.",
      ],
      2: [
        "Zone 2",
        "Located near the Blueberry Compressor Station, Zone 2 aggregates liquids rich gas primarilty from the montney formation. The majority of Alliance receipt points are upstream of Zone 2.",
      ],
      3: [
        "Huntingdon/FortisBC Lower Mainland",
        "Gas exports to the U.S. are typically bound for use in crude oil refineries on the West Coast of Washington State, and intracanada throughput connects with the FortisBC local distribution network for use in Vancouver and the BC lower mainland.",
      ],
      4: ["Kingsvale", "Connection with the Southern Crossing pipeline."],
      5: ["NOVA/Gordondale", "Connection with the NGTL System."],
      6: ["Sunset Creek", "Connection with the NGTL System."],
      7: [
        "St. Stephen",
        "Import/export interconnect with the US portion of M&NP at the Canada-U.S. border near St. Stephen, New Brunswick.",
      ],
      8: [
        "Chippawa",
        "Import interconnect with the Empire Pipeline at the Canada-U.S. border near Niagara Falls, Ontario. Prior to 2015, Chippawa was an export point.",
      ],
      9: [
        "Cromer/Regina",
        "The Canadian Mainline receives U.S. crude oil from the Wascana Pipeline and connects to the Cooperative Refinery Complex.",
      ],
      10: [
        "Eastern Triangle - NOL Receipts",
        "Includes receipts from the NOL segment which are measured at station 116 in North Bay, Ontario.",
      ],
      11: ["Eastern Triangle - Parkway Deliveries", "no description provided"],
      12: [
        "Eastern Triangle - Parkway Receipts",
        "Includes receipts from Parkway East, Parkway West and King’s North, all located in the greater Toronto area, Ontario.",
      ],
      13: [
        "Emerson I",
        "Export interconnect with the Viking Gas Transmission Pipeline at the Canada-U.S. border near Emerson, Manitoba.",
      ],
      14: [
        "Emerson II",
        "Export/import interconnect with the Great Lakes Gas Transmission Pipeline on the Canada-U.S. border near Emerson, Manitoba.",
      ],
      15: [
        "ex-Cromer",
        "The Canadian Mainline receives U.S. crude oil from the Enbridge Bakken pipeline.",
      ],
      16: [
        "ex-Gretna",
        "The pipeline crosses the Canada-U.S. border and joins with the Enbridge Lakehead system. Delivery point for the Canadian Mainline.",
      ],
      17: [
        "Into-Sarnia",
        "The Mainline connects with Line 9, which delivers crude oil to Montreal, Quebec. Also a delivery point for the Canadian Mainline.",
      ],
      18: [
        "Iroquois",
        "Export interconnect with the Iroquois Gas Transmission System at the Canada-U.S. border near Iroquois, Ontario.",
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
        "Export interconnects with three smaller U.S. pipelines at the Canada-U.S. border near Cornwall, Ontario and Napierville and Phillipsburg, Quebec. ‘Other US Northeast’ flows is an aggregate of these three export points.",
      ],
      22: [
        "Prairies",
        "Interconnect with the NOVA Gas Transmission Ltd. (NGTL) system at the Alberta/Saskatchewan border near Empress, Alberta. Empress is the largest receipt point on the Mainline.",
      ],
      23: ["St Clair", "no description provided"],
      24: [
        "Ft. Saskatchewan",
        "The end of the Cochin pipeline near Ft. Saskatchewan AB. Condensate is transferred to provincially regulated pipelines and transported to oil sands operations in northern Alberta.",
      ],
      25: ["Regina", "no description provided"],
      26: ["Windsor", "no description provided"],
      27: [
        "Kingsgate",
        "Export interconnect with the Gas Transmission Northwest Pipeline (GTN) at the Canada-U.S. border near Kingsgate, British Columbia. GTN supplies markets in the Pacific Northwest, California and Nevada.",
      ],
      28: [
        "Monchy",
        "Export interconnect with the Northern Border Pipeline at the Canada U.S. border near Monchy, Saskatchewan. Northern Border supplies markets in the mid-continent U.S. and Chicago.",
      ],
      29: [
        "International boundary at or near Haskett, Manitoba",
        "Pipeline border crossing between Manitoba and North Dakota, US. The CER's regulation of the Keystone pipeline ends at the border.",
      ],
      30: [
        "East Gate",
        "In the southeastern portion of the NGTL system, the East Gate interconnects with TransCanada's Canadian Mainline (near Empress, Alberta) and TransCanada's Foothills Pipeline (near McNeill, Alberta).",
      ],
      31: [
        "North and East",
        "Throughputs to delivery areas in northern Alberta, including natural gas used for oil sands operations.",
      ],
      32: [
        "Upstream of James River",
        "Throughputs in the northwestern portion of the NGTL system. Upstream of James River flows contain receipts from the Horn River and the Groundbirch pipelines (parts of NGTL).",
      ],
      33: [
        "West Gate",
        "In the southwestern portion of the NGTL system, the West Gate interconnects with TransCanada's Foothills Pipeline (British Columbia).",
      ],
      34: [
        "Zama",
        "The end of the Norman Wells pipeline, where it connects with provincially regulated pipeline systems.",
      ],
      35: ["Burnaby", "Burnaby description"],
      36: ["Sumas", "Sumas description"],
      37: ["Westridge", "Westridge description"],
      38: [
        "East Hereford",
        "Export interconnect with the Portland Natural Gas Transmission System at the Canada-U.S. border near East Hereford, Québec. TQM delivers natural gas customers in the U.S. states of Vermont, New Hampshire, Maine and Massachusetts.",
      ],
      39: [
        "Saint Lazare",
        "Interconnect with TransCanada’s Canadian Mainline near Saint Lazare, Québec. TransCanada’s Canadian Mainline delivers natural gas produced in the Western Canadian Sedimentary Basin and the Appalachian Basin.",
      ],
      40: [
        "Calgary",
        "Connection between the NGTL system and local distribution pipelines used to service the Calgary area. Throughput here is highly seasonal as gas consumption increases in the city during the winter months for heating.",
      ],
      41: [
        "Edmonton",
        "Located just Northeast of Calgary, the Edmonton key point captures gas post Upstream of James river, bound North for use in the Edmonton area. Throughput here is highly seasonal as gas consumption increases in the city during the winter months for heating.",
      ],
      42: [
        "OSDA Kirby",
        "Stands for Oil Sands Delivery Area. Gas throughput here is typically bound for use in nearby Cold Lake oil sands SAGD & CSS operations. These unconventional production methods rely on gas to generate the steam used to heat underground reservoirs, allowing bitumen to reach the surface.",
      ],
      43: [
        "OSDA Liege",
        "Stands for Oil Sands Delivery Area. Located just north-west of Fort McMurray, gas throughput here is typically bound for use in nearby Athabasca oil sands mining, SAGD, and CSS operations. Bitumen mining operations use natural gas in the upgrading process, where bitumen is heated up and split into lighter components, ultimately producing synthetic crude oil.",
      ],
      44: [
        "Saturn",
        "Compressor station located south-west of Fort St. John, British Columbia. Throughputs transported on the North Montney Mainline.",
      ],
    },
    util: "Utilization",
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
