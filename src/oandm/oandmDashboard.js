import { EventNavigator, EventTrend } from "../modules/dashboard";
import { oandmText } from "../modules/dynamicText";
import { regionColors, yesNoColors } from "../modules/colors";

export function mainOandM(eventData, lang) {
  console.log(eventData);
  const eventType = "oandm";
  const field = "Integrity Dig";
  const filters = { type: "frequency" };

  function addDashboardTitle() {
    const titleElement = document.getElementById("oandm-dashboard-title");
    if (
      Object.prototype.hasOwnProperty.call(
        lang.companyToSystem,
        eventData.meta.company
      )
    ) {
      titleElement.innerText = lang.title(
        lang.companyToSystem[eventData.meta.company]
      );
    } else {
      titleElement.innerHTML = lang.title(eventData.meta.company);
    }
  }

  function loadDynamicText() {
    oandmText(eventData.meta, lang);
  }

  const engNames = { y: "Yes", n: "No" };
  const seriesInfo = {
    "Integrity Dig": { colors: yesNoColors, names: engNames },
    "Fish Present": { colors: yesNoColors, names: engNames },
    "In Stream Work Required": { colors: yesNoColors, names: engNames },
    "Species At Risk Present": { colors: yesNoColors, names: engNames },
    "Province/Territory": {
      colors: regionColors,
      names: {
        ab: "Alberta",
        bc: "British Columbia",
        sk: "Saskatchewan",
        mb: "Manitoba",
        qc: "Quebec",
        on: "Ontario",
      },
    },
  };

  const definitions = {
    "Integrity Dig":
      "Indicates If Activity Include Excavation To Expose, Assess, Or Repair An Existing Pipeline.",
    "Fish Present":
      "Indicates If Will There Be Ground Disturbance Using Power-Operated Equipment Within 30M Of A Wetland Or A Water Body Or Within 30 M Of The Substrate Of A Wetland Or Water Body At The Activity Site, and the water body is fish-bearing.",
    "In Stream Work Required":
      "Indicates If There Will Be Any In-Stream Work At Activity Site.",
    "Species At Risk Present":
      "Indicates If There Are Species Present Which Are Listed On Schedule 1 Of The Species At Risk Act at the Activity Site.",
  };

  const incidentTimeSeries = (timeField, timeFilters) => {
    const timeSeries = new EventTrend({
      eventType,
      field: timeField,
      filters: timeFilters,
      data: eventData.data,
      seriesed: true,
      seriesInfo,
      definitions,
      definitionsOn: "pill",
      hcDiv: "time-series-oandm",
      lang,
    });
    const trendNav = new EventNavigator({
      plot: timeSeries,
      langPillTitles: lang.pillTitles,
      height: 70,
      showClickText: false,
    });

    trendNav.makeBar("Integrity Dig", "oandm-dig-trend", "activated", false);
    trendNav.makeBar(
      "Province/Territory",
      "oandm-region-trend",
      "deactivated",
      false
    );
    trendNav.makeBar("Fish Present", "oandm-fish-trend", "deactivated", false);
    trendNav.makeBar(
      "In Stream Work Required",
      "oandm-instream-trend",
      "deactivated",
      false
    );
    trendNav.makeBar(
      "Species At Risk Present",
      "oandm-species-trend",
      "deactivated",
      false
    );
    trendNav.divEvents();
    timeSeries.createChart();
    return timeSeries;
  };

  addDashboardTitle();
  loadDynamicText();
  incidentTimeSeries(field, filters);
}
