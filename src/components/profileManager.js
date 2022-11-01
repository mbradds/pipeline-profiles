/**
 * @file Acts kind of like a content management system to conditionally inject the HTML sections for a given profile.
 * This file is imported into webpack.common to conditionally load partials with template logic specified in profile.hbs
 *
 * For example, NGTL has no apportionment data, so this is set to false. If data becomes available, this can be set to true to
 * immediately load that section based on the corresponding handlebars template for apportionment.
 *
 * Right now, each profile is hard coded. I kind of like it this way, because it reduces the chance of a
 * section accidentally being loaded,and the boolean settings in this file are unlikely to change much once the project is complete.
 *
 * As more sections are added to the profiles, each featuring dynamic content, the need for a pattern like this becomes more clear.
 * This looks like a bit of a mess, but its better than doing something like loading the HTML for each section,
 * and then hiding the sections that are not needed for that profile based on the input company_data.
 *
 * There is still a bit of risk here because the true|false setting here should/need to match the {build: true|false} parameter in the
 * data file for each pipeline & section. For example, if ngtl.traffic.map is accidentally set to false, the js
 * in ../traffic/trafficDashboard.js may still try to load the dashboard, but it wont be able to find the required HTML id's.
 *
 * TODO: test what happens when the options in this file are entered incorrectly, and make sure that
 * the js dashboard files handle it properly.
 *
 */

export const pm = {
  NGTL: {
    commodity: "natural-gas",
    name: "NOVA Gas Transmission Ltd. (NGTL)",
    sections: {
      traffic: { map: true, noMap: false },
      apportion: false,
      tolls: true,
      safety: true,
    },
  },
  Alliance: {
    commodity: "natural-gas",
    name: "Alliance Pipeline",
    sections: {
      traffic: { map: true, noMap: false },
      tolls: true,
      apportion: false,
      safety: true,
    },
  },
  TCPL: {
    commodity: "natural-gas",
    name: "TransCanada’s Canadian Mainline",
    sections: {
      traffic: { map: true, noMap: false },
      apportion: false,
      tolls: true,
      safety: true,
    },
  },
  Westcoast: {
    commodity: "natural-gas",
    name: "Westcoast Pipeline",
    sections: {
      traffic: { map: true, noMap: false },
      apportion: false,
      tolls: true,
      safety: true,
    },
  },
  Brunswick: {
    commodity: "natural-gas",
    name: "Emera Brunswick",
    sections: {
      traffic: { map: false, noMap: true },
      apportion: false,
      tolls: true,
      safety: true,
    },
  },
  MNP: {
    commodity: "natural-gas",
    name: "Maritimes &amp; Northeast",
    sections: {
      traffic: { map: true, noMap: false },
      apportion: false,
      tolls: true,
      safety: true,
    },
  },
  ManyIslands: {
    commodity: "natural-gas",
    name: "Many Islands",
    sections: {
      traffic: { map: false, noMap: false },
      apportion: false,
      tolls: true,
      safety: true,
    },
  },
  TQM: {
    commodity: "natural-gas",
    name: "Trans Québec &amp; Maritimes",
    sections: {
      traffic: { map: true, noMap: false },
      apportion: false,
      tolls: true,
      safety: true,
    },
  },
  Vector: {
    commodity: "natural-gas",
    name: "Vector",
    sections: {
      traffic: { map: false, noMap: false },
      apportion: false,
      tolls: true,
      safety: true,
    },
  },
  Foothills: {
    commodity: "natural-gas",
    name: "Foothills",
    sections: {
      traffic: { map: true, noMap: false },
      apportion: false,
      tolls: true,
      safety: true,
    },
  },
  EnbridgeMainline: {
    commodity: "oil-and-liquids",
    name: "Enbridge Canadian Mainline",
    sections: {
      traffic: { map: true, noMap: false },
      apportion: true,
      tolls: true,
      safety: true,
    },
  },
  EnbridgeLine9: {
    commodity: "oil-and-liquids",
    name: "Enbridge Line 9",
    sections: {
      traffic: { map: false, noMap: true },
      apportion: false,
      tolls: true,
      safety: false,
    },
  },
  Keystone: {
    commodity: "oil-and-liquids",
    name: "Keystone Pipeline",
    sections: {
      traffic: { map: true, noMap: false },
      apportion: true,
      tolls: true,
      safety: true,
    },
  },
  TransMountain: {
    commodity: "oil-and-liquids",
    name: "Trans Mountain",
    sections: {
      traffic: { map: true, noMap: false },
      apportion: true,
      tolls: true,
      safety: true,
    },
  },
  Cochin: {
    commodity: "oil-and-liquids",
    name: "Cochin Pipeline",
    sections: {
      traffic: { map: true, noMap: false },
      apportion: true,
      tolls: true,
      safety: true,
    },
  },
  SouthernLights: {
    commodity: "oil-and-liquids",
    name: "Southern Lights",
    sections: {
      traffic: { map: false, noMap: true },
      apportion: false,
      tolls: true,
      safety: true,
    },
  },
  EnbridgeBakken: {
    commodity: "oil-and-liquids",
    name: "Enbridge Bakken",
    sections: {
      traffic: { map: false, noMap: false },
      apportion: false,
      tolls: true,
      safety: true,
    },
  },
  NormanWells: {
    commodity: "oil-and-liquids",
    name: "Enbridge Norman Wells",
    sections: {
      traffic: { map: true, noMap: false },
      apportion: true,
      tolls: true,
      safety: true,
    },
  },
  Express: {
    commodity: "oil-and-liquids",
    name: "Express",
    sections: {
      traffic: { map: false, noMap: false },
      apportion: false,
      tolls: true,
      safety: true,
    },
  },
  TransNorthern: {
    commodity: "oil-and-liquids",
    name: "Trans-Northern",
    sections: {
      traffic: { map: false, noMap: true },
      apportion: false,
      tolls: true,
      safety: true,
    },
  },
  Genesis: {
    commodity: "oil-and-liquids",
    name: "Genesis",
    sections: {
      traffic: { map: false, noMap: false },
      apportion: false,
      tolls: true,
      safety: true,
    },
  },
  Montreal: {
    commodity: "oil-and-liquids",
    name: "Montreal",
    sections: {
      traffic: { map: false, noMap: true },
      apportion: false,
      tolls: true,
      safety: true,
    },
  },
  Westspur: {
    commodity: "oil-and-liquids",
    name: "Westspur",
    sections: {
      traffic: { map: false, noMap: true },
      apportion: false,
      tolls: true,
      safety: true,
    },
  },
  Aurora: {
    commodity: "oil-and-liquids",
    name: "Aurora",
    sections: {
      traffic: { map: false, noMap: false },
      apportion: false,
      tolls: true,
      safety: true,
    },
  },
  MilkRiver: {
    commodity: "oil-and-liquids",
    name: "Milk River",
    sections: {
      traffic: { map: false, noMap: false },
      apportion: false,
      tolls: true,
      safety: true,
    },
  },
  Wascana: {
    commodity: "oil-and-liquids",
    name: "Wascana",
    sections: {
      traffic: { map: false, noMap: false },
      apportion: false,
      tolls: true,
      safety: true,
    },
  },
};
