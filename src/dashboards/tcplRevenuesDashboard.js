import Highcharts from "highcharts";

function seriesifyQuantity(data) {
  const series = {};
  data.forEach((element) => {
    if (series[element.p]) {
      series[element.p].push({
        x: new Date(element.d),
        y: element.v,
        folderLink: element.f,
        downloadLink: element.l,
      });
    } else {
      series[element.p] = [
        {
          x: new Date(element.d),
          y: element.v,
          folderLink: element.f,
          downloadLink: element.l,
        },
      ];
    }
  });

  return Object.keys(series).map((seriesName) => ({
    name: seriesName,
    yAxis: 0,
    data: series[seriesName],
  }));
}

function seriesifyRevenue(data) {
  const [itSeries, stSeries] = [
    { name: "IT", data: [], yAxis: 1, showInLegend: false, color: "black" },
    { name: "STFT", data: [], yAxis: 1, showInLegend: false, color: "black" },
  ];
  data.forEach((element) => {
    if (element.p === "IT") {
      itSeries.data.push({
        x: new Date(element.d),
        y: element.v,
        downloadLink: element.l,
      });
    } else if (element.p === "STFT") {
      stSeries.data.push({
        x: new Date(element.d),
        y: element.v,
        downloadLink: element.l,
      });
    }
  });
  return [itSeries, stSeries];
}

function toolTipRevenues(event, lang) {
  let toolText = `<b>${lang.dateFormat(event.x)}</b>`;
  toolText += '<table class="mrgn-tp-sm">';
  toolText += `<tr><td>${
    event.series.name
  }:&nbsp;</td><td><b>${lang.numberFormat(event.y, 0)}</b></td></tr>`;
  if (event.y < event.total) {
    toolText += `<tr><td>Total:&nbsp;</td><td><b>${lang.numberFormat(
      event.total,
      0
    )}</b></td></tr>`;
  }

  toolText += "</table>";
  toolText += "<i>Click to view REGDOCS info</i>";
  return toolText;
}

function htmlLink(link, displayText) {
  return `<a href="${link}" target="_blank" rel="noopener noreferrer">${displayText}</a>`;
}

function destroyInsert(chart) {
  if (
    Object.prototype.hasOwnProperty.call(chart, "customTooltip") &&
    chart.customTooltip &&
    Object.keys(chart.customTooltip).length !== 0
  ) {
    chart.customTooltip.destroy();
  }
}

function quantityChart(id, series, lang) {
  return Highcharts.chart(id, {
    chart: {
      type: "column",
    },
    title: {
      text: "",
    },
    xAxis: { type: "datetime" },
    legend: {
      // enabled: false, // set for small screens
      align: "left",
      verticalAlign: "middle",
      width: 250,
    },
    yAxis: [
      {
        title: { text: "Gigajoules per month" },
        height: "45%",
      },
      {
        title: { text: "Revenue ($000s)" },
        top: "50%",
        height: "45%",
        offset: 0,
      },
    ],
    plotOptions: {
      column: {
        stacking: "normal",
      },
      series: {
        point: {
          events: {
            click(e) {
              let text = `<b>${lang.dateFormat(e.point.options.x)} - ${
                e.point.series.name
              }</b><br>`;
              if (e.point.folderLink) {
                text += htmlLink(e.point.folderLink, "REGDOCS Folder Link");
                text += "<br>";
              }
              if (e.point.downloadLink) {
                text += htmlLink(e.point.downloadLink, "REGDOCS Download Link");
              }
              const { chart } = this.series;
              destroyInsert(chart);
              const label = chart.renderer
                .label(text, null, null, null, null, null, true)
                .css({
                  width: Math.floor(chart.chartWidth / 4) + 40,
                })
                .attr({
                  "stroke-width": 3,
                  zIndex: 8,
                  padding: 8,
                  r: 3,
                  fill: "white",
                  stroke: this.color,
                })
                .add(chart.rGroup);
              chart.customTooltip = label;
              label.align(
                Highcharts.extend(label.getBBox(), {
                  align: "right",
                  x: 0, // offset
                  verticalAlign: "top",
                  y: 0, // offset
                }),
                null,
                "spacingBox"
              );
            },
          },
        },
      },
    },
    tooltip: {
      shadow: false,
      useHTML: true,
      animation: true,
      formatter() {
        return toolTipRevenues(this, lang);
      },
    },
    series,
  });
}

function removeAllSeries(chart) {
  while (chart.series.length) {
    chart.series[0].remove(false, false, false);
  }
}

function switchChartListener(chart, itSeries, stSeries) {
  document
    .getElementById("tcpl-revenues-split-btn")
    .addEventListener("click", (event) => {
      if (event.target) {
        destroyInsert(chart);
        removeAllSeries(chart);
        if (event.target.value === "IT") {
          itSeries.forEach((newS) => {
            chart.addSeries(newS, false, false);
          });
        } else if (event.target.value === "STFT") {
          stSeries.forEach((newS) => {
            chart.addSeries(newS, false, false);
          });
        }
        chart.redraw(true);
      }
    });
}

export async function mainTcplRevenues(data, lang) {
  const itSeries = seriesifyQuantity(data.itQuantity);
  const stSeries = seriesifyQuantity(data.stQuantity);
  const [itRevenueSeries, stRevenueSeries] = seriesifyRevenue(data.discRevenue);
  itSeries.push(itRevenueSeries);
  stSeries.push(stRevenueSeries);
  const chart = quantityChart("tcpl-revenues-chart", itSeries, lang);
  switchChartListener(chart, itSeries, stSeries);
}
