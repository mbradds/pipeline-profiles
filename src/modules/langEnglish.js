/**
 * @file Contains all the {key: english} translations that are used to compile the English JavaScript code bundle.
 * All the HTML translations are contained in ../components/htmlText.js
 * Each object variable name and key must also appear in langFrench.js
 * The translation functionality is split into English and French to help save on code size because only English appears in the English bundle.
 */

import Highcharts from "highcharts";
import { cerPalette } from "./util";
import {
  incidentsTextEng,
  trafficTrendTextEng,
  oandmTextEng,
} from "./dynamicText";

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
  "Kingston Midstream Westspur Limited": "Westspur Pipeline",
  "Many Islands Pipe Lines (Canada) Limited":
    "Many Islands Pipe Lines (Canada) Limited",
  "Vector Pipeline Limited Partnership": "Vector Pipeline",
  "Maritimes & Northeast Pipeline Management Ltd.": "M&NP Pipeline",
};

const dashboardError = {
  title: "Dashboard error",
  message:
    "Try refreshing the page. Please email energy.markets@cer-rec.gc.ca if the problem persists.",
};

const regionInfo = {
  ab: { c: cerPalette.Sun, n: "Alberta" },
  bc: { c: cerPalette.Forest, n: "British Columbia" },
  sk: { c: cerPalette.Aubergine, n: "Saskatchewan" },
  mb: { c: cerPalette.Ocean, n: "Manitoba" },
  on: { c: cerPalette["Night Sky"], n: "Ontario" },
  qc: { c: cerPalette.Flame, n: "Quebec" },
  nb: { c: cerPalette.Forest, n: "New Brunswick" },
  ns: { c: cerPalette["Night Sky"], n: "Nova Scotia" },
  nt: { c: cerPalette.hcLightBlue, n: "Northwest Territories" },
  pe: { c: cerPalette.hcRed, n: "Prince Edward Island" },
  nu: { c: cerPalette.hcPurple, n: "Nunavut" },
  yt: { c: cerPalette.hcGreen, n: "Yukon" },
};

const yesNoInfo = {
  y: { c: cerPalette.Sun, n: "Yes" },
  n: { c: cerPalette["Night Sky"], n: "No" },
};

const units = {
  "Bcf/d": "Bcf/d",
  "million m3/d": "million m3/d",
  "Mb/d": "Mb/d",
  "thousand m3/d": "thousand m3/d",
};

const legendClick = "Click on a legend item to remove it from the chart";

const userPopUp =
  "Approximate location. You can drag this marker around to explore events in other locations.";
const locationError =
  "<h4>Can't access your location.</h4>Try enabling your browser's location services and refresh the page.";

const exploreOther = (eventType) =>
  `Want to explore other regions? You can click and drag the location marker and re-click the find ${eventType} button.`;

const click = "click to view";

const unitsDisclaimerText = (commodity) => {
  let conversionText = "";
  if (commodity === "oil") {
    conversionText =
      "A conversion of 1 cubic meter = 6.2898 barrels of oil is used in this dashboard";
  } else if (commodity === "gas") {
    conversionText =
      "A conversion of 1 cubic meter = 35.3147 Cubic feet (cf) natural gas is used in this dashboard";
  }
  return conversionText;
};

