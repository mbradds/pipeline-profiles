/**
 * @file Contains functionality for generating dynamic HTML paragraphs with highlighted data points of interest.
 *
 * Currently contains functionality for:
 * - Incidents: incidentsTextEng | incidentsTextFra
 * - Traffic: trafficTrendTextEng | trafficTrendTextFra
 * - Operations & Maintenance: oandmText
 *
 * The functionality is split into seperate English and French functions, because the paragraph structure can be very different,
 * and would add alot of unneccecary weight to the code bundles.
 */

import { listOrParagraph } from "./util.js";

const dynamicValue = (val) =>
  `<span class="bg-primary"><strong>&nbsp;${val}&nbsp;</strong></span>`;

/**
 * Usefull when the company name has a period and appears at the end of the sentence.
 * @param {string} name - The full company name to be formatted.
 * @returns {string} - Company name with the period stripped.
 */
const formatCompanyName = (name) => name.replace(".", "");

const quartersEn = { 12: "Q4", 9: "Q3", 6: "Q2", 3: "Q1" };
const quartersFr = { 12: "T4", 9: "T3", 6: "T2", 3: "T1" };

const postWord = (val, type) => {
  if (type === "have") {
    return val === 1 ? "has" : "have";
  }
  if (type === "fatality") {
    return val === 1 ? "fatality" : "fatalities";
  }
  return "";
};

const changeText = (num, lang, frontText = true) => {
  const textInfo = (val) => {
    let styleList = ["bg-success", "no calculation available"];
    if (val > 0) {
      if (frontText) {
        const langText = lang === "en" ? "increased by" : "augmenté de";
        styleList = ["bg-success", `${langText} ${Math.abs(num)}%`];
      } else {
        const langText = lang === "en" ? "above" : "au-dessus de";
        styleList = ["bg-success", `${Math.abs(num).toFixed(0)}% ${langText}`];
      }
    } else if (val < 0) {
      if (frontText) {
        const langText = lang === "en" ? "decreased by" : "diminué de";
        styleList = ["bg-danger", `${langText} ${Math.abs(num)}%`];
      } else {
        const langText = lang === "en" ? "below" : "sous";
        styleList = ["bg-danger", `${Math.abs(num).toFixed(0)}% ${langText}`];
      }
    } else if (val === 0 || val === null) {
      if (frontText) {
        const langText = lang === "en" ? "not changed" : "inchangés";
        styleList = ["bg-info", `${langText}`];
      } else {
        const langText = lang === "en" ? "equal to" : "égal à";
        styleList = ["bg-info", `${langText}`];
      }
    }
    return styleList;
  };
  const [flag, text] = textInfo(num);
  return `<i class="${flag}" style="font-style: normal"><strong>${text}</strong></i>`;
};

const trendSub = (commodity, lang) => {
  if (commodity === "gas") {
    return lang === "en" ? "year over year" : "d’une année à l’autre,";
  }
  if (commodity === "oil") {
    return lang === "en" ? "quarter over quarter" : "d’un trimestre à l’autre";
  }
  return "";
};

const formatValue = (value, units, numberFormat) => {
  if (units.base !== units.current) {
    return numberFormat(value * units.conversion);
  }
  return numberFormat(value);
};

const buildFiveText = (ft, tt, lang) => {
  const pctChange = ((ft.lastYrQtr - ft.fiveYrQtr) / ft.fiveYrQtr) * 100;
  if (pctChange) {
    if (lang === "en") {
      return `<p>Throughputs in ${quartersEn[tt.toDate[1]]} ${
        tt.toDate[0]
      } are ${changeText(pctChange, lang, false)} the five-year average.</p>`;
    }
    return `<p>Les débits au ${quartersFr[tt.toDate[1]]} de ${
      tt.toDate[0]
    } sont ${changeText(
      pctChange,
      lang,
      false
    )} de la moyenne sur cinq ans.</p>`;
  }
  return "";
};

function joinTextList(list, lang) {
  if (lang === "e") {
    return list.join(", ");
  }
  if (lang === "f" && list.length === 1) {
    return `de ${list[0]}`;
  }
  if (lang === "f" && list.length > 1) {
    const lastOne = list.pop();
    return `de ${list.join(", de ")} et de ${lastOne}`;
  }
  return "";
}

