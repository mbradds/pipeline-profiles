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

import { listOrParagraph } from "./util";

const dynamicValue = (val) =>
  `<i class="bg-primary" style="font-style: normal"><strong>&nbsp;${val}&nbsp;</strong></i>`;

const postWord = (val, type) => {
  let wrd = "";
  if (type === "have") {
    if (val === 1) {
      wrd = "has";
    } else {
      wrd = "have";
    }
  } else if (type === "fatality") {
    if (val === 1) {
      wrd = "fatality";
    } else {
      wrd = "fatalities";
    }
  }
  return wrd;
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

const quartersEn = { 12: "Q4", 9: "Q3", 6: "Q2", 3: "Q1" };
const quartersFr = { 12: "T4", 9: "T3", 6: "T2", 3: "T1" };

const trendSub = (commodity, lang) => {
  let subText = "";
  if (commodity === "gas") {
    subText = lang === "en" ? "year over year" : "d’une année à l’autre,";
  } else if (commodity === "oil") {
    subText =
      lang === "en" ? "quarter over quarter" : "d’un trimestre à l’autre";
  }
  return subText;
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
      const qtr = `${quartersEn[tt.toDate[1]]} ${tt.toDate[0]}`;
      return `<p>Throughputs in ${qtr} are ${changeText(
        pctChange,
        lang,
        false
      )} the five-year average.</p>`;
    }
    const qtr = `${quartersFr[tt.toDate[1]]} de ${tt.toDate[0]}`;
    return `<p>Les débits au ${qtr} sont ${changeText(
      pctChange,
      lang,
      false
    )} de la moyenne sur cinq ans.</p>`;
  }

  return "";
};

export const incidentsTextEng = (id, meta) => {
  const paragraph = document.getElementById(id);
  let paragraphText = `<p>`;
  // total incidents.
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
    meta.seriousEvents.Fatality
  )} ${postWord(
    meta.seriousEvents.Fatality,
    "fatality"
  )} related to incident events. Open the dropdown below to view the definitions of these incident types.`;
  paragraphText += `</p>`;
  paragraph.innerHTML = paragraphText;
};

export const incidentsTextFra = (id, meta) => {
  const paragraph = document.getElementById(id);
  let paragraphText = `<p>`;
  // total incidents.
  paragraphText += `Un total de ${dynamicValue(
    meta.release + meta.nonRelease
  )} incidents ont été signalés à l’égard du réseau de ${
    meta.systemName
  } depuis 2008. De ces incidents, ${dynamicValue(
    meta.release
  )} ont entraîné le rejet d’un certain volume de produit. Le ${dynamicValue(
    meta.mostCommonSubstance
  )} est la substance la plus couramment rejetée. Le tableau de bord ci-dessous renferme de plus amples renseignements sur ces incidents.`;
  paragraphText += `</p>`;

  // most common reasons
  paragraphText += `<p>Dans le cadre de l’examen des incidents, la Régie classe ceux-ci en fonction des circonstances directement \
  liées à leur origine (ce qui s’est produit) et de leurs causes sous-jacentes (pourquoi cela s’est produit). \
  Sur ce réseau pipelinier, ce qui s’est produit le plus souvent, ce sont des ${dynamicValue(
    meta.mostCommonWhat
  )} et la question de ${dynamicValue(meta.mostCommonWhy)}`;
  paragraphText += ` qui expliquent le plus souvent pourquoi cela s’est produit. Jetez un coup d’œil à la section sur les tendances des incidents du tableau de bord ci-dessous pour obtenir des définitions et une explication de ce qui se produit et pourquoi.</p>`;

  // other important non-release incident types
  paragraphText += `<p>`;
  paragraphText += `Le tableau de bord ci-dessous ne montre que les incidents qui ont entraîné un déversement de produit à partir du pipeline,\
   mais il y a d’autres types d’incidents importants qui peuvent ne pas y figurer. \
   Parmi les incidents signalés pour le ${meta.systemName}, ${dynamicValue(
    meta.seriousEvents["Adverse Environmental Effects"]
  )} ont entraîné des effets environnementaux négatifs.\
  Il y a eu ${dynamicValue(
    meta.seriousEvents["Serious Injury (CER or TSB)"]
  )} cas de blessures graves et ${dynamicValue(
    meta.seriousEvents.Fatality
  )} décès liés à des incidents. Cliquez sur le menu déroulant ci-dessous pour voir les définitions de ces types d’incidents.`;
  paragraphText += `</p>`;
  paragraph.innerHTML = paragraphText;
};

export function trafficTrendTextEng(params, numberFormat, seriesId) {
  const buildText = (trend, point, units) => {
    let trendId = "";
    if (trend.name !== "default") {
      trendId = ` (${seriesId[trend.name]})`;
    }
    const trendText = `Throughputs at the ${dynamicValue(
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
    return trendText;
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
    const pointNames = {};
    params.points.forEach((p) => {
      pointNames[p.id] = p.name;
    });

    const pointText = [];
    Object.keys(params.trendText).forEach((point) => {
      const thisTrend = params.trendText[point];
      if (point in pointNames) {
        pointText.push({
          textCol: buildText(
            thisTrend[0],
            pointNames[point],
            params.unitsHolder
          ),
        });
      }
    });
    trendText = listOrParagraph(pointText, "textCol");
  }
  document.getElementById("traffic-trends").innerHTML = trendText;
}

