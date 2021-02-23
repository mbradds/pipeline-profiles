import { profileAssist as pa } from "../modules/util.js";
const haversine = require("haversine");

export class EventMap {
  substanceState = {
    Propane: "gas",
    "Natural Gas": "gas",
    "Fuel Gas": "liquid",
    "Lube Oil": "liquid",
    "Crude Oil": "liquid",
    "Diesel Fuel": "liquid",
    Gasoline: "liquid",
    "Natural Gas Liquids": "gas",
    Condensate: "liquid",
    Other: "other",
    "Sulphur Dioxide": "other",
  };

  EVENTCOLORS = {
    substanceColors: {
      Propane: pa.cerPalette["Forest"],
      "Natural Gas - Sweet": pa.cerPalette["Flame"],
      "Natural Gas - Sour": pa.cerPalette["Dim Grey"],
      "Fuel Gas": pa.cerPalette["hcGreen"],
      "Lube Oil": pa.cerPalette["hcPurple"],
      "Crude Oil - Sweet": pa.cerPalette["Sun"],
      "Crude Oil - Synthetic": pa.cerPalette["Forest"],
      "Crude Oil - Sour": pa.cerPalette["Dim Grey"],
      "Natural Gas Liquids": pa.cerPalette["Night Sky"],
      Condensate: pa.cerPalette["Ocean"],
      "Sulphur Dioxide": pa.cerPalette["hcPurple"],
      "Diesel Fuel": pa.cerPalette["hcRed"],
      Gasoline: pa.cerPalette["Flame"],
      Other: pa.cerPalette["Aubergine"],
    },
    statusColors: {
      "Initially Submitted": pa.cerPalette["Flame"],
      Closed: pa.cerPalette["Cool Grey"],
      Submitted: pa.cerPalette["Ocean"],
    },
    provinceColors: {
      Alberta: pa.cerPalette["Sun"],
      "British Columbia": pa.cerPalette["Forest"],
      Saskatchewan: pa.cerPalette["Aubergine"],
      Manitoba: pa.cerPalette["Ocean"],
      Ontario: pa.cerPalette["Night Sky"],
      Quebec: pa.cerPalette["Flame"],
    },
    whyColors: {
      "Standards and Procedures": pa.cerPalette["Flame"],
      "Tools and Equipment": pa.cerPalette["Forest"],
      Maintenance: pa.cerPalette["Night Sky"],
      "Human Factors": pa.cerPalette["Ocean"],
      "Engineering and Planning": pa.cerPalette["Sun"],
      "Natural or Environmental Forces": pa.cerPalette["hcAqua"],
      "To be determined": pa.cerPalette["Cool Grey"],
      "Inadequate Procurement": pa.cerPalette["Aubergine"],
      "Inadequate Supervision": pa.cerPalette["Dim Grey"],
      "Failure in communication": pa.cerPalette["hcPink"],
    },
    whatColors: {
      "Corrosion and Cracking": pa.cerPalette["Aubergine"],
      "Defect and Deterioration": pa.cerPalette["Cool Grey"],
      "Equipment Failure": pa.cerPalette["Dim Grey"],
      "Natural Force Damage": pa.cerPalette["Flame"],
      "Other Causes": pa.cerPalette["Forest"],
      "Incorrect Operation": pa.cerPalette["Night Sky"],
      "External Interference": pa.cerPalette["Ocean"],
      "To be determined": pa.cerPalette["Sun"],
    },
  };

  constructor({
    eventType,
    field = undefined,
    filters = undefined,
    minRadius = undefined,
    leafletDiv = "map",
    initZoomTo = [55, -119],
    lang = {},
  }) {
    this.eventType = eventType;
    this.filters = filters;
    this.minRadius = minRadius;
    this.field = field;
    this.initZoomTo = initZoomTo;
    this.colors = this.setColors();
    this.user = { latitude: undefined, longitude: undefined };
    this.leafletDiv = leafletDiv;
    this.lang = lang;
  }

  setColors() {
    if (this.eventType == "incidents") {
      return {
        Substance: this.EVENTCOLORS.substanceColors,
        Status: this.EVENTCOLORS.statusColors,
        Province: this.EVENTCOLORS.provinceColors,
        "Why It Happened": this.EVENTCOLORS.whyColors,
        "What Happened": this.EVENTCOLORS.whatColors,
      };
    }
  }