export const incidentsTextEng = (id, meta) => {
  // total incidents.
  let paragraphText = `<p>The ${
    meta.systemName
  } has reported a total of ${dynamicValue(
    meta.release + meta.nonRelease
  )} incidents since 2008. Of those incidents, ${dynamicValue(
    meta.release
  )} have resulted in some volume of product being released, with ${dynamicValue(
    meta.mostCommonSubstance
  )} being the most commonly released substance. \
        The dashboard below provides some more information about these product release incidents.</p>`;

  // most common reasons
  paragraphText += `<p>Part of the CER's incident review classifies incidents based on the 
        circumstances that directly led to the incident (what happened), and the underlying reasons for the incident (why it happened). 
        On this pipeline system, the most common what happened is ${dynamicValue(
          meta.mostCommonWhat
        )} and the most common why it happened is ${dynamicValue(
    meta.mostCommonWhy
  )}.`;
  paragraphText += ` Take a look at the incident trends section of the dashboard below for definitions and a breakdown of what and why.</p>`;

  // other important non-release incident types
  paragraphText += `<p>The dashboard below displays only the incidents that resulted in a release of product from the pipeline, however there are other \
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
    meta.seriousEvents.Fatality
  )} ${postWord(
    meta.seriousEvents.Fatality,
    "fatality"
  )} related to incident events. Open the dropdown below to view the definitions of these incident types.</p>`;
  document.getElementById(id).innerHTML = paragraphText;
};

export const incidentsTextFra = (id, meta) => {
  // total incidents.
  let paragraphText = `<p>Un total de ${dynamicValue(
    meta.release + meta.nonRelease
  )} incidents ont été signalés à l’égard du réseau de ${
    meta.systemName
  } depuis 2008. De ces incidents, ${dynamicValue(
    meta.release
  )} ont entraîné le rejet d’un certain volume de produit. Le ${dynamicValue(
    meta.mostCommonSubstance
  )} est la substance la plus couramment rejetée. Le tableau de bord ci-dessous renferme de plus amples renseignements sur ces incidents.</p>`;

  // most common reasons
  paragraphText += `<p>Dans le cadre de l’examen des incidents, la Régie classe ceux-ci en fonction des circonstances directement \
  liées à leur origine (ce qui s’est produit) et de leurs causes sous-jacentes (pourquoi cela s’est produit). \
  Sur ce réseau pipelinier, ce qui s’est produit le plus souvent, ce sont des ${dynamicValue(
    meta.mostCommonWhat
  )} et la question de ${dynamicValue(meta.mostCommonWhy)}`;
  paragraphText += ` qui expliquent le plus souvent pourquoi cela s’est produit. Jetez un coup d’œil à la section sur les tendances des incidents du tableau de bord ci-dessous pour obtenir des définitions et une explication de ce qui se produit et pourquoi.</p>`;

  // other important non-release incident types
  paragraphText += `<p>Le tableau de bord ci-dessous ne montre que les incidents qui ont entraîné un déversement de produit à partir du pipeline,\
   mais il y a d’autres types d’incidents importants qui peuvent ne pas y figurer. \
   Parmi les incidents signalés pour le ${meta.systemName}, ${dynamicValue(
    meta.seriousEvents["Adverse Environmental Effects"]
  )} ont entraîné des effets environnementaux négatifs.\
  Il y a eu ${dynamicValue(
    meta.seriousEvents["Serious Injury (CER or TSB)"]
  )} cas de blessures graves et ${dynamicValue(
    meta.seriousEvents.Fatality
  )} décès liés à des incidents. Cliquez sur le menu déroulant ci-dessous pour voir les définitions de ces types d’incidents.</p>`;
  document.getElementById(id).innerHTML = paragraphText;
};

export function trafficTrendTextEng(params, numberFormat, seriesId) {
  const buildText = (trend, point, units) => {
    const trendId =
      trend.name !== "default" ? ` (${seriesId[trend.name]})` : "";
    return `Throughputs at the ${dynamicValue(
      point + trendId
    )} key point have ${changeText(trend.throughChange.pct, "en")} ${trendSub(
      params.commodity,
      "en"
    )}, from an average of ${formatValue(
      trend.throughChange.from,
      units,
      numberFormat
    )} ${units.current} in ${quartersEn[trend.fromDate[1]]} ${
      trend.fromDate[0]
    } to an average of ${formatValue(
      trend.throughChange.to,
      units,
      numberFormat
    )} ${units.current} in ${quartersEn[trend.toDate[1]]} ${
      trend.toDate[0]
    } (most recent quarter of data).`;
  };

  let trendText = "";
  if (!params.tm) {
    const thisTrend = params.trendText[params.defaultPoint.id];
    thisTrend.forEach((trend) => {
      trendText += `<p>${buildText(
        trend,
        params.defaultPoint.name,
        params.unitsHolder
      )}</p>`;
    });
    if (params.fiveTrend) {
      trendText += buildFiveText(params.fiveTrend, thisTrend[0], "en");
    }
  } else {
    const pointText = params.points.map((p) => ({
      textCol: buildText(params.trendText[p.id][0], p.name, params.unitsHolder),
    }));
    trendText = listOrParagraph(pointText, "textCol");
  }
  document.getElementById("traffic-trends").innerHTML = trendText;
}

