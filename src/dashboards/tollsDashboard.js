import { Tolls } from "../modules/dashboard/Tolls.js";

export async function mainTolls(tollsData, metaData) {
  function buildDecision() {
    const dashboard = new Tolls({
      tollsData,
      metaData,
      chartDiv: "tolls-chart",
    });
    if (metaData.build) {
      dashboard.buildDashboard();
    } else {
      // console.log("no tolls data");
    }
  }

  try {
    buildDecision();
  } catch (err) {
    // import and raise dashboard error here
    console.log(err);
  }
}