  addBaseMap() {
    var map = L.map(this.leafletDiv, { zoomSnap: 0.5, zoomDelta: 0.5 }).setView(
      this.initZoomTo,
      5
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}", {
      foo: "bar",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    map.setMinZoom(4);
    this.map = map;
  }

  getState(substance) {
    let shortSubstance = substance.split("-")[0].trim();
    return this.substanceState[shortSubstance];
  }

  volumeText(m3, substance, gas = false, liquid = false, other = false) {
    let convLiquid = pa.conversions["m3 to bbl"];
    let convGas = pa.conversions["m3 to cf"];
    if (!gas && !liquid && !other) {
      var state = this.getState(substance);
    } else if (!gas && liquid && !other) {
      var state = "liquid";
    } else if (gas && !liquid && !other) {
      var state = "gas";
    } else {
      var state = "other";
    }

    if (state !== "other") {
      if (state == "gas") {
        var imperial = `${Highcharts.numberFormat(
          (m3 * convGas).toFixed(2),
          2,
          "."
        )} cubic feet`;
      } else {
        var imperial = `${Highcharts.numberFormat(
          (m3 * convLiquid).toFixed(2),
          2,
          "."
        )} bbl`;
      }
      return `${imperial} (${Highcharts.numberFormat(m3, 2, ".")} m3)`;
    } else {
      return `${Highcharts.numberFormat(m3, 2, ".")} m3`;
    }
  }

  toolTip(incidentParams, fillColor) {
    const formatCommaList = (text) => {
      if (text.includes(",")) {
        let itemList = text.split(",");
        let brokenText = ``;
        for (var i = 0; i < itemList.length; i++) {
          brokenText += "&nbsp- " + itemList[i] + "<br>";
        }
        return brokenText;
      } else {
        return "&nbsp" + text;
      }
    };

    let toolTipText = `<div id="incident-tooltip"><p style="font-size:15px; font-family:Arial; text-align:center"><b>${incidentParams["Incident Number"]}</b></p>`;
    toolTipText += `<table>`;
    toolTipText += `<tr><td>${
      this.field
    }:</td><td style="color:${fillColor}">&nbsp<b>${
      incidentParams[this.field]
    }</b></td></tr>`;
    toolTipText += `<tr><td>Est. Release Volume:</td><td>&nbsp<b>${this.volumeText(
      incidentParams["Approximate Volume Released"],
      incidentParams.Substance
    )}</b></td></tr>`;
    toolTipText += `<tr><td>${this.lang.what}?</td><td><b>${formatCommaList(
      incidentParams["What Happened"]
    )}</b></td></tr>`;
    toolTipText += `<tr><td>${this.lang.why}?</td><td><b>${formatCommaList(
      incidentParams["Why It Happened"]
    )}</b></td></tr>`;
    toolTipText += `</table></div>`;
    return toolTipText;
  }

  addCircle(x, y, color, fillColor, r, incidentParams = {}) {
    return L.circle([x, y], {
      color: color,
      fillColor: fillColor,
      fillOpacity: 0.7,
      radius: this.minRadius,
      minRadius: r,
      weight: 1,
      incidentParams,
    });
  }

  updateRadius() {
    if (this.filters.type == "volume") {
      this.circles.eachLayer(function (layer) {
        try {
          layer.setRadius(layer.options["minRadius"]);
        } catch (err) {
          layer.setRadius(0);
          console.log("Error setting new radius");
        }
      });
    } else {
      let currZoom = this.map.getZoom();
      var minRadius = this.minRadius;
      if (currZoom >= 6.5) {
        this.circles.eachLayer(function (layer) {
          layer.setRadius(minRadius / 2);
        });
      } else if (currZoom < 5) {
        this.circles.eachLayer(function (layer) {
          layer.setRadius(minRadius * 2);
        });
      } else if (currZoom >= 5 || currZoom <= 5.5) {
        this.circles.eachLayer(function (layer) {
          layer.setRadius(minRadius);
        });
      }
    }
  }

  applyColor(rowValue, field) {
    try {
      return this.colors[field][rowValue];
    } catch (err) {
      return undefined;
    }
  }

