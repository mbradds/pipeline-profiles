// import { trafficTrendTextEng } from "../modules/dynamicText.js";
import { cerPalette } from "../modules/util.js";

class KeyPointMap {
  colors = {
    active: cerPalette["Sun"],
    deactivated: cerPalette["Cool Grey"],
  };
  constructor({
    points,
    selected,
    minRadius = undefined,
    leafletDiv = "traffic-map",
    initZoomTo = [60, -97],
    padding = [30, 30],
    lang = {},
  }) {
    this.points = points;
    this.selected = selected;
    this.minRadius = minRadius;
    this.initZoomTo = initZoomTo;
    this.padding = padding;
    this.leafletDiv = leafletDiv;
    this.lang = lang;
    this.mapDisclaimer = undefined;
  }

  addBaseMap() {
    var map = L.map(this.leafletDiv, {
      zoomSnap: 0.25,
      zoomDelta: 0.25,
      zoomControl: false,
    }).setView(this.initZoomTo, 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}", {
      foo: "bar",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    map.setMinZoom(2.5);
    map.scrollWheelZoom.disable();
    this.map = map;
  }

  reZoom(zoomIn = true) {
    let bounds = this.keyPoints.getBounds();
    if (zoomIn) {
      this.map.fitBounds(bounds, { padding: this.padding });
    } else {
      this.map.setView(this.initZoomTo, 2.5);
    }
  }

  addCircle(x, y, color, fillColor, fillOpacity, r, name) {
    return L.circle([x, y], {
      color: color,
      fillColor: fillColor,
      fillOpacity: fillOpacity,
      radius: this.minRadius,
      volRadius: r,
      weight: 1,
      name: name,
    }).bindTooltip(`<strong>${name}</strong>`);
  }

  addPoints() {
    let allPoints = this.points.map((point) => {
      if (point["Key Point"] == this.selected) {
        var pointColor = this.colors.active;
        var pointOpacity = 1;
        var toFront = true;
      } else {
        var pointColor = this.colors.deactivated;
        var pointOpacity = 0.5;
        var toFront = false;
      }
      return this.addCircle(
        point.Latitude,
        point.Longitude,
        "#42464B",
        pointColor,
        pointOpacity,
        this.minRadius,
        point["Key Point"],
        toFront
      );
    });
    this.keyPoints = L.featureGroup(allPoints).addTo(this.map);
    const thisMap = this;
    this.keyPoints.eachLayer(function (layer) {
      if (layer.options.name == thisMap.selected) {
        layer.bringToFront();
      }
    });
    this.reZoom();
  }

  pointChange(newPoint) {
    this.selected = newPoint;
    const thisMap = this;
    this.keyPoints.eachLayer(function (layer) {
      if (layer.options.name == thisMap.selected) {
        layer.setStyle({
          fillColor: thisMap.colors.active,
          fillOpacity: 1,
        });
        layer.bringToFront();
      } else {
        layer.setStyle({
          fillColor: thisMap.colors.deactivated,
          fillOpacity: 0.5,
        });
      }
    });
  }
}

