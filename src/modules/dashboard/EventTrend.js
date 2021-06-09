/**
 * @file Contains class definition for a simple highcharts bar chart meant to show the frequency of events over time.
 *
 * When paired with an EventNavigator, the chart can update its series, and display custom text below the chart on either
 * a bar series click, or EventNavigator pill click.
 *
 * The stacked bar chart "smartly" arranges its axis by automatically filling in gaps between non consecutive years, and
 * adding empty bars between the last year of data, and the current client year.
 *
 * Functionality for disclaimers, language switching, and automated axis titles is built in.
 *
 * TODO:
 * - look into destructuring some of the "lang" options into their own configuration objects like the "legendClickText"
 *   parameter. This will make this class more general purpose and improve usability/self documentation.
 */

import { visibility, rangeInclusive } from "../util";

/**
 * Class responsible for configuring a highcharts stacked bar displaying event trends over time (yearly).
 * Contains fieldChange and updateRadius methods similiar to EventMap methods and plotHeight parameter for
 * EventNavigator polymorphism pattern.
 */
export class EventTrend {
  /**
   * Generare a highcharts stacked bar showing frequency of events by year.
   * @param {Object} constr - EventTrend constructor
   * @param {string} constr.eventType - Short name for the dataset, eg: incidents (lowercase).
   * @param {string} constr.field - The initial data column to have selected by default.
   * @param {string} constr.filters - Initial data "values" to show eg: {type: "frequency"} or {type: "volume" }
   * @param {(Object[]|Object)} constr.data - Dataset to be shaped into highcharts series.
   * @param {string} constr.divId - HTML div id where highchart will be loaded.
   * @param {Object} constr.lang - Object containing language switching functionality for dashboard components.
   * @param {Object} [const.legendClickText={enabled: false, text: undefined}] - Configuration for a disclaimer above the chart legend explaining the legend click functionality.
   * @param {Object} [const.oneToMany={}] - Enabled pill id's ({pillId: true}) contain double counting, and a disclaimer above the bars will explain the higher bar totals.
   * @param {string} [constr.seriesed=false] - Whether the "data" has already been shaped into a series structure of {pill name: {data:[], year:[]} }
   * @param {string} [constr.definitionsOn="bar"] - Defines what click action will display text below the chart. When "bar", the user must click on a bar series to view the definition. When "pill" the user must click different pills to change the text.
   * @param {Object} [constr.seriesInfo={}] - When "seriesed" this must contain info about the series names, colors, etc. {pillName: {id: {c: color, n: name}}}
   * @param {Object} [constr.definitions={}] - Object containing {id: text} pairs for language switching the definitions (definitionsOn="bar") or column descriptions (definitionsOn="pill").
   */
  constructor({
    eventType,
    field,
    filters,
    data,
    divId,
    lang,
    legendClickText = { enabled: false, text: undefined },
    oneToMany = {},
    seriesed = false,
    definitionsOn = "bar", // show text on bar click, or pill click
    seriesInfo = {},
    definitions = {},
  }) {
    this.eventType = eventType;
    this.field = field;
    this.filters = filters;
    this.data = data;
    this.divId = divId;
    this.lang = lang;
    this.legendClickText = legendClickText;
    this.oneToMany = oneToMany;
    this.seriesed = seriesed;
    this.seriesInfo = seriesInfo;
    this.colors = lang.seriesInfo;
    this.definitions = definitions;
    this.definitionsOn = definitionsOn;
    this.definitionDiv = `trend-definitions-${eventType}`;
    this.hasDefinition = this.displayDefinitions();
    this.createChart();
  }