  processEventsData(data) {
    const radiusCalc = (maxVolume) => {
      if (maxVolume > 500) {
        return 150000;
      } else {
        return 100000;
      }
    };

    let years = []; //piggyback on data processing pass to get the year colors
    let colors = [
      pa.cerPalette["Sun"],
      "#022034",
      "#043454",
      "#043a5e",
      pa.cerPalette["Night Sky"],
      "#1d5478",
      "#366687",
      "#507a96",
      "#698da5",
      "#82a0b4",
      "#9bb3c3",
      "#b4c6d2",
      "#cdd9e1",
      "#e6ecf0",
      "#ffffff",
    ];
    let volumes = data.map((row) => {
      return row["Approximate Volume Released"];
    });
    let [maxVol, minVol] = [Math.max(...volumes), Math.min(...volumes)];
    let maxRad = radiusCalc(maxVol);
    let allCircles = data.map((row) => {
      years.push(row.Year);
      let t = (row["Approximate Volume Released"] - minVol) / (maxVol - minVol);
      t = t * (maxRad - 5000) + 5000;
      return this.addCircle(
        row.Latitude,
        row.Longitude,
        pa.cerPalette["Cool Grey"],
        this.applyColor(row[this.field], this.field),
        t,
        row
      );
    });
    years = years.filter((v, i, a) => a.indexOf(v) === i); //get unique years
    years = years.sort(function (a, b) {
      return b - a;
    });
    let yearColors = {};
    years.map((yr, i) => {
      yearColors[yr] = colors[i];
    });
    this.colors.Year = yearColors;
    this.circles = L.featureGroup(allCircles).addTo(this.map);
    let currentDashboard = this;
    this.map.on("zoom", function (e) {
      currentDashboard.updateRadius();
    });
  }

  async findUser() {
    return new Promise((resolve, reject) => {
      let currentDashboard = this;
      this.map
        .locate({
          //setView: true,
          watch: false,
        }) /* This will return map so you can do chaining */
        .on("locationfound", function (e) {
          var marker = L.marker([e.latitude, e.longitude], {
            draggable: true,
          }).bindPopup(currentDashboard.lang.userPopUp);
          marker.on("drag", function (e) {
            var marker = e.target;
            var position = marker.getLatLng();
            currentDashboard.user.latitude = position.lat;
            currentDashboard.user.longitude = position.lng;
          });
          marker.id = "userLocation";
          currentDashboard.map.addLayer(marker);
          currentDashboard.user.latitude = e.latitude;
          currentDashboard.user.longitude = e.longitude;
          currentDashboard.user.layer = marker;
          resolve(currentDashboard);
        })
        .on("locationerror", function (e) {
          reject(currentDashboard);
        });
    });
  }

  async waitOnUser() {
    try {
      return await this.findUser();
    } catch (err) {
      var incidentFlag = document.getElementById("nearby-flag");
      incidentFlag.innerHTML = `<section class="alert alert-warning">${this.lang.locationError}</section>`;
    }
  }

