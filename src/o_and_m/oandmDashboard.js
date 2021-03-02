import { profileTextQuery } from "../modules/dynamicText.js";
import { profileAssist as pa } from "../modules/util.js";

export async function mainOandM(activityData, metaData, lang) {
  function buildDashboard() {
    try {
      profileTextQuery.oandmEnglish("system-o&m-paragraph", metaData);
    } catch (err) {
      console.log(err);
    }
  }

  return buildDashboard();
}