export function trafficTrendTextFra(params, numberFormat, seriesId) {
  const buildText = (trend, point, units) => {
    const trendId =
      trend.name !== "default" ? ` (${seriesId[trend.name]})` : "";
    return `Les débits au point principal ${dynamicValue(
      point + trendId
    )} ont ${changeText(trend.throughChange.pct, "fr")} ${trendSub(
      params.commodity,
      "fr"
    )} d’une moyenne de ${formatValue(
      trend.throughChange.from,
      units,
      numberFormat
    )} ${units.current} en ${quartersFr[trend.fromDate[1]]} de ${
      trend.fromDate[0]
    } à une moyenne de ${formatValue(
      trend.throughChange.to,
      units,
      numberFormat
    )} ${units.current} en ${quartersFr[trend.toDate[1]]} de ${
      trend.toDate[0]
    } (dernier trimestre des données).`;
  };

  let trendText = "";
  if (!params.tm) {
    const thisTrend = params.trendText[params.defaultPoint.id];
    thisTrend.forEach((trend) => {
      trendText += `<p>${buildText(
        trend,
        params.defaultPoint.name,
        params.unitsHolder
      )}</p>`;
    });
    if (params.fiveTrend) {
      trendText += buildFiveText(params.fiveTrend, thisTrend[0], "fr");
    }
  } else {
    const pointText = params.points.map((p) => ({
      textCol: buildText(params.trendText[p.id][0], p.name, params.unitsHolder),
    }));
    trendText = listOrParagraph(pointText, "textCol");
  }
  document.getElementById("traffic-trends").innerHTML = trendText;
}

export function oandmTextEng(meta, lang) {
  const firstParagraph = `<p>Since 2015, there have been a total of ${dynamicValue(
    lang.numberFormat(meta.totalEvents, 0)
  )} O&#38;M activities reported by the ${formatCompanyName(
    meta.system
  )}. When the activity involves an integrity dig, the activity may entail exposing an area of the pipeline by performing one or more integrity assessments. There have been ${dynamicValue(
    lang.numberFormat(meta.totalDigs, 0)
  )} individual integrity digs as part of the reported O&#38;M activities.<p>`;

  let secondParagraph = "";
  if (meta.nearby) {
    secondParagraph = `<p>These O&#38;M activities can occur anywhere along or near the pipeline right-of-way, including near populated areas. In the past year (${
      meta.nearbyYear
    }), O&#38;M activities have occurred most often near ${dynamicValue(
      joinTextList(meta.nearby, lang.lang)
    )} among others.</p>`;
  }

  const fourthParagraph = `<p>There have been ${dynamicValue(
    meta.atRisk
  )} O&#38;M activities for which new temporary or permanent land is required and is located within critical habitat for any Endangered or Threatened species listed on Schedule 1 of the federal <a href="https://laws-lois.justice.gc.ca/eng/acts/S-15.3/"><i>Species at Risk Act</i></a>. When this happens, the company may be required to meet additional regulatory obligations outside of the <i>CER Act</i>, such as the <a href="https://laws-lois.justice.gc.ca/eng/acts/M-7.01/"><i>Migratory Birds Convention Act</i></a> and the <i>Species at Risk Act</i>.</p>`;

  document.getElementById("oandm-dynamic-text").innerHTML =
    firstParagraph + secondParagraph + fourthParagraph;
}

