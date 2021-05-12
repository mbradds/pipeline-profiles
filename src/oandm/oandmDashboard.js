import { oandmText } from "../modules/dynamicText";

export function mainOandM(eventData) {
  function loadDynamicText() {
    oandmText(eventData.meta);
  }

  loadDynamicText();
}