export function trafficTrendTextFra(params, numberFormat, seriesId) {
  const buildText = (trend, point, units) => {
    let trendId = "";
    if (trend.name !== "default") {
      trendId = ` (${seriesId[trend.name]})`;
    }
    const trendText = `Les débits au point principal ${dynamicValue(
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
    return trendText;
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
    const pointNames = {};
    params.points.forEach((p) => {
      pointNames[p.id] = p.name;
    });

    const pointText = [];
    Object.keys(params.trendText).forEach((point) => {
      const thisTrend = params.trendText[point];
      if (point in pointNames) {
        pointText.push({
          textCol: buildText(
            thisTrend[0],
            pointNames[point],
            params.unitsHolder
          ),
        });
      }
    });
    trendText = listOrParagraph(pointText, "textCol");
  }
  document.getElementById("traffic-trends").innerHTML = trendText;
}

export function oandmText(meta, lang) {
  const firstParagraph = `<p>Since 2015, there have been a total of ${dynamicValue(
    lang.numberFormat(meta.totalEvents, 0)
  )} O&M activities reported by ${
    meta.company
  }. When the activity involves an integrity dig, the activity may entail exposing an area of the pipeline by performing one or more integrity assessments. There have been ${dynamicValue(
    lang.numberFormat(meta.totalDigs, 0)
  )} individual integrity digs as part of the reported O&M activities.<p>`;

  let secondParagraph = "";
  if (meta.nearby) {
    secondParagraph = `<p>These O&M activities can occur anywhere along or near the pipeline right of way, including near populated areas. In the past year (${
      meta.nearbyYear
    }), O&M activities have occurred most often near ${dynamicValue(
      meta.nearby.join(", ")
    )} among others.</p>`;
  }

  let thirdParagraph = `<p>To accommodate the worksite and equipment, O&M activities may require the acquisition of additional new permanent or temporary land outside company property. To date, activities reported to the CER for this system have required a total of ${dynamicValue(
    `${meta.landRequired} hectares`
  )}`;
  const iceRinks = ` of new land, an area equal to ${dynamicValue(
    meta.iceRinks
  )} ice hockey rinks.<p>`;
  if (meta.landRequired > 0) {
    thirdParagraph += iceRinks;
  } else {
    thirdParagraph += `.`;
  }

  const fourthParagraph = `<p>There have been ${dynamicValue(
    meta.atRisk
  )} O&M activities for which new temporary or permanent land is required and is located within critical habitat for any Endangered or Threatened species listed on Schedule 1 of the federal <i>Species at Risk Act</i>. When this happens, the company may be required to meet additional regulatory obligations outside of the <i>CER Act</i>, such as the <i>Migratory Birds Convention Act</i> and the <i>Species at Risk Act</i>.</p>`;

  const totalText =
    firstParagraph + secondParagraph + thirdParagraph + fourthParagraph;
  document.getElementById("oandm-dynamic-text").innerHTML = totalText;
}

export function remediationText(meta, lang) {
  const firstParagraph = `<p>${
    meta.company
  } has reported a total of ${dynamicValue(
    lang.numberFormat(meta.new + meta.old, 0)
  )} contaminated sites since 2011 when the first Remediation Process Guide was first published. There have been ${dynamicValue(
    meta.new
  )} contaminated sites reported since August 2018, and information about these contaminated sites is featured in the dashboard below.</p>`;

  let secondParagraph = `<p>Where applicable, an estimate of the contaminated soil volume is reported to the CER. Since August 2018, ${dynamicValue(
    lang.numberFormat(meta.soil.total, 0)
  )} cubic metres of soil have been contaminated`;

  if (meta.soil.total > 0 && meta.soil.pools > 0) {
    secondParagraph += `, a volume equivalent to approximately ${dynamicValue(
      `${meta.soil.pools} Olympic-sized swimming pools`
    )}.</p>`;
  } else {
    secondParagraph += `.</p>`;
  }

  const totalText = firstParagraph + secondParagraph;
  document.getElementById("remediation-dynamic-text").innerHTML = totalText;
}
