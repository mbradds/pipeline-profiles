import { cerPalette, creditsClick } from "../../modules/util.js";
import settlementsData from "./settlements.json";

export const cassandraSettlements = () => {
  const dateFormat = "%b %d, %Y";
  const legendNames = {
    company: {
      name: "Active settlement(s)",
      color: cerPalette["Night Sky"],
    },
  };

  const legendColors = {
    "Active settlement(s)": cerPalette["Night Sky"],
    "Settlements with fixed end date": cerPalette["Ocean"],
    "Settlements without fixed end date": cerPalette["Cool Grey"],
  };

  const filters = { Commodity: "All" };

  const setTitle = (figure_title, filters) => {
    if (filters.Commodity == "All") {
      figure_title.innerText = "Figure 17: Negotiated Settlement Timelines";
    } else {
      figure_title.innerText = `Figure 17: Negotiated Settlement Timelines - ${filters.Commodity} Companies`;
    }
  };

  const currentDate = () => {
    var today = new Date();
    today.setUTCHours(0);
    today.setUTCMinutes(0);
    today.setUTCSeconds(0);
    today.setUTCMilliseconds(0);
    return today.getTime();
  };

  var today = currentDate();

  const getEndDate = (date) => {
    if (date === null) {
      return [today, cerPalette["Cool Grey"]];
    } else {
      return [date, cerPalette["Ocean"]];
    }
  };

  function sortByProperty(property) {
    return function (a, b) {
      if (a[property] > b[property]) return 1;
      else if (a[property] < b[property]) return -1;

      return 0;
    };
  }

  const applyEndDateColors = (data) => {
    return data.map((row) => {
      var [endDate, seriesColor] = getEndDate(row["End Date"]);
      row.color = seriesColor;
      row.end = endDate;
      return row;
    });
  };

  const settlementSeries = (data, filters) => {
    var seriesTracker = {};
    var seriesSettle = [];
    var dates = [];

    if (filters.Commodity !== "All") {
      data = data.filter((row) => row.Commodity == filters.Commodity);
    }

    data = applyEndDateColors(data);
    data = data.sort(sortByProperty("end"));

    data.map((row) => {
      dates.push(row["Start Date"]);
      dates.push(row["End Date"]);

      if (seriesTracker.hasOwnProperty(row.Company)) {
        //the parent company is already in the series, add the sub settlement
        seriesTracker[row.Company].startDate.push(row["Start Date"]);
        seriesTracker[row.Company].endDate.push(row.end);
        seriesSettle.push({
          name: row["Settlement Name"],
          id: row["Settlement Name"],
          parent: row.Company,
          color: row.color,
          start: row["Start Date"],
          end: row.end,
        });
      } else {
        //A new company is added to the series as the parent, and the current settlement is also added
        seriesTracker[row.Company] = {
          startDate: [row["Start Date"]],
          endDate: [row.end],
        };
        seriesSettle.push({
          name: row["Settlement Name"],
          id: row["Settlement Name"],
          parent: row.Company,
          color: row.color,
          start: row["Start Date"],
          end: row.end,
        });
      }
    });

    const companySettles = [];

    const companyCounter = (companyTracker, company) => {
      if (companyTracker.hasOwnProperty(company)) {
        companyTracker[company]++;
      } else {
        companyTracker[company] = 1;
      }
      return companyTracker;
    };

    const companyId = (companyTracker, company) => {
      if (companyTracker.hasOwnProperty(company)) {
        return company + "_" + companyTracker[company];
      } else {
        return company;
      }
    };

    var companyTracker = {}; //checks if a company has already been added so that the ID can be changed for other bars
    for (const company in seriesTracker) {
      var companyStartDates = seriesTracker[company].startDate;
      var companyEndDates = seriesTracker[company].endDate;
      var currentStart = companyStartDates[0];
      companyEndDates.map((endDate, endNum) => {
        if (companyStartDates[endNum + 1] - endDate > 86400000) {
          companySettles.push({
            name: company,
            collapsed: true,
            color: cerPalette["Night Sky"],
            id: companyId(companyTracker, company),
            start: currentStart,
            end: companyEndDates[endNum],
          });
          companyTracker = companyCounter(companyTracker, company);
          currentStart = companyStartDates[endNum + 1];
        } else {
          if (endNum == companyEndDates.length - 1) {
            companySettles.push({
              name: company,
              collapsed: true,
              color: cerPalette["Night Sky"],
              id: companyId(companyTracker, company),
              start: currentStart,
              end: companyEndDates[endNum],
            });
            companyTracker = companyCounter(companyTracker, company);
          }
        }
      });
    }

    dates = dates.filter((row) => row !== null);
    companySettles.sort(sortByProperty("start"));
    return [[...seriesSettle, ...companySettles], dates];
  };

  const [seriesData, dates] = settlementSeries(settlementsData, filters);

  const createSettlements = (seriesData) => {
    return Highcharts.ganttChart("container_settlements", {
      chart: {
        type: "gantt",
        borderWidth: 1,
        events: {
          load: function () {
            creditsClick(this, "https://www.cer-rec.gc.ca/en/index.html");
          },
        },
      },
      credits: {
        text: "Source: CER",
      },
      plotOptions: {
        series: {
          states: {
            hover: {
              enabled: false,
            },
          },
          events: {
            legendItemClick: function (e) {
              e.preventDefault();
            },
          },
        },
      },
      legend: {
        enabled: true,
        symbolPadding: 0,
        symbolWidth: 0,
        symbolHeight: 0,
        squareSymbol: false,
        useHTML: true,
        title: {
          text:
            "Legend: (Click on a company name above to view all negotiated settlements)",
          style: {
            fontStyle: "italic",
          },
        },
        labelFormatter: function () {
          var legendText = "";
          for (const legendName in legendColors) {
            legendText += `<span style="font-weight:bold; color: ${legendColors[legendName]}">&#9679 ${legendName} &nbsp &nbsp &nbsp </span>`;
          }
          return legendText;
        },
      },
      xAxis: [
        {
          min: Math.min(...dates),
          max: Math.max(...dates),
          currentDateIndicator: {
            width: 2,
            zIndex: 2,
            color: "black",
            label: {
              formatter: function () {
                return (
                  Highcharts.dateFormat(dateFormat, this.options.value) +
                  " (today)"
                );
              },
            },
          },
        },
      ],

      yAxis: {
        uniqueNames: true,
        labels: {
          formatter: function () {
            return this.value;
          },
        },
      },

      tooltip: {
        xDateFormat: "%Y-%m-%d",
        formatter: function () {
          var point = this.point,
            years = 1000 * 60 * 60 * 24 * 365,
            number = (point.x2 - point.x) / years;
          var years = Math.round(number * 100) / 100;

          if (this.color == cerPalette["Cool Grey"]) {
            var endText = "No set end date";
          } else {
            var endText = Highcharts.dateFormat(dateFormat, this.point.end);
          }
          if (this.point.parent == null) {
            return (
              `<b>${
                this.key
              }</b><table> <tr><td> Active settlement(s) start:</td><td style="padding:0"><b> ${Highcharts.dateFormat(
                dateFormat,
                this.point.start
              )}</b></td></tr>` +
              `<tr><td> Active settlement(s) end:</td><td style="padding:0"><b> ${Highcharts.dateFormat(
                dateFormat,
                this.point.end
              )}</b></td></tr>` +
              `<tr><td> Active settlement(s) duration:</td><td style="padding:0"><b> ${years} years</b></table>`
            );
          } else {
            return (
              `<b>${this.point.parent} - ${this.key} </b><table>` +
              `<tr><td>Start:</td><td style="padding:0"><b> ${Highcharts.dateFormat(
                dateFormat,
                this.point.start
              )}</b>` +
              `<tr><td>End:</td><td style="padding:0"><b> ${endText}</b>` +
              `<tr><td>Duration:</td><td style="padding:0"><b> ${years} years</b>`
            );
          }
        },
      },
      series: [
        {
          name: legendNames["company"].name,
          data: seriesData,
          color: legendNames["company"].color,
        },
      ],
    });
  };
  const mainSettlements = () => {
    var figure_title = document.getElementById("settle_title");
    setTitle(figure_title, filters);
    var settlementChart = createSettlements(seriesData);
    var selectSettle = document.getElementById("select_commodity_settle");
    selectSettle.addEventListener("change", (selectSettle) => {
      filters.Commodity = selectSettle.target.value;
      setTitle(figure_title, filters);
      const [seriesData, dates] = settlementSeries(settlementsData, filters);
      settlementChart = createSettlements(seriesData);
    });
  };
  mainSettlements();
};