  static dummyYears(yearList, dataFormat = "object") {
    let uniqueYears = yearList;
    const currentYear = new Date().getFullYear();
    const maxYear = uniqueYears.slice(-1)[0];
    let lastYears = [];
    if (currentYear > maxYear) {
      lastYears = rangeInclusive(maxYear + 1, currentYear);
    }

    uniqueYears = uniqueYears.concat(lastYears);
    const dummySeries = { name: "dummy", showInLegend: false }; // makes sure that the x axis is in order
    const dummyData = [];

    const addMethod = () => {
      if (dataFormat === "object") {
        return (year) => ({ name: year.toString(), y: undefined });
      }
      return (year) => [year, undefined];
    };

    const adder = addMethod();
    uniqueYears.forEach((y, index) => {
      if (
        y + 1 !== uniqueYears[index + 1] &&
        index !== uniqueYears.length - 1
      ) {
        const firstYear = y;
        const lastYear = uniqueYears[index + 1] - 1;
        for (let i = firstYear; i <= lastYear; i += 1) {
          dummyData.push(adder(i));
        }
      } else {
        dummyData.push(adder(y));
      }
    });
    dummySeries.data = dummyData;
    return dummySeries;
  }

  generateSeries(data, field) {
    if (!this.seriesed) {
      return this.processEventsData(data, field);
    }
    const xvalues = data[field].year;
    let currentInfo = {};
    if (Object.prototype.hasOwnProperty.call(this.seriesInfo, this.field)) {
      currentInfo = this.seriesInfo[this.field];
    }

    const preparedSeries = data[field].data.map((s) => {
      const newSeries = {};
      newSeries.data = s.data.map((row, i) => [xvalues[i], row]);
      if (Object.prototype.hasOwnProperty.call(currentInfo, s.id)) {
        newSeries.name = currentInfo[s.id].n;
        newSeries.color = currentInfo[s.id].c;
      } else {
        newSeries.name = s.id;
      }
      newSeries.id = s.id;
      return newSeries;
    });

    const dummySeries = EventTrend.dummyYears(data[field].year, "list");
    preparedSeries.push(dummySeries);
    return preparedSeries;
  }

  applyColor(rowValue, field) {
    try {
      return this.colors[field][rowValue].c;
    } catch (err) {
      return undefined;
    }
  }

  processEventsData(data, field) {
    const yField = (multipleValues) => {
      if (!multipleValues) {
        return function (events) {
          const series = {};
          const uniqueYears = new Set();
          events.forEach((row) => {
            uniqueYears.add(row.y);
            if (Object.prototype.hasOwnProperty.call(series, row[field])) {
              if (
                Object.prototype.hasOwnProperty.call(series[row[field]], row.y)
              ) {
                series[row[field]][row.y] += 1;
              } else {
                series[row[field]][row.y] = 1;
              }
            } else {
              series[row[field]] = { [row.y]: 1 };
            }
          });
          return [series, Array.from(uniqueYears)];
        };
      }
      return function (events) {
        const series = {};
        const uniqueYears = new Set();
        events.forEach((row) => {
          let itemList;
          uniqueYears.add(row.y);
          if (row[field].length > 1) {
            itemList = row[field];
            itemList = itemList.map((value) => value.trim());
          } else {
            itemList = [row[field]];
          }
          itemList.forEach((yVal) => {
            if (Object.prototype.hasOwnProperty.call(series, yVal)) {
              if (Object.prototype.hasOwnProperty.call(series[yVal], row.y)) {
                series[yVal][row.y] += 1;
              } else {
                series[yVal][row.y] = 1;
              }
            } else {
              series[yVal] = { [row.y]: 1 };
            }
          });
        });
        return [series, Array.from(uniqueYears)];
      };
    };

    const seriesCounter = yField(this.oneToMany[field]);
    const [series, uniqueYears] = seriesCounter(data);

    const dummySeries = EventTrend.dummyYears(uniqueYears, "object");
    const seriesList = [];
    seriesList.push(dummySeries);
    Object.keys(series).forEach((seriesId) => {
      const seriesData = series[seriesId];
      const hcData = [];
      Object.keys(seriesData).forEach((xVal) => {
        const yVal = seriesData[xVal];
        hcData.push({ name: xVal, y: yVal });
      });
      seriesList.push({
        name: this.colors[field][seriesId].n,
        id: seriesId,
        data: hcData,
        color: this.applyColor(seriesId, field),
      });
    });
    return seriesList;
  }

  yAxisTitle() {
    if (this.filters.type === "frequency") {
      return `${this.lang.trendYTitle}`;
    }
    return "";
  }

  pillNameSubstitution() {
    if (
      Object.prototype.hasOwnProperty.call(
        this.lang.pillTitles.titles,
        this.field
      )
    ) {
      return this.lang.pillTitles.titles[this.field];
    }
    return this.field;
  }