export function oandmTextFra(meta, lang) {
  const firstParagraph = `<p>Depuis 2015, un total de ${dynamicValue(
    lang.numberFormat(meta.totalEvents, 0)
  )} activités d’exploitation et d’entretien ont été signalées sur le ${formatCompanyName(
    meta.system
  )}. Lorsqu’il s’agit d’une fouille d’intégrité, il peut s’agir d’une mise à nu d’une zone du pipeline dans le cadre d’une ou de plusieurs évaluations de l’intégrité. Il y a eu ${dynamicValue(
    lang.numberFormat(meta.totalDigs, 0)
  )} fouilles d’intégrité individuelles dans le cadre des activités d’exploitation et d’entretien déclarées.<p>`;

  let secondParagraph = "";
  if (meta.nearby) {
    secondParagraph = `<p>Ces activités d’exploitation et d’entretien peuvent avoir lieu n’importe où le long de l’emprise pipelinière ou à proximité de celle-ci, y compris à proximité de zones peuplées. Au cours de la dernière année (${
      meta.nearbyYear
    }), les activités d’exploitation et d’entretien ont le plus souvent eu lieu notamment près ${dynamicValue(
      joinTextList(meta.nearby, lang.lang)
    )}.</p>`;
  }

  const fourthParagraph = `<p>Il y a eu ${dynamicValue(
    meta.atRisk
  )} activités d’exploitation et d’entretien pour lesquelles de nouveaux terrains temporaires ou permanents ont été requis et qui se trouvent dans l’habitat essentiel d’une espèce en voie de disparition ou menacée inscrite à l’annexe 1 de la <a href="https://laws-lois.justice.gc.ca/fra/lois/s-15.3/"><i>Loi sur les espèces en péril</i></a> fédérale. Lorsque cela se produit, la société peut être tenue de respecter d’autres obligations réglementaires en plus de celles de la LRCE, comme celles de la <a href="https://laws-lois.justice.gc.ca/fra/lois/m-7.01/"><i>Loi sur la convention concernant les oiseaux migrateurs</i></a> et de la <i>Loi sur les espèces en péril</i>.</p>`;

  document.getElementById("oandm-dynamic-text").innerHTML =
    firstParagraph + secondParagraph + fourthParagraph;
}

export function remediationTextEng(meta, lang) {
  const firstParagraph = `<p>The ${formatCompanyName(
    meta.systemName
  )} has reported a total of ${dynamicValue(
    lang.numberFormat(meta.new + meta.old, 0)
  )} contaminated sites since 2011 when the first Remediation Process Guide was first published. There have been ${dynamicValue(
    meta.new
  )} contaminated sites reported since August 2018, and information about these contaminated sites is featured in the dashboard below.</p>`;

  document.getElementById("remediation-dynamic-text").innerHTML =
    firstParagraph;
}

export function remediationTextFra(meta, lang) {
  const firstParagraph = `<p>Depuis 2011, année où le premier <i>Guide sur le processus d’assainissement a été publié</i>, ${dynamicValue(
    lang.numberFormat(meta.new + meta.old, 0)
  )} sites contaminés ont été signalés sur le ${formatCompanyName(
    meta.systemName
  )}. De plus, ${dynamicValue(
    meta.new
  )} sites contaminés ont été signalés depuis août 2018, et l’information à leur sujet est présentée dans le tableau de bord ci-dessous.</p>`;

  document.getElementById("remediation-dynamic-text").innerHTML =
    firstParagraph;
}

export function uaTextEng(meta, lang) {
  const firstParagraph = `<p>From ${meta.first_year} to ${
    meta.current_year
  }, there have been a total of ${dynamicValue(
    meta.total_events
  )} contraventions reported for the ${
    meta.systemName
  }. Of these, ${dynamicValue(
    meta.ground_disturbance_count
  )} have included a ground disturbance, and ${dynamicValue(
    meta.damage_count
  )} have caused physical damage to the pipeline such as dent or gouge. A ground disturbance contravention happens when someone digs below 30 cm within the pipelines prescribed area without first getting consent from the pipeline company or when not making a locate request. These events can be considered as near-miss events that could have led to a more serious pipeline incident.</p>`;

  const secondParagraph = `<p>The CER reviews all contravention reports submitted by regulated companies, and further action may be required of the company. From ${
    meta.first_year
  } to ${meta.current_year}, ${dynamicValue(
    meta.further_action_required
  )} contraventions have required additional action.</p>`;
  document.getElementById("ua-dynamic-text").innerHTML =
    firstParagraph + secondParagraph;
}

export function uaTextFra(meta, lang) {
  const firstParagraph = `<span></span>`;
  document.getElementById("ua-dynamic-text").innerHTML = firstParagraph;
}