export async function mainTraffic(trafficData, metaData, lang) {
  function addPointButtons(metaData, defaultSelect) {
    let btnGroup = $("#traffic-points-btn");
    metaData.points.map((point) => {
      if (point == defaultSelect) {
        btnGroup.append(
          `<div class="btn-group btn-point"><button type="button" value="${point}" class="btn btn-default active">${point}</button></div>`
        );
      } else {
        btnGroup.append(
          `<div class="btn-group btn-point"><button type="button" value="${point}" class="btn btn-default">${point}</button></div>`
        );
      }
    });
  }

  const setTitle = (point, tradeType) => {
    return `${point} - monthly ${tradeType[1]} traffic (Direction of flow: ${tradeType[0]})`;
  };

  function tooltipText(event) {
    const addRow = (p, unit, extraStyle = "") => {
      return `<tr style="${extraStyle}"><th style="color:${p.color}">${p.series.name}:</th><th>&nbsp${p.y} ${unit}</th></tr>`;
    };

    const addTable = (section) => {
      let toolText = `<table class="mrgn-tp-sm">`;
      let total = 0;
      section.traffic.map((row) => {
        toolText += row[0];
        total += row[1];
      });
      if (section.traffic.length > 2) {
        toolText += addRow(
          {
            color: cerPalette["Dim Grey"],
            series: { name: "Total" },
            y: total.toFixed(1),
          },
          "Bcf/d"
        );
      }
      if (section.hasOwnProperty("capacity")) {
        toolText += section.capacity[0];
        let utilization = ((total / section.capacity[1]) * 100).toFixed(1);
        toolText += addRow(
          {
            color: cerPalette["Cool Grey"],
            series: { name: "Utilization" },
            y: utilization,
          },
          "%",
          "border-top: 1px dashed grey"
        );
      }

      toolText += `</table>`;
      return toolText;
    };

    var textHolder = {
      imports: { traffic: [], capacity: 0 },
      other: { traffic: [] },
    };
    var hasImports = false;
    var totalThroughput = 0;
    event.points.map((p) => {
      if (p.series.name == "import") {
        hasImports = true;
        textHolder.imports.traffic.push([addRow(p, "Bcf/d"), p.y]);
      } else if (p.series.name == "Import Capacity") {
        textHolder.imports.capacity = [addRow(p, "Bcf/d"), p.y];
      } else if (
        p.series.name == "Capacity" ||
        p.series.name == "Export Capacity"
      ) {
        textHolder.other.capacity = [addRow(p, "Bcf/d"), p.y];
      } else {
        textHolder.other.traffic.push([addRow(p, " Bcf/d"), p.y]);
        totalThroughput += p.y;
      }
    });

    // tooltip header
    let toolText = `<strong>${Highcharts.dateFormat(
      "%b, %Y",
      event.x
    )}</strong>`;

    toolText += addTable(textHolder.other);

    if (hasImports) {
      toolText += addTable(textHolder.imports);
    }

    return toolText;
  }

  // function tooltipText(event) {
  //   let toolText = `<i><strong>${Highcharts.dateFormat(
  //     "%b, %Y",
  //     event.x
  //   )}</strong></i>`;
  //   let throughTable = `<table style="margin-top:5px">`;
  //   let totalThroughput = 0;
  //   let throughcounter = 0;
  //   let capacity = [];
  //   let hasImports = false;
  //   event.points.map((p) => {
  //     if (p.series.name == "import") {
  //       hasImports = true;
  //     }
  //     if (p.color !== "#FFBE4B") {
  //       totalThroughput += p.y;
  //       throughcounter += 1;
  //       throughTable += `<tr><th style="color:${p.color}">${p.series.name}:</th><th>&nbsp${p.y} Bcf/d</th></tr>`;
  //     } else {
  //       //capacity = p.y;
  //       capacity.push({ name: p.series.name, value: p.y });
  //     }
  //   });
  //   if (throughcounter > 1 && !hasImports) {
  //     throughTable += `<tr style="border-top: 1px dashed grey"><th>Total:</th><th>&nbsp${totalThroughput.toFixed(
  //       2
  //     )} Bcf/d</th></tr>`;
  //   }

  //   if (capacity.length !== 0) {
  //     capacity.map((cap) => {
  //       throughTable += `<tr style="border-bottom:1px solid grey"><th style="color:#FFBE4B">${
  //         cap.name
  //       }:</th><th>&nbsp${cap.value.toFixed(2)} Bcf/d</th></tr>`;
  //       throughTable += `<tr><th>Utilization:</th><th>&nbsp${(
  //         (totalThroughput / cap.value) *
  //         100
  //       ).toFixed(0)} %</th></tr>`;
  //     });
  //   }

  //   throughTable += `</table>`;
  //   toolText += throughTable;
  //   return toolText;
  // }

  const trafficChart = (series, title, units, div = "traffic-hc") => {
    return new Highcharts.chart(div, {
      chart: {
        zoomType: "x",
        marginRight: 0,
        animation: false,
      },
      credits: {
        text: "",
      },
      title: {
        align: "left",
        x: 10,
        text: title,
        style: {
          fontSize: "16px",
          fontWeight: "bold",
        },
      },
      xAxis: {
        type: "datetime",
        crosshair: true,
      },
      yAxis: [
        {
          title: {
            text: units,
          },
          min: 0,
        },
        { visible: false },
      ],
      tooltip: {
        shared: true,
        backgroundColor: "white",
        useHTML: true,
        formatter: function () {
          return tooltipText(this);
        },
      },
      plotOptions: {
        area: {
          stacking: "normal",
        },
        series: {
          lineWidth: 3,
          states: {
            inactive: {
              opacity: 1,
            },
          },
        },
      },
      series: series,
    });
  };

  const hasImportsRedraw = (chart, btnValue, metaData) => {
    chart.update(
      {
        title: {
          text: setTitle(btnValue, metaData.directions[btnValue]),
        },
        yAxis: [
          {
            title: {
              text: `Exports (${metaData.units})`,
            },
            height: "45%",
            min: 0,
            max: undefined,
          },
          {
            visible: true,
            title: {
              text: `Imports (${metaData.units})`,
            },
            top: "50%",
            height: "45%",
            offset: 0,
            min: 0,
            max: undefined,
          },
        ],
      },
      false
    );
    chart.redraw();
    var maxY = Math.max(chart.yAxis[0].max, chart.yAxis[1].max);
    chart.update(
      {
        yAxis: [
          {
            max: maxY,
          },
          {
            max: maxY,
          },
        ],
      },
      false
    );
    return chart;
  };

  function buildDashboard() {
    try {
      const defaultPoint = metaData.defaultPoint;
      var pointMap = undefined;
      if (defaultPoint !== "system") {
        if (metaData.points.length == 1) {
          // eg, Keystone
          ["traffic-points-btn", "key-point-title"].map((hideDiv) => {
            document.getElementById(hideDiv).style.display = "none";
          });
        } else {
          addPointButtons(metaData, defaultPoint);
        }

        if (
          ["TransCanada PipeLines Limited", "Enbridge Pipelines Inc."].includes(
            metaData.companyName
          )
        ) {
          var minRadius = 50000;
          var padding = [0, 0];
        } else if (metaData.companyName == "Trans Mountain Pipeline ULC") {
          var minRadius = 5000;
          var padding = [70, 70];
        } else if (metaData.points.length == 1) {
          var minRadius = 30000;
          var padding = [150, 150];
        } else {
          var minRadius = 30000;
          var padding = [30, 30];
        }
        pointMap = new KeyPointMap({
          points: metaData.keyPoints,
          selected: defaultPoint,
          minRadius: minRadius,
          padding: padding,
        });
        pointMap.addBaseMap();
        pointMap.addPoints();
      } else {
        ["traffic-points-btn", "traffic-container", "key-point-title"].map(
          (hideDiv) => {
            document.getElementById(hideDiv).style.display = "none";
          }
        );
        var element = document.getElementById("traffic-hc-column");
        element.className = element.className.replace("col-md-8", "col-md-12");
      }
      const firstTitle = setTitle(
        defaultPoint,
        metaData.directions[defaultPoint]
      );

      const chart = trafficChart(
        trafficData[defaultPoint],
        firstTitle,
        metaData.units
      );
      if (defaultPoint == "St. Stephen") {
        ["traffic-points-btn", "key-point-title"].map((hideDiv) => {
          document.getElementById(hideDiv).style.display = "none";
        });
        hasImportsRedraw(chart, defaultPoint, metaData);
        chart.redraw();
      }
      lang.dynamicText(metaData, defaultPoint);

      // update buttons
      $("#traffic-points-btn button").on("click", function () {
        $(".btn-point > .btn").removeClass("active");
        var thisBtn = $(this);
        thisBtn.addClass("active");
        var btnValue = thisBtn.val();
        const newSeries = trafficData[btnValue];
        var currentIds = chart.series.map((s) => {
          return s.userOptions.id;
        });
        var newIds = newSeries.map((s) => {
          return s.id;
        });

        currentIds.map((id) => {
          if (!newIds.includes(id)) {
            chart.get(id).remove(false);
          }
        });
        let hasImports = false;
        newSeries.map((newS) => {
          if (currentIds.includes(newS.id)) {
            chart.get(newS.id).setData(newS.data, false, false, false);
          } else {
            chart.addSeries(newS, false, true);
          }
          if (newS.name == "import") {
            hasImports = true;
          }
        });
        if (hasImports) {
          hasImportsRedraw(chart, btnValue, metaData);
        } else {
          chart.update(
            {
              title: {
                text: setTitle(btnValue, metaData.directions[btnValue]),
              },
              yAxis: [
                {
                  title: {
                    text: metaData.units,
                  },
                  height: "100%",
                  min: 0,
                  max: undefined,
                },
                { visible: false },
              ],
            },
            false
          );
        }
        if (hasImports) {
          undefined;
        }

        chart.redraw(true);
        pointMap.pointChange(btnValue);
        lang.dynamicText(metaData, btnValue);
      });

      // update map zoom
      $("#key-point-zoom-btn button").on("click", function () {
        $(".btn-map > .btn").removeClass("active");
        var thisBtn = $(this);
        thisBtn.addClass("active");
        var btnValue = thisBtn.val();
        if (btnValue == "zoom-in") {
          pointMap.reZoom(true);
        } else {
          pointMap.reZoom(false);
        }
      });
    } catch (err) {
      console.log(err);
    }
  }

  function buildDecision(trafficData) {
    if (trafficData && Object.keys(trafficData).length === 0) {
      document.getElementById("traffic-section").style.display = "none";
    } else {
      return buildDashboard();
    }
  }

  return buildDecision(trafficData);
}
