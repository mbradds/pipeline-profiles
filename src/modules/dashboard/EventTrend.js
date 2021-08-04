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

import Highcharts from "highcharts";
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

    const lastYears =
      currentYear > maxYear ? rangeInclusive(maxYear + 1, currentYear) : [];

    uniqueYears = uniqueYears.concat(lastYears);
    const dummySeries = { name: "dummy", showInLegend: false }; // makes sure that the x axis is in order

    const addMethod = () => {
      if (dataFormat === "object") {
        return (year) => ({ name: year.toString(), y: undefined });
      }
      return (year) => [year, undefined];
    };

    const adder = addMethod();
    dummySeries.data = uniqueYears.map((y, index) => {
      if (
        y + 1 !== uniqueYears[index + 1] &&
        index !== uniqueYears.length - 1
      ) {
        const lastYear = uniqueYears[index + 1] - 1;
        for (let i = y; i <= lastYear; i += 1) {
          return adder(i);
        }
      }
      return adder(y);
    });
    return dummySeries;
  }

  generateSeries(data, field) {
    if (!this.seriesed) {
      return this.processEventsData(data, field);
    }
    let currentInfo = {};
    if (Object.prototype.hasOwnProperty.call(this.seriesInfo, this.field)) {
      currentInfo = this.seriesInfo[this.field];
    }

    const preparedSeries = data[field].data.map((s) => {
      const newSeries = {};
      newSeries.data = s.data.map((row, i) => [data[field].year[i], row]);
      if (Object.prototype.hasOwnProperty.call(currentInfo, s.id)) {
        newSeries.name = currentInfo[s.id].n;
        newSeries.color = currentInfo[s.id].c;
      } else {
        newSeries.name = s.id;
      }
      newSeries.id = s.id;
      return newSeries;
    });

    preparedSeries.push(EventTrend.dummyYears(data[field].year, "list"));
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
      const uniqueYears = new Set();
      const series = {};
      if (!multipleValues) {
        return function (events) {
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
        events.forEach((row) => {
          let itemList;
          uniqueYears.add(row.y);
          if (!row[field]) {
            itemList = ["Not Provided"];
          } else if (row[field].length > 1) {
            itemList = row[field].map((value) => value.trim());
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
    const seriesList = [];

    seriesList.push(EventTrend.dummyYears(uniqueYears, "object"));
    Object.keys(series).forEach((seriesId) => {
      const seriesData = series[seriesId];
      const hcData = [];
      Object.keys(seriesData).forEach((xVal) => {
        const yVal = seriesData[xVal];
        hcData.push({ name: xVal, y: yVal });
      });

      seriesList.push({
        name: Object.prototype.hasOwnProperty.call(this.colors, field)
          ? this.colors[field][seriesId].n
          : seriesId,
        id: seriesId,
        data: hcData,
        color: this.applyColor(seriesId, field),
      });
    });
    return seriesList;
  }

  yAxisTitle() {
    return this.filters.type === "frequency" ? this.lang.trendYTitle : "";
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
    if (this.oneToMany[this.field]) {
      this.chart.update({
        title: {
          text: `<div class="alert alert-warning count-disclaimer"><p>${this.lang.countDisclaimer(
            this.lang.countDisclaimerEvent,
            this.pillNameSubstitution()
          )}</p></div>`,
          useHTML: true,
          widthAdjust: 0,
          align: "left",
          margin: 0,
          style: {
            fontSize: "14px",
            fontWeight: "normal",
          },
        },
      });
    } else {
      this.chart.update({
        title: {
          text: "",
          widthAdjust: 0,
        },
      });
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
        spacingTop: 7,
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
                const keyColor =
                  currentTrend.colors[currentTrend.field][this.options.id].c;

                const key = `<strong style="color:${keyColor}">${this.name}:</strong>&nbsp;`;
                document.getElementById(
                  currentTrend.definitionDiv
                ).innerHTML = `<small>${key} ${
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
    this.plotHeight = chart.chartHeight - 15; // subtract 15 px for better looking spacing
  }

  fieldChange(newField) {
    if (newField !== this.field) {
      this.field = newField;
      while (this.chart.series.length) {
        this.chart.series[0].remove();
      }
      this.generateSeries(this.data, this.field).forEach((series) => {
        this.chart.addSeries(series, false);
      });
      this.oneToManyDisclaimer();
      this.hasDefintion = this.displayDefinitions();
      this.chart.redraw();
    }
  }

  updateRadius() {
    const currentTrend = this;
    this.chart.update({
      series: currentTrend.generateSeries(
        currentTrend.data,
        currentTrend.field
      ),
      yAxis: {
        title: {
          text: currentTrend.yAxisTitle(),
        },
      },
    });
  }
}
