export const summaryParagraph = (meta) => {
  let paragraph = document.getElementById("system-incidents-paragraph");
  let paragraphText = `<p>`;

  const dynamicValue = (val) => {
    return `<i class="profile-text-value"><strong>${val}</strong></i>`;
  };

  //first dynamic paragraph.
  paragraphText += `${meta.companyName} has reported a total of ${dynamicValue(
    meta.release + meta.nonRelease
  )} incidents since 2008. Of those incidents, ${dynamicValue(
    meta.release
  )} have resulted in some volume of product being released, with ${dynamicValue(
    meta.mostCommonSubstance
  )} being the most commonly released substance. \
  The dashboard below provides some more information about these product release incidents.\ 
  Part of the CER's incident investigation classifies incidents based on what happened to cause the incident, and why it happened.\ 
  On the pipeline system, the most common <i>what happened</i> is ${dynamicValue(
    meta.mostCommonWhat
  )} and the most common <i>why it happened</i> is ${dynamicValue(
    meta.mostCommonWhy
  )}.`;
  paragraphText += `</p>`;

  //second dynamic paragraph

  paragraphText += `<p>`;
  paragraphText += `The dashboard below displays only the incidents that resulted in a release of product from the pipeline, however there are other \
  important incident event types that may not appear on the dashboard. \
  Of ${meta.companyName} reported incidents, ${dynamicValue(
    meta.seriousEvents["Adverse Environmental Effects"]
  )} have resulted in adverse environmental effects.\
  There have been ${dynamicValue(
    meta.seriousEvents["Serious Injury (CER or TSB)"]
  )} serious injuries, and ${dynamicValue(
    meta.seriousEvents["Fatality"]
  )} fatality related to incident events.`;
  paragraphText += `</p>`;
  paragraph.innerHTML = paragraphText;
};