  nearbyIncidents(range) {
    var [nearbyCircles, allCircles] = [[], []];
    var currentDashboard = this;
    this.circles.eachLayer(function (layer) {
      allCircles.push(layer);
      let incLoc = layer._latlng;
      let distance = haversine(currentDashboard.user, {
        latitude: incLoc.lat,
        longitude: incLoc.lng,
      });
      if (distance > range) {
        layer.setStyle({ fillOpacity: 0 });
      } else {
        nearbyCircles.push(layer);
        layer.setStyle({ fillOpacity: 0.7 });
      }
    });
    var incidentFlag = document.getElementById("nearby-flag");

    let userDummy = L.circle([this.user.latitude, this.user.longitude], {
      color: undefined,
      fillColor: undefined,
      fillOpacity: 0,
      radius: 1,
      weight: 1,
    });
    userDummy.addTo(this.map);

    if (nearbyCircles.length > 0) {
      this.nearby = L.featureGroup(nearbyCircles);
      let bounds = this.nearby.getBounds();
      bounds.extend(userDummy.getBounds());
      this.map.fitBounds(bounds, { maxZoom: 15 });
      // loop through the nearbyCircles and get some summary stats:
      let [nearbyGas, nearbyLiquid, nearbyOther] = [0, 0, 0];
      let currentDashboard = this;
      this.nearby.eachLayer(function (layer) {
        let layerState = currentDashboard.getState(
          layer.options.incidentParams.Substance
        );
        if (layerState == "gas") {
          nearbyGas +=
            layer.options.incidentParams["Approximate Volume Released"];
        } else if (layerState == "liquid") {
          nearbyLiquid +=
            layer.options.incidentParams["Approximate Volume Released"];
        } else {
          nearbyOther +=
            layer.options.incidentParams["Approximate Volume Released"];
        }
      });
      let nearbyText = ``;
      // nearbyText += `<section class="alert alert-info"><h4>There are ${nearbyCircles.length} incidents within ${range} km</h4><table>`;
      nearbyText += `<section class="alert alert-info"><h4>${this.lang.nearbyHeader(
        nearbyCircles.length,
        range
      )}</h4><table>`;
      nearbyText += `<tr><td>
        ${this.lang.gasRelease}&nbsp&nbsp</td><td>${this.volumeText(
        nearbyGas,
        undefined,
        true
      )}`;
      nearbyText += `<tr><td>
      ${this.lang.liquidRelease}&nbsp&nbsp</td><td>${this.volumeText(
        nearbyLiquid,
        undefined,
        false,
        true
      )}`;
      nearbyText += `<tr><td>
      ${this.lang.otherRelease}&nbsp&nbsp</td><td>${this.volumeText(
        nearbyOther,
        undefined,
        false,
        true
      )}`;
      nearbyText += `</table><br><small>${this.lang.exploreOther}</small>
        </section>`;
      incidentFlag.innerHTML = nearbyText;
    } else {
      let userZoom = L.featureGroup(allCircles);
      let bounds = userZoom.getBounds();
      bounds.extend(userDummy.getBounds());
      this.map.fitBounds(bounds, { maxZoom: 15 });
      incidentFlag.innerHTML = `<section class="alert alert-warning">${this.lang.noNearby(
        this.eventType
      )}</section>`;
    }
  }

  reZoom() {
    let bounds = this.circles.getBounds();
    this.map.fitBounds(bounds);
  }

  resetMap() {
    this.circles.eachLayer(function (layer) {
      layer.setStyle({ fillOpacity: 0.7 });
    });
    this.reZoom();
  }

  fieldChange(newField) {
    let newColors = this.colors[newField];
    this.field = newField;
    var currentDashboard = this;
    this.circles.eachLayer(function (layer) {
      let newFill = newColors[layer.options.incidentParams[newField]];
      layer.setStyle({
        fillColor: newFill,
      });
      layer.bindTooltip(
        currentDashboard.toolTip(layer.options.incidentParams, newFill)
      );
    });
  }

  lookForSize() {
    var currentDashboard = this;
    var resize = false;
    $(window).on("resize", function () {
      resize = true;
    });
    $(".tab > .tablinks").on("click", function (e) {
      if (resize) {
        currentDashboard.map.invalidateSize(true);
        resize = false;
      } else {
        currentDashboard.map.invalidateSize(false);
      }
      currentDashboard.reZoom();
    });
  }
}

export class EventNavigator {
  greyScale = [
    "#101010",
    "#181818",
    "#202020",
    "#282828",
    "#303030",
    "#383838",
    "#404040",
    "#484848",
    "#505050",
    "#585858",
    "#606060",
    "#686868",
    "#696969",
    "#707070",
    "#787878",
    "#808080",
    "#888888",
    "#909090",
    "#989898",
    "#A0A0A0",
    "#A8A8A8",
    "#A9A9A9",
    "#B0B0B0",
    "#B8B8B8",
    "#BEBEBE",
    "#C0C0C0",
    "#C8C8C8",
    "#D0D0D0",
    "#D3D3D3",
    "#D8D8D8",
    "#DCDCDC",
    "#E0E0E0",
    "#E8E8E8",
    "#F0F0F0",
    "#F5F5F5",
    "#F8F8F8",
  ];
  constructor({ plot, height = 125, data = false }) {
    this.plot = plot;
    this.currentActive = undefined;
    this.barList = [];
    this.bars = {};
    this.barSeries = {};
    this.barColors = plot.colors;
    this.allDivs = [];
    this.height = height;
    this.data = data;
  }