const countDisclaimer = (eventType, field) =>
  `${eventType} can have multiple ${field} values. Chart totals may appear larger due to double counting.`;

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
    "Delivery interconnect with the Union Gas Pipeline, near Milton, Ontario. Throughputs include nominations bound for Dawn storage, via the Union Gas System, and tend to be seasonal (primarily in the summer), depending on market conditions.",
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
    "Interconnect with three U.S. pipelines at the Canada-U.S. border near Cornwall, Ontario and Napierville and Phillipsburg, Quebec. ‘Other US Northeast’ is an aggregate of these three export points and includes interconnects with the St. Lawrence Gas Company, North Country Gas Pipeline and Vermont Gas Systems respectively.",
  ],
  22: [
    "Prairies",
    "Interconnect with the NOVA Gas Transmission Ltd. (NGTL) system at the Alberta/Saskatchewan border. Empress is one of the primary receipt points on the Mainline. Gas moves east for use in Manitoba, Ontario, Quebec, and exports into the U.S. Midwest and U.S. Northeast.",
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

/**
 * English number format.
 * @param {number} value - Input number to format.
 * @param {number} [rounding=2] - Number of decimal places to round to.
 * @param {string} [thousands=" "] - Thousands seperator. Can be set to "" when eng numbers need to be fit better.
 * @returns {string} Highcharts.numberFormat(value, rounding, ".", " ");
 */
const numberFormat = (value, rounding = 2, thousands = " ") =>
  Highcharts.numberFormat(value, rounding, ".", thousands);

/**
 * English date format.
 * @param {number} value - Serialized date number.
 * @param {string} format - Date format string for month, day, year.
 * @returns {string} - Highcharts.dateFormat(format, value);
 */
const dateFormat = (value, format = "%b %d, %Y") =>
  Highcharts.dateFormat(format, value);

export const englishDashboard = {
  plains:
    "Plains Midstream Canada ULC includes the Milk River and Wascana pipelines",

  conditions: {
    dashboardError,
    dateFormat,
    companyToSystem,
    lang: "e",
    colNames: { "In Progress": "In Progress", Closed: "Closed" },
    conditions: "conditions",
    popUpTotal: ":",
    noLocation: {
      title: "Some conditions are not tied to a geographic location.",
      summary: (companyName) =>
        `No geographic location summary for ${companyName}:`,
    },
    title: {
      noLocation: (companyName) =>
        `Dashboard: ${companyName} - no geographic location`,
      location: (companyName, column) =>
        `Dashboard: ${companyName} - ${column} Conditions by Region`,
    },
    table: {
      projectsTitle: (column) =>
        `Projects with ${column} Conditions (click to open REGDOCS* project folder):`,
      themesTitle: (column) =>
        `${column} Condition Themes (click to view theme definition):`,
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
      "n/a": "Some conditions have not been assigned a theme by the CER.",
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
      note: (companyName) =>
        `There is no conditions data available for ${companyName}. If data becomes available, or conditions are issued by the commission, they will show up here.`,
    },
  },
  incidents: {
    dashboardError,
    dynamicText: incidentsTextEng,
    companyToSystem,
    title: (systemName) =>
      `Dashboard: ${systemName} - Incidents with a product release`,
    definitions: {
      s: {
        c: "The CER’s incident review has been completed and the file is closed.",
        s: "The company has submitted all of the required information and the CER is reviewing the incident.",
        is: "The company has notified the CER that an incident has occurred and provided preliminary information. An investigation is has been initiated.",
      },
      what: {
        dd: "Defects in manufacturing processes or materials, or deterioration as a result of damage or service life limitations, lack of inspection or maintenance",
        cc: "External corrosion or cracking caused by damage to coating systems or failed coating systems; weld cracking as a result of stress or workmanship issues; or internal corrosion as a result of contaminates in products",
        ef: "A failure of the pipeline’s equipment components. Examples of equipment include valves, electrical power systems and control systems",
        io: "Typically, personnel fail to follow procedures or use equipment improperly",
        ei: "External activities that cause damage to the pipeline or components. Examples include excavation damage and vandalism",
        nfd: "Damage caused by natural forces, such as earthquakes, landslides and wash-outs",
        oc: "All other causes or when an incident’s circumstances could not be determined",
        tbd: "The incident is under review",
      },
      why: {
        ep: "Failures of assessment, planning or monitoring that may be related to inadequate specifications or design criteria, evaluation of change, or implementation of controls",
        m: "Inadequate preventive maintenance or repairs, and excessive wear and tear",
        ip: "Failures in the purchasing, handling, transport and storage of materials",
        te: "Tools and equipment that are inadequate for the task or used improperly",
        sp: "Inadequate development, communication, maintenance or monitoring of standards and procedures",
        fc: "Loss of communication with automatic devices, equipment or people",
        is: "Lack of oversight of a contractor or employee during construction or maintenance activities",
        hf: "Individual conduct or capability, or physical and psychological factors",
        ef: "External natural or environmental conditions",
        tbd: "The incident is under review.",
      },
    },
    dashboard: {
      numberFormat,
      userPopUp,
      locationError,
      legendClick,
      exploreOther: exploreOther("incidents"),
      cf: "cubic feet",
      bbl: "bbl",
      pillTitles: {
        titles: {
          vol: "Est. Release Volume",
          sub: "Substance",
          p: "Province",
          s: "CER Status",
          y: "Year",
          why: "Why It Happened",
          what: "What Happened",
        },
        click,
      },
      volumeDisclaimer:
        "Bubble size illustrates the relative est. release volume in m3, and does not indicate area covered by the release",
      locationDisclaimer: "Waiting for your location...",
      countDisclaimer,
      countDisclaimerEvent: "Incidents",
      nearbyHeader: (numCircles, range) =>
        `There are ${numCircles} incidents within ${range} km`,
      gasRelease: "Estimated gas volume released:",
      liquidRelease: "Estimated liquid volume released:",
      otherRelease: "Estimated miscellaneous release:",
      noNearby: (eventType) =>
        `<h4>No nearby ${eventType}</h4>Try increasing the search range, or drag your location marker to see nearby events at a different location.`,
      barClick: (field) =>
        `<small>Click on a bar to view ${field} sub definition</small>`,
      rangeTitle: "Select range",
      findBtnTitle: "Find Incidents within",
      trendYTitle: "Number of Incidents",
      seriesInfo: {
        // Substance
        sub: {
          pro: { c: cerPalette.Forest, n: "Propane" },
          ngsweet: { c: cerPalette.Flame, n: "Natural Gas - Sweet" },
          ngsour: { c: cerPalette["Dim Grey"], n: "Natural Gas - Sour" },
          fgas: { c: cerPalette.hcGreen, n: "Fuel Gas" },
          loil: { c: cerPalette.hcPurple, n: "Lube Oil" },
          cosweet: { c: cerPalette.Sun, n: "Crude Oil - Sweet" },
          sco: { c: cerPalette.Forest, n: "Crude Oil - Synthetic" },
          cosour: { c: cerPalette["Dim Grey"], n: "Crude Oil - Sour" },
          ngl: { c: cerPalette["Night Sky"], n: "Natural Gas Liquids" },
          co: { c: cerPalette.Ocean, n: "Condensate" },
          diesel: { c: cerPalette.hcRed, n: "Diesel Fuel" },
          gas: { c: cerPalette.Flame, n: "Gasoline" },
          Other: { c: cerPalette.Aubergine, n: "Other" },
        },
        // Status
        s: {
          is: { c: cerPalette.Flame, n: "Initially Submitted" },
          c: { c: cerPalette["Cool Grey"], n: "Closed" },
          s: { c: cerPalette.Ocean, n: "Submitted" },
        },
        p: regionInfo, // Province
        why: {
          sp: { c: cerPalette.Flame, n: "Standards and Procedures" },
          te: { c: cerPalette.Forest, n: "Tools and Equipment" },
          m: { c: cerPalette["Night Sky"], n: "Maintenance" },
          hf: { c: cerPalette.Ocean, n: "Human Factors" },
          ep: { c: cerPalette.Sun, n: "Engineering and Planning" },
          ef: { c: cerPalette.hcAqua, n: "Natural or Environmental Forces" },
          tbd: { c: cerPalette["Cool Grey"], n: "To be determined" },
          ip: { c: cerPalette.Aubergine, n: "Inadequate Procurement" },
          is: { c: cerPalette["Dim Grey"], n: "Inadequate Supervision" },
          fc: { c: cerPalette.hcPink, n: "Failure in communication" },
        },
        what: {
          cc: { c: cerPalette.Aubergine, n: "Corrosion and Cracking" },
          dd: { c: cerPalette["Cool Grey"], n: "Defect and Deterioration" },
          ef: { c: cerPalette["Dim Grey"], n: "Equipment Failure" },
          nfd: { c: cerPalette.Flame, n: "Natural Force Damage" },
          oc: { c: cerPalette.Forest, n: "Other Causes" },
          io: { c: cerPalette["Night Sky"], n: "Incorrect Operation" },
          ei: { c: cerPalette.Ocean, n: "External Interference" },
          tbd: { c: cerPalette.Sun, n: "To be determined" },
        },
      },
    },
    noIncidents: {
      header: "No incidents data available",
      note: (companyName) =>
        `There are no records in the CER's incident data for ${companyName}. If new incidents are reported to the CER for this pipeline, they will appear here following the quarterly data update.`,
    },
  },
  traffic: {
    dashboardError,
    unitsDisclaimerText,
    units,
    dynamicText: trafficTrendTextEng,
    numberFormat,
    points,
    total: "Total",
    directions: {
      n: "north",
      e: "east",
      s: "south",
      w: "west",
      ne: "northeast",
      nw: "northwest",
      se: "southeast",
      sw: "southwest",
    },
    fiveYr: {
      lastYrName: (lastYear) => `${lastYear} Throughput (last year of data)`,
      avgName: "Five-Year Average",
      rangeName: (min, max) => `Five-Year Range (${min + 1}-${max - 1})`,
      notEnough: "Not enough data to calculate five-year average",
    },
    exportAxis: (unit) => `Exports (${unit})`,
    importAxis: (unit) => `Imports (${unit})`,
    fiveYrTitle: (pointText) => `${pointText} - five-year average & range`,
    trafficTitle: (pointText, dirText) => {
      if (dirText[0] === false || dirText[0] === "") {
        return `${pointText} - monthly traffic`;
      }
      return `${pointText} - monthly traffic (direction of flow: ${dirText.join(
        " & "
      )})`;
    },
    series: {
      im: "Import",
      in: "Intra-Canada",
      ex: "Export",
      cap: "Capacity",
      dh: "Domestic Heavy",
      dln: "Domestic Light / NGL",
      fl: "Foreign Light",
      dl: "Domestic Light",
      rp: "Refined Petroleum Products",
      co: "Condensate",
      ecap: "Export Capacity",
      icap: "Import Capacity",
      msm: "Westspur midale (MSM) crude",
      ses: "Southeast sask (SES) crude",
      pet: "Petroleum",
      ngl: "Natural Gas Liquids",
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
  apportion: {
    dashboardError,
    unitsDisclaimerText,
    units,
    points,
    numberFormat,
    title: {
      enbridge:
        "Total system original nominations and total system accepted nominations",
      other: "Apportionment at:",
    },
    keyPtTitle: "Apportionment at key points",
    series: {
      an: "Accepted Nominations",
      on: "Original Nominations",
      ac: "Available Capacity",
      ap: "Apportionment Percent",
    },
    enbridgePoints: {
      "crom2/93": "Cromer - Line 2/93",
      "kerr2/3": "Kerrobert - Line 2/3",
      "clea2/3": "Clearbrook - Line 2/3",
      "kerr2/93": "Kerrobert - Line 2/93",
      "kerr4/67": "Kerrobert - Line 4/67",
      "kerr4/68": "Kerrobert - Line 4/68",
      "kerr4/70": "Kerrobert - Line 4/70",
      west10: "Westover - Line 10",
      kerr1: "Kerrobert - Line 1",
      "regi4/67": "Regina - Line 4/67",
      "hard4/67": "Hardisty - Line 4/67",
      "crom2/3": "Cromer - Line 2/3",
      "crom2/3/65": "Cromer - Line 2/3/65",
      west11: "Westover - Line 11",
      "edmo2/3": "Edmonton - Line 2/3",
    },
  },
  oandm: {
    dashboardError,
    numberFormat,
    legendClick,
    companyToSystem,
    dynamicText: oandmTextEng,
    title: (pipeline) => `Dashboard: ${pipeline} - O&M Activites by Year`,
    trendYTitle: "Number of Events",
    pillTitles: {
      titles: {
        id: "Integrity Dig?",
        fp: "Fish Present?",
        is: "In Stream Work Required?",
        sr: "Species At Risk Present?",
        p: "Province/Territory",
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
      id: "Indicates if the activity includes excavation to expose, assess, or repair an existing pipeline.",
      fp: "Indicates if there will be ground disturbance using power-operated equipment within 30M of a wetland or a water body or within 30M of the substrate of a wetland or water body at the activity site, and the water body is fish-bearing.",
      is: "Indicates if there will be any in-stream work at activity site.",
      sr: "Indicates if there are species present which are listed on schedule 1 of the Species At Risk Act at the activity site.",
    },
  },
  remediation: {
    dashboardError,
    numberFormat,
    dateFormat,
    companyToSystem,
    title: (company, cutoffDate) =>
      `Dashboard: ${company} - Contaminated Sites (post ${cutoffDate})`,
    // TODO: reduce language duplication between remediation and incidents
    dashboard: {
      userPopUp,
      locationError,
      numberFormat,
      exploreOther: exploreOther("events"),
      legendClick,
      countDisclaimer,
      countDisclaimerEvent: "Contaminated sites",
      trendYTitle: "Number of Contaminated Sites",
      cf: "cubic feet",
      bbl: "bbl",
      volumeDisclaimer: undefined,
      locationDisclaimer: undefined,
      rangeTitle: "Select range",
      findBtnTitle: "Find sites within",
      nearbyHeader: (numCircles, range) =>
        `There are ${numCircles} contaminated sites within ${range} km`,
      noNearby: () =>
        `<h4>No nearby contaminated sites</h4>Try increasing the search range, or drag your location marker to see nearby events at a different location.`,
      pillTitles: {
        titles: {
          vol: "Initial estimate of contaminated soil",
          w: "Within 30M of water-body",
          use: "Applicable Land Use",
          p: "Province",
          a: "Activity At Time",
          c: "Contaminants at the Site",
          ps: "Pipeline or Facility",
          s: "Site Status",
          y: "Year",
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
          prm: { c: cerPalette.Flame, n: "Post-remediation monitoring" },
          null: { c: cerPalette["Dim Grey"], n: "Not provided" },
          rm: { c: cerPalette.Forest, n: "Risk managed" },
          sa: { c: cerPalette.Aubergine, n: "Site assessment" },
          fm: { c: cerPalette.hcBlue, n: "Facility monitoring" },
          or: { c: cerPalette["Cool Grey"], n: "Ongoing remediation" },
          m: { c: cerPalette.Sun, n: "Monitored" },
        },
        p: regionInfo, // Province
        use: {
          dli: { c: cerPalette["Cool Grey"], n: "Developed Land - Industrial" },
          dls: {
            c: cerPalette["Night Sky"],
            n: "Developed Land - Small Commercial",
          },
          dlr: {
            c: cerPalette.Aubergine,
            n: "Developed Land - Residential",
          },
          bl: { c: cerPalette.Sun, n: "Barren Land" },
          sl: { c: cerPalette.hcAqua, n: "Shrub Land" },
          vb: { c: cerPalette.hcRed, n: "Vegetative Barren" },
          f: { c: cerPalette.hcGreen, n: "Forests" },
          ac: { c: cerPalette.hcPink, n: "Agricultural Cropland" },
          w: { c: cerPalette.hcLightBlue, n: "Water / Wetlands" },
          t: {
            c: cerPalette.hcPurple,
            n: "Tundra / Native Prairie / Parks",
          },
          al: { c: cerPalette.Ocean, n: "Agricultural Land" },
          pa: { c: cerPalette.Forest, n: "Protected Area" },
          ndl: { c: cerPalette.Flame, n: "Non-developed Land" },
          null: { c: cerPalette["Dim Grey"], n: "Not provided" },
        },
        a: {
          m: { c: cerPalette["Night Sky"], n: "Maintenance" },
          o: { c: cerPalette.Flame, n: "Operation" },
          c: { c: cerPalette.Ocean, n: "Construction" },
          a: { c: cerPalette.Aubergine, n: "Abandonment" },
          null: { c: cerPalette["Dim Grey"], n: "Not Provided" },
        },
        c: {
          1: { n: "Other" },
          2: { n: "Petroleum Hydrocarbons (PHC)" },
          3: { n: "Polycyclic Aromatic Hydrocarbons (PAH)" },
          4: { n: "Benzene, Toluene, Ethylbenzene, Xylenes (BTEX)" },
          5: { n: "Volatile Organic Compounds (VOC) other than BTEX" },
          6: { n: "Semi-volatile Organic Compounds (SVOC)" },
          7: { n: "Salts" },
          8: { n: "Methyl Tertiary Butyl Ether (MTBE)" },
          9: { n: "Polychlorinated Biphenyls (PCB)" },
          10: { n: "Metals" },
          11: { n: "Glycol" },
          12: { n: "Amine" },
          13: { n: "Phenols" },
          14: { n: "Sulphur" },
          15: { n: "Pesticide / Herbicide" },
          16: { n: "Light Non-aqueous Phase Liquid (LNAPL)" },
          17: { n: "Dense Non-aqueous Phase Liquid (DNAPL)" },
        },
      },
    },
    noEvents: {
      header: `No Contaminated Sites Data`,
      note: (company) =>
        `There are no reported contaminated sites for ${company}`,
    },
  },
};
