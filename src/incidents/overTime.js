export const createTimeSeries = (data) => {
  const createEventSeries = (data, field) => {
    let series = {};
    data.map((row) => {
      if (series.hasOwnProperty(row[field])) {
        if (series[row[field]].hasOwnProperty(row.Year)) {
          series[row[field]][row.Year]++;
        } else {
          series[row[field]][row.Year] = 1;
        }
      } else {
        series[row[field]] = { [row.Year]: 1 };
      }
    });

    let seriesList = [];
    for (const [seriesName, seriesData] of Object.entries(series)) {
      let hcData = [];
      for (const [xVal, yVal] of Object.entries(seriesData)) {
        hcData.push({ name: xVal, y: yVal }); // TODO: the year needs to be cast as a string here
      }
      seriesList.push({ name: seriesName, data: hcData });
    }

    return seriesList;
  };
  //console.log(data);
  let series = createEventSeries(data, "Status");
  //console.log(series);
  return new Highcharts.chart("time-series", {
    chart: {
      type: "column",
    },
    title: {
      text: "",
    },

    xAxis: {
      categories: true,
    },

    yAxis: {
      title: {
        text: "Number of Events",
      },
    },

    plotOptions: {
      series: {
        label: {
          connectorAllowed: false,
        },
      },
    },

    series: series,
  });
};
