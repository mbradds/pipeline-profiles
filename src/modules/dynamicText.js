export const profileTextQuery = (function () {
  //   let paragraph = document.getElementById("system-incidents-paragraph");
  const dynamicValue = (val) => {
    return `<i class="bg-primary" style="font-style: normal"><strong>&nbsp${val}&nbsp</strong></i>`;
  };

  const postWord = (val, type) => {
    if (type == "have") {
      if (val == 1) {
        return "has";
      } else {
        return "have";
      }
    } else if (type == "fatality") {
      if (val == 1) {
        return "fatality";
      } else {
        return "fatalities";
      }
    }
  };

  const incidentsEnglish = (id, meta) => {
    const paragraph = document.getElementById(id);
    let paragraphText = `<p>`;
    //total incidents.
    paragraphText += `${
      meta.companyName
    } has reported a total of ${dynamicValue(
      meta.release + meta.nonRelease
    )} incidents since 2008. Of those incidents, ${dynamicValue(
      meta.release
    )} have resulted in some volume of product being released, with ${dynamicValue(
      meta.mostCommonSubstance
    )} being the most commonly released substance. \
        The dashboard below provides some more information about these product release incidents.`;
    paragraphText += `</p>`;

    //most common reasons
    paragraphText += `<p>Part of the CER's incident review classifies incidents based on the\ 
        circumstances that directly led to the incident (what happened), and the underlying reasons for the incident (why it happened).\ 
        On the pipeline system, the most common <i>what happened</i> is ${dynamicValue(
          meta.mostCommonWhat
        )} and the most common <i>why it happened</i> is ${dynamicValue(
      meta.mostCommonWhy
    )}.`;
    paragraphText += ` Take a look at the <i>Incident Trends</i> section of the dashboard below for definitions and a breakdown of what and why.</p>`;

    //other important non-release incident types
    paragraphText += `<p>`;
    paragraphText += `The dashboard below displays only the incidents that resulted in a release of product from the pipeline, however there are other \
        important incident types that may not appear on the dashboard. \
        Of ${meta.companyName} reported incidents, ${dynamicValue(
      meta.seriousEvents["Adverse Environmental Effects"]
    )} ${postWord(
      meta.seriousEvents["Adverse Environmental Effects"],
      "have"
    )} resulted in adverse environmental effects.\
        There have been ${dynamicValue(
          meta.seriousEvents["Serious Injury (CER or TSB)"]
        )} serious injuries, and ${dynamicValue(
      meta.seriousEvents["Fatality"]
    )} ${postWord(
      meta.seriousEvents["Fatality"],
      "fatality"
    )} related to incident events. Open the dropdown below to view the definitions of these incident types.`;
    paragraphText += `</p>`;
    paragraph.innerHTML = paragraphText;
  };

  const oandmEnglish = (id, meta) => {
    const paragraph = document.getElementById(id);
    // first total/summary paragraph for the system.
    let paragraphText = `<p>`;
    paragraphText += `${
      meta.companyName
    } has reported a total of ${dynamicValue(
      meta.numberOfEvents
    )} individual O&M activities, and ${dynamicValue(
      meta.numberOfDigs + " integrity digs"
    )} since ${meta.earliestYear}. The latest O&M activity occured in ${
      meta.latestYear
    }.</p>`;

    let commonActivityText = ``;
    let counter = 0;
    let activitySize = Object.keys(meta.mostCommonActivity).length;
    for (const property in meta.mostCommonActivity) {
      counter++;
      if (counter !== activitySize) {
        commonActivityText += `${property} (${meta.mostCommonActivity[property]}), `;
      } else {
        commonActivityText += `and ${property} (${meta.mostCommonActivity[property]})`;
      }
    }
    // second most common event/location paragraph
    paragraphText += `<p>On the pipeline system, the ${activitySize} most common O&M activity types conducted are ${dynamicValue(
      commonActivityText
    )}. There have been ${dynamicValue(
      meta.speciesAtRiskEvents
    )} O&M activities with a species at risk present. \
    These activities can occur at various locations on or near the pipeline. On the pipeline system, O&M activities have occured near ${dynamicValue(
      meta.nearby
    )} among other populated areas.</p>`;
    paragraph.innerHTML = paragraphText;
  };

  return { incidentsEnglish: incidentsEnglish, oandmEnglish: oandmEnglish };
})();
