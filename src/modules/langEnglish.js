/**
 * @file Contains all the {key: english} translations that are used to compile the English JavaScript code bundle.
 * All the HTML translations are contained in ../components/htmlText.js
 * Each object variable name and key must also appear in langFrench.js
 * The translation functionality is split into English and French to help save on code size because only English appears in the English bundle.
 */

import Highcharts from "highcharts";
import { cerPalette } from "./util.js";
import {
  incidentsTextEng,
  trafficTrendTextEng,
  oandmTextEng,
  remediationTextEng,
} from "./dynamicText.js";

import points from "../data_output/traffic/points/en.json";

const companyToSystem = {
  Aurora: "Aurora Pipeline",
  NGTL: "NGTL System",
  TCPL: "TC Canadian Mainline",
  EnbridgeMainline: "Enbridge Canadian Mainline",
  NormanWells: "Norman Wells Pipeline",
  EnbridgeBakken: "Enbridge Bakken System",
  Express: "Express Pipeline",
  TransMountain: "Trans Mountain Pipeline",
  TQM: "TQM Pipeline",
  TransNorthern: "Trans-Northern Pipeline",
  Keystone: "Keystone Pipeline",
  Westcoast: "Enbridge BC Pipeline",
  Alliance: "Alliance Pipeline",
  Cochin: "Cochin Pipeline",
  Foothills: "Foothills System",
  SouthernLights: "Southern Lights Pipeline",
  Brunswick: "Brunswick Pipeline",
  Plains: "Plains Midstream Canada ULC",
  Genesis: "Genesis Pipeline",
  Montreal: "Montreal Pipeline",
  Westspur: "Westspur Pipeline",
  ManyIslands: "Many Islands Pipe Lines (Canada) Limited",
  Vector: "Vector Pipeline",
  MNP: "M&NP Pipeline",
};

const selectUnits = "Select units:";

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
  cf: "cubic feet",
  bbl: "bbl",
};

const legendClick = "Click on a legend item to remove it from the chart";

const locationDisclaimer = "Waiting for your location...";

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

const barClick = (field, definition = "") =>
  `<small>${
    `${definition} ` || ""
  }Click on a bar to view ${field} sub definition</small>`;

const nearbyMe = {
  rangeTitle: "Select range",
  findBtnTitle: (eventName) => `Find ${eventName} within`,
  noNearby: (eventName) =>
    `<h4>No nearby ${eventName}</h4>Try increasing the search range, or drag your location marker to see nearby ${eventName} at a different location.`,
  nearbyHeader: (numCircles, range, eventName) =>
    `There are ${numCircles} ${eventName} within ${range} km`,
};

const resetMap = "Reset Map";

const trendYTitle = (eventName) => `Number of ${eventName}`;

