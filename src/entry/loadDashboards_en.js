/**
 * @file Serves as the entry point for the English profile code bundle. This bundle contains all the code I write, as well
 * as all core-js polyfills.
 *
 * I want this to remain its own bundle, because it will continue to change rapidly as the project is developed. And will likely
 * change more frequently, or at different times, compared to the vendor and data bundles. This means that new features on existing
 * sections, or hotfixes, can be deployed without changing the data, and new data can be updated quarterly without changing the code bundle.
 *
 * Right now there is an english (loadDashboards_en.js) and french (loadDashboards_fr.js) code entrypoint. This adds a bit of complexity,
 * but helps cut down on code size. Only the language strings in ../modules/langEnglish.js appear in this bundle, so there isnt a bunch
 * of dead french text, with if statements selecting english strings. Its unlikely that external users are going to regularly switch
 * between languages past the profiles landing page, so this is probably the most cache efficent pattern.
 */
import { generalTheme } from "../modules/themes";
// conditions
import { mainConditions } from "../dashboards/conditionsDashboard";
// incidents
import { mainIncidents } from "../dashboards/incidentsDashboard";
// language;
import { englishDashboard } from "../modules/langEnglish";
// traffic
import { mainTraffic } from "../dashboards/trafficDashboard";
// apportionment
import { mainApportion } from "../dashboards/apportionmentDashboard";
// plains disclaimers
import { plainsMidstreamProfile } from "../modules/util";

require("../css/main.css");

// console.time(`first content loading`);

generalTheme();

export async function loadAllCharts(data, plains = false) {
  const arrayOfCharts = [
    mainTraffic(
      data.trafficData.traffic,
      data.trafficData.meta,
      englishDashboard.traffic
    ),
    mainApportion(data.apportionData, englishDashboard.apportion),
    mainConditions(
      JSON.parse(data.conditionsData.regions),
      data.canadaMap,
      data.conditionsData.mapMeta,
      data.conditionsData.meta,
      englishDashboard.conditions
    ),
    mainIncidents(
      data.incidentData.events,
      data.incidentData.meta,
      englishDashboard.incidents
    ),
  ];

  return Promise.allSettled(arrayOfCharts).then(() => {
    // console.timeEnd(`first content loading`);
    if (plains) {
      plainsMidstreamProfile(englishDashboard, "plains_disclaimer");
    }
  });
}
