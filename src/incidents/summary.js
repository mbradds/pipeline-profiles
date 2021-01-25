export const summaryParagraph = (meta) => {
  let paragraph = document.getElementById("system-incidents-paragraph");
  let paragraphText = `<p>`;
  paragraphText += `${meta.companyName} has reported a total of ${
    meta.release + meta.nonRelease
  } incidents since 2008. Of those incidents, ${
    meta.release
  } have resulted in some volume of product being released, with <i>${
    meta.mostCommonSubstance
  } </i> being the most commonly released substance. \
  The dashboard below provides some more information about these product release incidents.\ 
  Part of the CER's incident investigation classifies incidents based on what happened to cause the incident, and why it happened.\ 
  On the pipeline system, the most common what is <i>${
    meta.mostCommonWhat
  }</i> and the most common why is <i>${meta.mostCommonWhy}</i>.`;
  paragraphText += `</p>`;
  paragraph.innerHTML = paragraphText;
};
