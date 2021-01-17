export const incidentBar = (data) => {
  function hcIncidents() {
    return new Highcharts.chart("incident-bar", {
      chart: {
        type: "bar",
        spacingRight: 0,
        spacingLeft: 0,
        animation: false,
      },
      title: {
        text: "Substance",
        padding: 0,
        margin: 0,
      },
      credits: {
        text: "",
      },
      xAxis: {
        visible: false,
        categories: true,
        gridLineWidth: 0,
      },
      yAxis: {
        maxPadding: 0,
        visible: true,
        plotLines: [
          {
            color: "white",
            value: 0,
            width: 1,
            zIndex: 5,
          },
        ],
        labels: {
          enabled: false,
        },
        gridLineWidth: 0,
        startOnTick: false,
        endOnTick: false,
        min: 0,
        title: {
          text: "",
        },
      },
      legend: {
        enabled: true,
        padding: 0,
      },
      tooltip: {
        shared: false,
      },
      plotOptions: {
        series: {
          stacking: "normal",
          grouping: false,
          shadow: false,
          borderWidth: 0,
          states: {
            inactive: {
              opacity: 1,
            },
          },
        },
      },
      series: [
        {
          name: "John",
          data: [{ name: "Substance", y: 5 }],
        },
        {
          name: "Jane",
          data: [{ name: "Substance", y: 2 }],
        },
        {
          name: "Joe",
          data: [{ name: "Substance", y: 3 }],
        },
      ],
    });
  }
  prepareData(data);
  let chart = hcIncidents();
  document
    .getElementById("incident-bar")
    .addEventListener("mouseover", mouseOver);
  document
    .getElementById("incident-bar")
    .addEventListener("mouseout", mouseOut);
  document.getElementById("incident-bar").addEventListener("click", click);

  function mouseOver() {
    chart.update({
      chart: {
        backgroundColor: "#FCFFC5",
      },
    });
  }

  function mouseOut() {
    chart.update({
      chart: {
        backgroundColor: "white",
      },
    });
  }

  function click() {
    console.log("click!");
  }
  function prepareData(data) {
    console.log(data);
  }
};