  seriesify(name, series, colors, yVal) {
    const seriesProps = (colors) => {
      if (colors) {
        return function (key, value, name, yVal, colors) {
          return {
            name: key,
            data: [{ name: name, y: value[yVal] }],
            color: colors[name][key],
            filter: yVal,
          };
        };
      } else {
        return function (key, value, name, yVal, colors) {
          return {
            name: key,
            data: [{ name: name, y: value[yVal] }],
            filter: yVal,
          };
        };
      }
    };

    var seriesParams = seriesProps(colors);
    let seriesList = [];
    for (const [key, value] of Object.entries(series[name])) {
      seriesList.push(seriesParams(key, value, name, yVal, colors));
    }
    return seriesList;
  }

  // usefull for names like "Status" that could use additional description
  pillName(name) {
    if (name == "Status") {
      return `CER ${name}`;
    } else {
      return `${name}`;
    }
  }

  createBar(div, name, series, colors) {
    var currentDashboard = this;
    return new Highcharts.chart(div, {
      chart: {
        y: -30,
        type: "bar",
        spacingRight: 8,
        spacingLeft: 2,
        spacingTop: 8,
        spacingBottom: 5,
        animation: false,
      },

      title: {
        text: currentDashboard.pillName(name),
        style: {
          fontSize: "16px",
        },
        padding: -5,
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

      tooltip: {
        snap: 0,
        useHTML: true,
        formatter: function () {
          if (this.series.options.filter == "frequency") {
            return `${this.series.name} - ${this.y}`;
          } else if (this.series.options.filter == "volume") {
            return `${this.series.name} - <b>${Highcharts.numberFormat(
              this.y,
              0,
              "."
            )} m3</b>`;
          }
        },
      },

      legend: {
        layout: "horizontal",
        verticalAlign: "bottom",
        alignColumns: false,
        margin: 0,
        itemStyle: {
          color: "#000000",
          cursor: "default",
          fontSize: "13px",
        },
        itemHoverStyle: {
          color: "#000000",
          cursor: "default",
        },
        navigation: {
          enabled: false,
        },
      },

      plotOptions: {
        bar: {
          pointWidth: 30,
        },
        series: {
          animation: false,
          stacking: "normal",
          grouping: false,
          shadow: false,
          states: {
            inactive: {
              opacity: 1,
            },
            hover: {
              enabled: false,
            },
          },
          events: {
            legendItemClick: function () {
              return false;
            },
          },
        },
      },
      series: this.seriesify(name, series, colors, "frequency"),
    });
  }

  prepareData(barName) {
    // TODO: this would run faster if all series were made in one pass
    var newBar = {};
    const addToSeries = (series, row, name) => {
      if (series.hasOwnProperty(row[name])) {
        series[row[name]].frequency += 1;
        series[row[name]].volume += row["Approximate Volume Released"];
      } else {
        series[row[name]] = {
          frequency: 1,
          volume: row["Approximate Volume Released"],
        };
      }
      return series;
    };

    this.data.map((row) => {
      newBar = addToSeries(newBar, row, barName);
    });
    this.barSeries[barName] = newBar;
  }

  deactivateChart(bar) {
    var chart = bar.chart;
    let activeDiv = document.getElementById(bar.div);
    if (chart) {
      let greyIndex = Math.floor(this.greyScale.length / chart.series.length);
      const every_nth = (arr, nth) => arr.filter((e, i) => i % nth === nth - 1);
      if (chart.series.length > 1) {
        var greyColors = every_nth(this.greyScale, greyIndex).reverse();
      } else {
        var greyColors = [this.greyScale[0]];
      }

      chart.series.map((s, i) => {
        chart.series[i].options.color = greyColors[i];
        chart.series[i].update(chart.series[i].options);
      });

      chart.update({
        title: { text: `${chart.title.textStr} (click to view)` },
        plotOptions: {
          series: {
            borderWidth: 1,
            borderColor: "#303030",
            states: {
              hover: {
                enabled: false,
              },
            },
          },
        },
        tooltip: {
          enabled: false,
        },
      });
    } else {
      activeDiv.innerHTML = `<p>${this.pillName(bar.name)} (click to view)</p>`;
    }
    activeDiv.style.borderStyle = "solid";
    activeDiv.style.borderColor = pa.cerPalette["Dim Grey"];
    activeDiv.style.borderRadius = "5px";
    activeDiv.style.opacity = 0.4;
  }

  activateChart(bar) {
    let chart = bar.chart;
    let activeDiv = document.getElementById(bar.div);
    if (chart) {
      let colors = this.barColors[bar.name];
      chart.series.map((s, i) => {
        chart.series[i].options.color = colors[s.name];
        chart.series[i].update(chart.series[i].options);
      });
      let activeTitle = chart.title.textStr;
      if (activeTitle.includes("(")) {
        activeTitle = activeTitle.split("(")[0];
      }
      chart.update({
        chart: {
          backgroundColor: "white",
        },
        title: {
          text: activeTitle,
        },
        plotOptions: {
          series: {
            borderWidth: 1,
            borderColor: "#303030",
            states: {
              hover: {
                enabled: true,
              },
            },
          },
        },
        tooltip: {
          enabled: true,
        },
      });
    } else {
      activeDiv.innerHTML = `<p>${this.pillName(bar.name)}</p>`;
      activeDiv.style.backgroundColor = "white";
    }
    this.currentActive = bar;
    activeDiv.style.borderStyle = "solid";
    activeDiv.style.borderColor = pa.cerPalette["Cool Grey"];
    activeDiv.style.borderRadius = "5px";
    activeDiv.style.opacity = 1;
    this.plot.fieldChange(bar.name);
  }

  barEvents(bar) {
    var barDiv = document.getElementById(bar.div);
    var barNav = this;
    function mouseOver() {
      if (bar.status !== "activated") {
        barDiv.style.opacity = 1;
        if (bar.chart) {
          bar.chart.update({
            chart: {
              backgroundColor: "#F0F8FF",
            },
          });
        } else {
          barDiv.style.backgroundColor = "#F0F8FF"; // TODO: make these colors into class variables
        }
      }
    }

    function mouseOut() {
      if (bar.status !== "activated") {
        barDiv.style.opacity = 0.4;
        if (bar.chart) {
          bar.chart.update({
            chart: {
              backgroundColor: "white",
            },
          });
        } else {
          barDiv.style.backgroundColor = "white";
        }
      }
    }

    function click() {
      // deactivate current active bar
      barNav.deactivateChart(barNav.currentActive);
      barNav.currentActive.status = "deactivated";
      // activate the clicked bar
      bar.status = "activated";
      barNav.activateChart(bar);
    }

    barDiv.addEventListener("mouseover", mouseOver);
    barDiv.addEventListener("mouseout", mouseOut);
    barDiv.addEventListener("click", click);
  }

  makeBar(barName, div, status, bar = true) {
    document.getElementById(div).style.height = `${this.height}px`;
    if (this.data) {
      this.prepareData(barName);
    }

    let newBar = {
      chart: bar
        ? this.createBar(div, barName, this.barSeries, this.barColors)
        : false,
      status: status,
      div: div,
      name: barName,
    };
    this.allDivs.push(div);
    this.barList.push(newBar);
    this.bars[barName] = newBar;
    if (status == "activated") {
      this.activateChart(newBar);
    } else if ((status = "deactivated")) {
      this.deactivateChart(newBar);
    }
  }

  divEvents() {
    this.barList.map((bar) => {
      this.barEvents(bar);
    });
  }

  switchY(newY) {
    this.barList.map((bar) => {
      let newSeries = this.seriesify(bar.name, this.barSeries, undefined, newY);
      bar.chart.update({
        series: newSeries,
      });
    });
  }
}

export class EventTrend extends EventMap {
  ONETOMANY = {
    Substance: false,
    Status: false,
    Province: false,
    "What Happened": true,
    "Why It Happened": true,
    category: true,
  };