const noEvents = {
  header: (eventName) => `No ${eventName} data`,
  note(eventName, company, conditions = false) {
    if (conditions) {
      return `There are no reported ${eventName} for ${company}. If data becomes available, or conditions are issued by the commission, they will show up here.`;
    }
    return `There are no reported ${eventName} for ${company}. If new ${eventName} are reported to the CER for this pipeline, they will appear here following the quarterly data update.`;
  },
};

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
      regdocsLink: "https://apps.cer-rec.gc.ca/REGDOCS/Item/View/",
    },
    popUp: {
      econRegion: "Economic Region",
      summary: "Conditions Summary:",
      lastUpdated: "Last updated on:",
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
    noEvents,
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
      barClick,
      locationDisclaimer,
      countDisclaimer,
      resetMap,
      eventName: "incidents",
      exploreOther,
      trendYTitle,
      cf: units.cf,
      bbl: units.bbl,
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
      gasRelease: "Estimated gas volume released:",
      liquidRelease: "Estimated liquid volume released:",
      otherRelease: "Estimated miscellaneous release:",
      noNearby: nearbyMe.noNearby,
      rangeTitle: nearbyMe.rangeTitle,
      findBtnTitle: nearbyMe.findBtnTitle("Incidents"),
      nearbyHeader: nearbyMe.nearbyHeader,
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
    noEvents,
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
    trafficTitle: (pointText, dirText, frequency = "m") => {
      const freqLookup = { m: "monthly", q: "quarterly" };
      if (dirText[0] === false || dirText[0] === "") {
        return `${pointText} - ${freqLookup[frequency]} traffic`;
      }
      return `${pointText} - ${
        freqLookup[frequency]
      } traffic (direction of flow: ${dirText.join(" & ")})`;
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
      dic: "Diluent (committed)",
      diu: "Diluent (uncommitted)",
      agg: "aggregate of heavy, medium, light crude petroleum",
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
    annualTitle: "Annual Average Throughput:",
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
  },
  oandm: {
    dashboardError,
    numberFormat,
    legendClick,
    companyToSystem,
    dynamicText: oandmTextEng,
    eventName: "O&M Activities",
    title: (pipeline) => `Dashboard: ${pipeline} - O&M Activites by Year`,
    trendYTitle,
    lang: "e",
    pillTitles: {
      titles: {
        id: "Integrity Dig?",
        fp: "Fish Present?",
        is: "In Stream Work Required?",
        sr: "Species At Risk Present?",
        p: "Province/Territory",
      },
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
      sr: "Indicates if there are species present which are listed on schedule 1 of the <i>Species At Risk Act</i> at the activity site.",
    },
    noEvents,
  },
  remediation: {
    dashboardError,
    numberFormat,
    dateFormat,
    companyToSystem,
    title: (company) =>
      `Dashboard: ${company} - Contaminated Sites (post Aug 15, 2018)`,
    dynamicText: remediationTextEng,
    dashboard: {
      userPopUp,
      locationError,
      numberFormat,
      exploreOther,
      legendClick,
      countDisclaimer,
      barClick,
      locationDisclaimer,
      resetMap,
      volumeDisclaimer:
        "Bubble size illustrates the approximate site location and does not indicate the size of the contaminated area",
      eventName: "contaminated sites",
      trendYTitle,
      cf: units.cf,
      bbl: units.bbl,
      noNearby: nearbyMe.noNearby,
      rangeTitle: nearbyMe.rangeTitle,
      findBtnTitle: nearbyMe.findBtnTitle("sites"),
      nearbyHeader: nearbyMe.nearbyHeader,
      mapClick: "Click circle to open REGDOCS search for",
      regdocsLink: "https://apps.cer-rec.gc.ca/REGDOCS/Search?txthl=",
      pillTitles: {
        titles: {
          vol: "Initial estimate of contaminated soil",
          w: "Within 30M of water-body",
          use: "Applicable Land Use",
          p: "Province",
          a: "Activity at time of discovery",
          c: "Category of Contaminants",
          ps: "Pipeline or Facility?",
          s: "Site Status",
          y: "Year",
        },
        click,
      },
      seriesInfo: {
        ps: {
          p: { n: "Pipeline", c: cerPalette["Night Sky"] },
          f: { n: "Facility", c: cerPalette.Ocean },
          pf: { n: "Pipeline and Facility", c: cerPalette.Flame },
          ns: { n: "Not specified", c: cerPalette["Dim Grey"] },
        },
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
          18: { n: "Not Provided" },
        },
      },
      definitions: {
        s: {
          definition: "The status of remedial activities.",
          prm: "Active remedial work complete and groundwater or reclamation monitoring is in effect.",
          null: "Not provided",
          rm: "Risk Management Plan has been submitted and/or risk management is taking place.",
          sa: "Environmental Site Assessment in progress to determine next steps, prior to active remedial or risk management work.",
          fm: "Use this status at facilities where there is a groundwater monitoring program in place as described in section 7.2 of the 2019 Draft Remediation Process Guide.",
          or: "RAP has been submitted and/or or active remedial work is ongoing.",
        },
        a: "Indicates the activity being undertaken at the time the contamination was discovered.",
        ps: "Indicates whether the contamination was discovered along the length of the pipeline on the RoW or whether the contamination was discovered at a facility (ex. station or terminal).",
        c: "The type of contaminants that were identified at the time of NOC submission.",
      },
    },
    noEvents,
  },
  tolls: {
    dashboardError,
    numberFormat,
    companyToSystem,
    noEvents,
    eventName: "tolls",
    dashboard: {
      lang: "e",
      tooltip: {
        toll: "Toll:",
        path: "Path:",
        product: "Product:",
        service: "Service:",
      },
      filters: {
        product: "Select product:",
        path: "Select path:",
        service: "Select service:",
        units: selectUnits,
      },
      yAxis: "Toll",
      splitDescription: "Toll Description",
      pathDisclaimer: (thisPaths, totalPaths) =>
        `<p>There are <strong>${thisPaths}</strong> tolls paths shown for this system. Take a look at the Open Government dataset for information on all <strong>${totalPaths}</strong> available system paths.</p>`,
    },
  },
  tcplRevenues: {
    dateFormat,
    numberFormat,
  },
  ua: {
    dashboardError,
    numberFormat,
    dateFormat,
    companyToSystem,
    noEvents,
    dashboard: {
      eventName: "unauthorized-activities",
      resetMap,
      trendYTitle,
      pillTitles: {
        titles: {
          et: "Event Type",
          eqt: "Equipment Type",
          wpc: "Was Pipe Contacted",
          mod: "Method Of Discovery",
          y: "Year",
        },
        click,
      },
      seriesInfo: {
        et: {
          "Construction of a Facility": {
            c: cerPalette.Aubergine,
            n: "Construction of a Facility",
          },
          "Construction of a Facility; Ground Disturbance": {
            c: cerPalette["Cool Grey"],
            n: "Construction of a Facility; Ground Disturbance",
          },
          "Construction of a Facility; Ground Disturbance; Vehicle Crossing": {
            c: cerPalette.Flame,
            n: "Construction of a Facility; Ground Disturbance; Vehicle Crossing",
          },
          "Construction of a Facility; Vehicle Crossing": {
            c: cerPalette.Forest,
            n: "Construction of a Facility; Vehicle Crossing",
          },
          "Ground Disturbance": {
            c: cerPalette["Night Sky"],
            n: "Ground Disturbance",
          },
          "Ground Disturbance; Vehicle Crossing": {
            c: cerPalette.Ocean,
            n: "Ground Disturbance; Vehicle Crossing",
          },
          "Vehicle Crossing": {
            c: cerPalette.Sun,
            n: "Vehicle Crossing",
          },
          "Damage to Pipe": {
            c: cerPalette.hcAqua,
            n: "Damage to Pipe",
          },
          "Damage to Pipe; Ground Disturbance": {
            c: cerPalette.hcAqua,
            n: "Damage to Pipe; Ground Disturbance",
          },
        },
        eqt: {
          null: { c: cerPalette["Dim Grey"], n: "Not Provided" },
          "Auger Digger": { c: cerPalette["Dim Grey"], n: "Auger Digger" },
          Backhoe: { c: cerPalette["Dim Grey"], n: "Backhoe" },
          Combine: { c: cerPalette["Dim Grey"], n: "Combine" },
          Crane: { c: cerPalette["Dim Grey"], n: "Crane" },
          "Directional Drill": {
            c: cerPalette["Dim Grey"],
            n: "Directional Drill",
          },
          "Front End Loader": {
            c: cerPalette["Dim Grey"],
            n: "Front End Loader",
          },
          "Hydro Vactor": { c: cerPalette["Dim Grey"], n: "Hydro Vactor" },
          "Not Specified": { c: cerPalette["Dim Grey"], n: "Not Specified" },
          "Vehicle <= 1 ton": {
            c: cerPalette["Dim Grey"],
            n: "Vehicle <= 1 ton",
          },
          "Vehicle > 1 ton": {
            c: cerPalette["Dim Grey"],
            n: "Vehicle > 1 ton",
          },
        },
        wpc: {
          Yes: { c: cerPalette["Dim Grey"], n: "Yes" },
          No: { c: cerPalette["Dim Grey"], n: "No" },
          "Not Specified": { c: cerPalette["Dim Grey"], n: "Not Specified" },
          null: { c: cerPalette["Dim Grey"], n: "Not Provided" },
        },
      },
    },
  },
};
