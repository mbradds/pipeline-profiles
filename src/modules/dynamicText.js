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

export const incidentsTextEng = (id, meta) => {
  const paragraph = document.getElementById(id);
  let paragraphText = `<p>`;
  //total incidents.
  paragraphText += `The ${
    meta.systemName
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
        On this pipeline system, the most common <i>what happened</i> is ${dynamicValue(
          meta.mostCommonWhat
        )} and the most common <i>why it happened</i> is ${dynamicValue(
    meta.mostCommonWhy
  )}.`;
  paragraphText += ` Take a look at the <i>incident trends</i> section of the dashboard below for definitions and a breakdown of what and why.</p>`;

  //other important non-release incident types
  paragraphText += `<p>`;
  paragraphText += `The dashboard below displays only the incidents that resulted in a release of product from the pipeline, however there are other \
        important incident types that may not appear on the dashboard. \
        Of ${meta.systemName}'s reported incidents, ${dynamicValue(
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

export const incidentsTextFra = (id, meta) => {
  const paragraph = document.getElementById(id);
  let paragraphText = `<p>`;
  //total incidents.
  paragraphText += `FR ${
    meta.systemName
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
        On this pipeline system, the most common <i>what happened</i> is ${dynamicValue(
          meta.mostCommonWhat
        )} and the most common <i>why it happened</i> is ${dynamicValue(
    meta.mostCommonWhy
  )}.`;
  paragraphText += ` Take a look at the <i>incident trends</i> section of the dashboard below for definitions and a breakdown of what and why.</p>`;

  //other important non-release incident types
  paragraphText += `<p>`;
  paragraphText += `The dashboard below displays only the incidents that resulted in a release of product from the pipeline, however there are other \
        important incident types that may not appear on the dashboard. \
        Of ${meta.systemName}'s reported incidents, ${dynamicValue(
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
