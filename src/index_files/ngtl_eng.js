console.time(`chart loading`);
//highcharts themes/configuration
import { generalTheme } from "../modules/themes.js";
import ieWarn from "ie-gang";

import { runConditions } from "../conditions/NOVAGasTransmissionLtd/index.js";
import { runIncidents } from "../incidents/NOVAGasTransmissionLtd/index.js";

let warningParams = {
  message:
    "We noticed you are using Internet Explorer. Please consider using a different browser for a better experience on this page.",
  type: "alert",
  title: "Old Browser Warning",
  applyIE: false,
};

ieWarn(warningParams);
generalTheme();

async function loadAllCharts() {
  let arrayOfCharts = [runConditions(), runIncidents()];
  Promise.allSettled(arrayOfCharts).then((value) => {
    console.timeEnd(`chart loading`);
  });
}

loadAllCharts();
