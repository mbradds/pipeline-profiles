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

const profileSections = {
  ngtl: {
    sections: {
      traffic: { map: true, noMap: false },
      apportion: false,
      safety: true,
    },
  },
  alliance: {
    sections: {
      traffic: { map: true, noMap: false },
      apportion: false,
      safety: true,
    },
  },
  tcpl: {
    sections: {
      traffic: { map: true, noMap: false },
      apportion: false,
      safety: true,
    },
  },
  westcoast: {
    sections: {
      traffic: { map: true, noMap: false },
      apportion: false,
      safety: true,
    },
  },
  emera_brunswick: {
    sections: {
      traffic: { map: false, noMap: false },
      apportion: false,
      safety: true,
    },
  },
  maritimes_northeast: {
    sections: {
      traffic: { map: true, noMap: false },
      apportion: false,
      safety: true,
    },
  },
  many_islands: {
    sections: {
      traffic: { map: false, noMap: false },
      apportion: false,
      safety: true,
    },
  },
  tqm: {
    sections: {
      traffic: { map: true, noMap: false },
      apportion: false,
      safety: true,
    },
  },
  vector: {
    sections: {
      traffic: { map: false, noMap: false },
      apportion: false,
      safety: true,
    },
  },
  foothills: {
    sections: {
      traffic: { map: true, noMap: false },
      apportion: false,
      safety: true,
    },
  },
  enbridge_mainline: {
    sections: {
      traffic: { map: true, noMap: false },
      apportion: false,
      safety: true,
    },
  },
  keystone: {
    sections: {
      traffic: { map: true, noMap: false },
      apportion: true,
      safety: true,
    },
  },
  trans_mountain: {
    sections: {
      traffic: { map: true, noMap: false },
      apportion: true,
      safety: true,
    },
  },
  cochin: {
    sections: {
      traffic: { map: true, noMap: false },
      apportion: true,
      safety: true,
    },
  },
  southern_lights: {
    sections: {
      traffic: { map: false, noMap: false },
      apportion: false,
      safety: true,
    },
  },
  bakken: {
    sections: {
      traffic: { map: false, noMap: false },
      apportion: false,
      safety: true,
    },
  },
  norman_wells: {
    sections: {
      traffic: { map: true, noMap: false },
      apportion: true,
      safety: true,
    },
  },
  express_pipeline: {
    sections: {
      traffic: { map: false, noMap: false },
      apportion: false,
      safety: true,
    },
  },
  trans_northern: {
    sections: {
      traffic: { map: false, noMap: true },
      apportion: false,
      safety: true,
    },
  },
  genesis: {
    sections: {
      traffic: { map: false, noMap: false },
      apportion: false,
      safety: true,
    },
  },
  montreal: {
    sections: {
      traffic: { map: false, noMap: false },
      apportion: false,
      safety: true,
    },
  },
  westspur: {
    sections: {
      traffic: { map: false, noMap: false },
      apportion: false,
      safety: true,
    },
  },
  aurora: {
    sections: {
      traffic: { map: false, noMap: false },
      apportion: false,
      safety: true,
    },
  },
  milk_river: {
    sections: {
      traffic: { map: false, noMap: false },
      apportion: false,
      safety: true,
    },
  },
  wascana: {
    sections: {
      traffic: { map: false, noMap: false },
      apportion: false,
      safety: true,
    },
  },
};

module.exports = profileSections;
