import { generalTheme } from "../modules/themes.js";
import ieWarn from "ie-gang";
let warningParams = {
  message:
    "We noticed you are using Internet Explorer. Please consider using a different browser for a better experience on this page.",
  type: "alert",
  title: "Old Browser Warning",
  applyIE: false,
};
ieWarn(warningParams);
generalTheme();
// import { cassandraSettlements } from "../settlements/settlements.js";
import { ngtlConditionsMap } from "../conditions/NOVAGasTransmissionLtd/ngtl.js";
// cassandraSettlements();
ngtlConditionsMap();