  constructor({ eventType, field, filters, data, hcDiv, definitions = {} }) {
    super({ eventType: eventType, field: field });
    this.filters = filters;
    this.data = data;
    this.hcDiv = hcDiv;
    this.definitions = definitions;
    this.colors = this.setColors();
    this.displayDefinitions();
  }

  processEventsData(data, field) {
    const yField = (multipleValues) => {
      if (!multipleValues) {
        return function (data) {
          let series = {};
          let uniqueYears = new Set();
          data.map((row) => {
            uniqueYears.add(row.Year);
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
          return [series, Array.from(uniqueYears)];
        };
      } else {
        return function (data) {
          let series = {};
          let uniqueYears = new Set();
          data.map((row) => {
            uniqueYears.add(row.Year);
            if (row[field].includes(",")) {
              var itemList = row[field].split(",");
              itemList = itemList.map((value) => {
                return value.trim();
              });
            } else {
              var itemList = [row[field]];
            }
            itemList.map((yVal) => {
              if (series.hasOwnProperty(yVal)) {
                if (series[yVal].hasOwnProperty(row.Year)) {
                  series[yVal][row.Year]++;
                } else {
                  series[yVal][row.Year] = 1;
                }
              } else {
                series[yVal] = { [row.Year]: 1 };
              }
            });
          });
          return [series, Array.from(uniqueYears)];
        };
      }
    };
    let seriesCounter = yField(this.ONETOMANY[field]);
    let [series, uniqueYears] = seriesCounter(data);
    let seriesList = [];
    let dummySeries = {}; //makes sure that the x axis is in order
    dummySeries.data = uniqueYears.map((y) => {
      return { name: y.toString(), y: undefined };
    });
    dummySeries.name = "dummy";
    dummySeries.showInLegend = false;
    seriesList.push(dummySeries);

    for (const [seriesName, seriesData] of Object.entries(series)) {
      let hcData = [];
      for (const [xVal, yVal] of Object.entries(seriesData)) {
        hcData.push({ name: xVal, y: yVal }); // TODO: the year needs to be cast as a string here
      }
      seriesList.push({
        name: seriesName,
        data: hcData,
        color: this.applyColor(seriesName, field),
      });
    }
    return seriesList;
  }

  yAxisTitle() {
    if (this.filters.type == "frequency") {
      return `Number of ${this.eventType}`;
    } else {
      return `${this.eventType} volume (m3)`;
    }
  }

  oneToManyDisclaimer() {
    const destoryLabel = (chart) => {
      if (chart.customLabel) {
        chart.customLabel.destroy();
      }
      chart.customLabel = undefined;
    };
    if (this.ONETOMANY[this.field]) {
      destoryLabel(this.chart);
      let text = `<section class="alert alert-warning" style="padding:4px">`;
      text += `<p>${this.eventType} can have multiple <i>${this.field}</i> values. Chart totals may appear larger due to double counting.</p>`;
      text += `</section>`;
      //activate the chart disclaimer
      var label = this.chart.renderer
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
    }
  }

  displayDefinitions() {
    var definitionsPopUp = document.getElementById("trend-definitions");
    if (this.definitions.hasOwnProperty(this.field)) {
      pa.visibility(["trend-definitions"], "show");
      definitionsPopUp.innerHTML = `<p>Click on a bar to view <i>${this.field}</i> sub definition</p>`;
      this.onClickDefinition = true;
    } else {
      pa.visibility(["trend-definitions"], "hide");
      this.onClickDefinition = false;
    }
  }

  createChart() {
    let currentTrend = this;
    this.chart = new Highcharts.chart(this.hcDiv, {
      chart: {
        type: "column",
        animation: false,
        spacingTop: 25,
      },

      title: {
        text: "",
      },

      credits: {
        text: "",
      },

      xAxis: {
        categories: true,
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
            click: function () {
              if (currentTrend.onClickDefinition) {
                var definitionsPopUp = document.getElementById(
                  "trend-definitions"
                );
                let keyColor =
                  currentTrend.colors[currentTrend.field][this.name];

                let key = `<strong style="color:${keyColor}">${this.name}:</strong>&nbsp`;
                definitionsPopUp.innerHTML =
                  key + currentTrend.definitions[currentTrend.field][this.name];
              }
            },
          },
        },
      },

      series: this.processEventsData(this.data, this.field),
    });
  }
  fieldChange(newField) {
    if (newField !== this.field) {
      this.field = newField;
      let newSeries = this.processEventsData(this.data, newField);
      while (this.chart.series.length) {
        this.chart.series[0].remove();
      }
      newSeries.map((series) => {
        this.chart.addSeries(series, false);
      });
      this.oneToManyDisclaimer();
      this.displayDefinitions();
      this.chart.redraw();
    }
  }

  updateRadius() {
    let newSeries = this.processEventsData(this.data, this.field);
    let currentTrend = this;
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
