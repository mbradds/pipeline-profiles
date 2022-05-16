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
    sections: {
      traffic: { map: true, noMap: false },
      apportion: false,
      tolls: false,
      safety: true,
    },
  },
  Alliance: {
    sections: {
      traffic: { map: true, noMap: false },
      tolls: false,
      apportion: false,
      safety: true,
    },
  },
  TCPL: {
    sections: {
      traffic: { map: true, noMap: false },
      apportion: false,
      tolls: false,
      safety: true,
    },
  },
  Westcoast: {
    sections: {
      traffic: { map: true, noMap: false },
      apportion: false,
      tolls: false,
      safety: true,
    },
  },
  Brunswick: {
    sections: {
      traffic: { map: false, noMap: true },
      apportion: false,
      tolls: false,
      safety: true,
    },
  },
  MNP: {
    sections: {
      traffic: { map: true, noMap: false },
      apportion: false,
      tolls: false,
      safety: true,
    },
  },
  ManyIslands: {
    sections: {
      traffic: { map: false, noMap: false },
      apportion: false,
      tolls: false,
      safety: true,
    },
  },
  TQM: {
    sections: {
      traffic: { map: true, noMap: false },
      apportion: false,
      tolls: false,
      safety: true,
    },
  },
  Vector: {
    sections: {
      traffic: { map: false, noMap: false },
      apportion: false,
      tolls: false,
      safety: true,
    },
  },
  Foothills: {
    sections: {
      traffic: { map: true, noMap: false },
      apportion: false,
      tolls: false,
      safety: true,
    },
  },
  EnbridgeMainline: {
    sections: {
      traffic: { map: true, noMap: false },
      apportion: true,
      tolls: false,
      safety: true,
    },
  },
  EnbridgeLine9: {
    sections: {
      traffic: { map: false, noMap: true },
      apportion: false,
      tolls: false,
      safety: false,
    },
  },
  Keystone: {
    sections: {
      traffic: { map: true, noMap: false },
      apportion: true,
      tolls: false,
      safety: true,
    },
  },
  TransMountain: {
    sections: {
      traffic: { map: true, noMap: false },
      apportion: true,
      tolls: false,
      safety: true,
    },
  },
  Cochin: {
    sections: {
      traffic: { map: true, noMap: false },
      apportion: true,
      tolls: false,
      safety: true,
    },
  },
  SouthernLights: {
    sections: {
      traffic: { map: false, noMap: true },
      apportion: false,
      tolls: false,
      safety: true,
    },
  },
  EnbridgeBakken: {
    sections: {
      traffic: { map: false, noMap: false },
      apportion: false,
      tolls: false,
      safety: true,
    },
  },
  NormanWells: {
    sections: {
      traffic: { map: true, noMap: false },
      apportion: true,
      tolls: false,
      safety: true,
    },
  },
  Express: {
    sections: {
      traffic: { map: false, noMap: false },
      apportion: false,
      tolls: false,
      safety: true,
    },
  },
  TransNorthern: {
    sections: {
      traffic: { map: false, noMap: true },
      apportion: false,
      tolls: false,
      safety: true,
    },
  },
  Genesis: {
    sections: {
      traffic: { map: false, noMap: false },
      apportion: false,
      tolls: false,
      safety: true,
    },
  },
  Montreal: {
    sections: {
      traffic: { map: false, noMap: true },
      apportion: false,
      tolls: false,
      safety: true,
    },
  },
  Westspur: {
    sections: {
      traffic: { map: false, noMap: true },
      apportion: false,
      tolls: false,
      safety: true,
    },
  },
  Aurora: {
    sections: {
      traffic: { map: false, noMap: false },
      apportion: false,
      tolls: false,
      safety: true,
    },
  },
  MilkRiver: {
    sections: {
      traffic: { map: false, noMap: false },
      apportion: false,
      tolls: false,
      safety: true,
    },
  },
  Wascana: {
    sections: {
      traffic: { map: false, noMap: false },
      apportion: false,
      tolls: false,
      safety: true,
    },
  },
};