  oneToManyDisclaimer() {
    const destoryLabel = (chart) => {
      if (chart.customLabel) {
        chart.customLabel.destroy();
      }
    };
    if (this.oneToMany[this.field]) {
      destoryLabel(this.chart);
      this.chart.customLabel = undefined;

      const text = `<p class="alert alert-warning" style="padding:4px">${this.lang.countDisclaimer(
        this.eventType,
        this.pillNameSubstitution()
      )}</p>`;
      const label = this.chart.renderer
        .label(text, null, null, null, null, null, true)
        .attr({
          padding: 0,
        })
        .css({
          "max-width": "700px",
          margin: 0,
        })
        .add(this.chart.rGroup);

      label.align(
        Highcharts.extend(label.getBBox(), {
          align: "left",
          x: 50, // offset
          verticalAlign: "top",
          y: -27, // offset
        }),
        null,
        "spacingBox"
      );
      this.chart.customLabel = label;
    } else {
      destoryLabel(this.chart);
      this.chart.customLabel = undefined;
    }
  }

  displayDefinitions() {
    try {
      const definitionsPopUp = document.getElementById(this.definitionDiv);
      if (Object.prototype.hasOwnProperty.call(this.definitions, this.field)) {
        visibility([this.definitionDiv], "show");
        // when on incidents, show text on bar click. When on oandm, show text on pill click
        if (this.definitionsOn === "bar") {
          // user click on highcharts bar for definition to appear
          definitionsPopUp.innerHTML = this.lang.barClick(
            this.pillNameSubstitution()
          );
        } else if (this.definitionsOn === "pill") {
          // user clicks on pill to view info about that pill in definitions box
          definitionsPopUp.innerHTML = `<small>${
            this.definitions[this.field]
          }</small>`;
        }
        return true;
      }
      visibility([this.definitionDiv], "hide");
      return false;
    } catch (err) {
      console.warn(
        `div ${this.definitionDiv} does not exist to display definition text`
      );
      return false;
    }
  }

  createChart() {
    const currentTrend = this;
    const chart = new Highcharts.chart(this.divId, {
      chart: {
        type: "column",
        animation: false,
        spacingTop: 25,
      },

      xAxis: {
        categories: true,
      },

      legend: {
        title: {
          text: currentTrend.legendClickText.enabled
            ? currentTrend.legendClickText.text
            : undefined,
        },
        margin: 0,
        maxHeight: 120,
      },

      yAxis: {
        title: {
          text: currentTrend.yAxisTitle(),
        },
        stackLabels: {
          enabled: true,
        },
      },

      plotOptions: {
        series: {
          animation: false,
          events: {
            click() {
              if (
                currentTrend.definitionsOn === "bar" &&
                currentTrend.hasDefintion
              ) {
                const definitionsPopUp = document.getElementById(
                  currentTrend.definitionDiv
                );
                const keyColor =
                  currentTrend.colors[currentTrend.field][this.options.id].c;

                const key = `<strong style="color:${keyColor}">${this.name}:</strong>&nbsp;`;
                definitionsPopUp.innerHTML = `<small>${key} ${
                  currentTrend.definitions[currentTrend.field][this.options.id]
                }</small>`;
              }
            },
          },
        },
      },
      series: this.generateSeries(this.data, this.field),
    });
    this.chart = chart;
    this.plotHeight = chart.chartHeight;
  }

  fieldChange(newField) {
    if (newField !== this.field) {
      this.field = newField;
      const newSeries = this.generateSeries(this.data, this.field);
      while (this.chart.series.length) {
        this.chart.series[0].remove();
      }
      newSeries.forEach((series) => {
        this.chart.addSeries(series, false);
      });
      this.oneToManyDisclaimer();
      this.hasDefintion = this.displayDefinitions();
      this.chart.redraw();
    }
  }

  updateRadius() {
    const newSeries = this.generateSeries(this.data, this.field);
    const currentTrend = this;
    this.chart.update({
      series: newSeries,
      yAxis: {
        title: {
          text: currentTrend.yAxisTitle(),
        },
      },
    });
  }
}
