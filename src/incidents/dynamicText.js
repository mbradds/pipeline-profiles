export const generateDynamicIncidentText = (meta) => {
  let paragraph = document.getElementById("system-incidents-paragraph");
  let paragraphText = `<p>`;

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

  //total incidents.
  paragraphText += `${meta.companyName} has reported a total of ${dynamicValue(
    meta.release + meta.nonRelease
  )} incidents since 2008. Of those incidents, ${dynamicValue(
    meta.release
  )} have resulted in some volume of product being released, with ${dynamicValue(
    meta.mostCommonSubstance
  )} being the most commonly released substance. \
  The dashboard below provides some more information about these unintended product release incidents.`;
  paragraphText += `</p>`;

  //relative percentages compared to other companies
  paragraphText += `<p>Relative to other CER regulated pipelines, ${
    meta.companyName
  } has accounted for approximately ${dynamicValue(
    meta.relativePct.count + "%"
  )} of reported incidents. Per 1000 km there have been approximately ${dynamicValue(
    meta.per1000km.incidentsPerKm
  )} incidents (all incident types), compared to an average of ${dynamicValue(
    meta.per1000km.avgPerKm
  )} for large CER regulated ${meta.per1000km.commodity} pipelines.`;

  paragraphText += `</p>`;

  //most common reasons
  paragraphText += `<p>Part of the CER's incident review classifies incidents based on the\ 
  circumstances that directly led to the incident (what happened), and the underlying reasons for the incident (why it happened).\ 
  On the pipeline system, the most common <i>what happened</i> is ${dynamicValue(
    meta.mostCommonWhat
  )} and the most common <i>why it happened</i> is ${dynamicValue(
    meta.mostCommonWhy
  )}.`;
  paragraphText += `</p>`;

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
  )} related to incident events.`;
  paragraphText += `</p>`;
  paragraph.innerHTML = paragraphText;
};
