import { profileAssist as pa } from "../modules/util.js";

export async function mainSettlements(settlementsData) {
  const legendNames = {
    company: {
      name: "Active settlement(s)",
      color: pa.cerPalette["Night Sky"],
    },
  };

  const legendColors = {
    "Active settlement(s)": pa.cerPalette["Night Sky"],
    "Settlements with fixed end date": pa.cerPalette["Ocean"],
    "Settlements without fixed end date": pa.cerPalette["Cool Grey"],
  };

  var today = pa.currentDate();

  const getEndDate = (date) => {
    if (date === null) {
      return [today, pa.cerPalette["Cool Grey"]];
    } else {
      return [date, pa.cerPalette["Ocean"]];
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

  const settlementSeries = (data) => {
    var seriesTracker = {};
    var seriesSettle = [];
    var dates = [];
    data = applyEndDateColors(data);
    data = data.sort(sortByProperty("start"));

    const addRow = (row) => {
      return {
        name: row["Settlement Name"],
        id: row["Settlement Name"],
        parent: row.Company,
        color: row.color,
        start: row["Start Date"],
        end: row.end,
        onClickLink: row.regdocs,
        tollOrder: row["Toll Order"],
      };
    };

    data.map((row) => {
      dates.push(row["Start Date"]);
      dates.push(row["End Date"]);

      if (seriesTracker.hasOwnProperty(row.Company)) {
        //the parent company is already in the series, add the sub settlement
        seriesTracker[row.Company].startDate.push(row["Start Date"]);
        seriesTracker[row.Company].endDate.push(row.end);
        seriesSettle.push(addRow(row));
      } else {
        //A new company is added to the series as the parent, and the current settlement is also added
        seriesTracker[row.Company] = {
          startDate: [row["Start Date"]],
          endDate: [row.end],
        };
        seriesSettle.push(addRow(row));
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
      var currentEnd = companyEndDates[0];
      //this map creates the timeline for each company
      companyEndDates.map((endDate, endNum) => {
        if (endDate > currentEnd) {
          currentEnd = endDate;
        }
        if (companyStartDates[endNum + 1] - endDate > 86400000) {
          companySettles.push({
            name: company,
            collapsed: false,
            color: pa.cerPalette["Night Sky"],
            id: companyId(companyTracker, company),
            start: currentStart,
            end: currentEnd,
          });
          companyTracker = companyCounter(companyTracker, company);
          currentStart = companyStartDates[endNum + 1];
        } else {
          if (endNum == companyEndDates.length - 1) {
            companySettles.push({
              name: company,
              collapsed: false,
              color: pa.cerPalette["Night Sky"],
              id: companyId(companyTracker, company),
              start: currentStart,
              end: currentEnd,
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

  const createSettlements = (seriesData, dates) => {
    return Highcharts.ganttChart("negotiated-settlements", {
      chart: {
        type: "gantt",
        borderWidth: 1,
        plotBackgroundColor: null,
        plotShadow: false,
      },
      credits: {
        text: "",
      },
      title: {
        text: "",
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
            dashStyle: "longDash",
            color: "black",
            label: {
              align: "right",
              x: -5,
              formatter: function () {
                return (
                  Highcharts.dateFormat(
                    pa.dateFormatString,
                    this.options.value
                  ) + " (today, UTC)"
                );
              },
            },
          },
        },
      ],

      yAxis: {
        uniqueNames: true,
        labels: {
          useHTML: true,
          formatter: function () {
            var currentLabel = this.value;
            var labelSeries = this.axis.series[0].data;
            var label = currentLabel;
            labelSeries.map((row) => {
              if (
                row.name == currentLabel &&
                row.hasOwnProperty("onClickLink")
              ) {
                label = `<a href="${row["onClickLink"]}" target="_blank">${currentLabel}</a>`;
              }
            });
            return label;
          },
        },
      },

      annotations: [
        {
          labelOptions: {
            verticalAlign: "center",
            align: "center",
            overflow: "none",
          },
          labels: [
            {
              point: { x: -150, y: -30 },
              style: {
                fontWeight: "bold",
                fontSize: 12,
                color:
                  (Highcharts.theme && Highcharts.theme.textColor) || "grey",
              },
              backgroundColor: "white",
              borderColor: "white",
              text:
                "Click on a settlement name to open<br>original settlement approval (REGDOCS)",
            },
          ],
          draggable: "",
        },
      ],

      tooltip: {
        xDateFormat: pa.dateFormatString,
        backgroundColor: "rgba(255,255,255,1)",
        className: "tooltip-settlements",
        useHTML: true,
        formatter: function () {
          var point = this.point,
            years = 1000 * 60 * 60 * 24 * 365,
            number = (point.x2 - point.x) / years;
          var years = Math.round(number * 100) / 100;
          if (point.tollOrder !== null) {
            var to = `<tr><td>Toll Order:</td><td style="padding:0"><b> ${point.tollOrder}</b>`;
          } else {
            var to = `<tr><td>Toll Order:</td><td style="padding:0"><b></b>`;
          }
          if (this.color == pa.cerPalette["Cool Grey"]) {
            var endText = "No set end date";
          } else {
            var endText = Highcharts.dateFormat(
              pa.dateFormatString,
              this.point.end
            );
          }
          if (this.point.parent == null) {
            return (
              `<b>${
                this.key
              }</b><table> <tr><td> Active settlement(s) start:</td><td style="padding:0"><b> ${Highcharts.dateFormat(
                pa.dateFormatString,
                this.point.start
              )}</b></td></tr>` +
              `<tr><td> Active settlement(s) end:</td><td style="padding:0"><b> ${Highcharts.dateFormat(
                pa.dateFormatString,
                this.point.end
              )}</b></td></tr>` +
              `<tr><td> Active settlement(s) duration:</td><td style="padding:0"><b> ${years} years</b></table>`
            );
          } else {
            return (
              `<b>${this.key}</b><table>` +
              to +
              `<tr><td>Start:</td><td style="padding:0"><b> ${Highcharts.dateFormat(
                pa.dateFormatString,
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
  const buildDashboard = () => {
    try {
      const [seriesData, dates] = settlementSeries(settlementsData);
      var settlementChart = createSettlements(seriesData, dates);
    } catch (err) {
      console.log("Settlements Error");
    }
  };
  return buildDashboard();
}
