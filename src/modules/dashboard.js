import { cerPalette, conversions, visibility } from "./util";

const haversine = require("haversine");

function leafletBaseMap(config) {
  const map = L.map(config.div, {
    zoomSnap: config.zoomSnap,
    zoomDelta: config.zoomDelta,
    zoomControl: config.zoomControl,
  }).setView(config.initZoomTo, config.initZoomLevel);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}", {
    foo: "bar",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  map.setMinZoom(config.minZoom);
  return map;
}

const substanceState = {
  pro: "gas",
  ngsweet: "gas",
  fgas: "liquid",
  loil: "liquid",
  cosweet: "liquid",
  cosour: "liquid",
  sco: "liquid",
  diesel: "liquid",
  gas: "liquid",
  ngl: "gas",
  co: "liquid",
  Other: "other",
  Autre: "other",
};

const greyScale = [
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

const ONETOMANY = {
  Substance: false,
  Status: false,
  Province: false,
  what: true,
  why: true,
  category: true,
};

export class EventMap {
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
    this.colors = lang.EVENTCOLORS;
    this.substanceState = substanceState;
    this.field = field;
    this.initZoomTo = initZoomTo;
    this.user = { latitude: undefined, longitude: undefined };
    this.leafletDiv = leafletDiv;
    this.lang = lang;
    this.mapDisclaimer = undefined;
  }

  addBaseMap() {
    this.map = leafletBaseMap({
      div: this.leafletDiv,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      zoomControl: true,
      initZoomTo: this.initZoomTo,
      initZoomLevel: 5,
      minZoom: 4,
    });
  }

  getState(substance) {
    const shortSubstance = substance.split("-")[0].trim();
    return this.substanceState[shortSubstance];
  }

  volumeText(m3, substance, gas = false, liquid = false, other = false) {
    const convLiquid = conversions["m3 to bbl"];
    const convGas = conversions["m3 to cf"];
    let state = "other";
    if (!gas && !liquid && !other) {
      state = this.getState(substance);
    } else if (!gas && liquid && !other) {
      state = "liquid";
    } else if (gas && !liquid && !other) {
      state = "gas";
    }

    if (state !== "other") {
      let imperial;
      if (state === "gas") {
        imperial = `${Highcharts.numberFormat(
          (m3 * convGas).toFixed(2),
          2,
          this.lang.decimal
        )} ${this.lang.cf}`;
      } else {
        imperial = `${Highcharts.numberFormat(
          (m3 * convLiquid).toFixed(2),
          2,
          this.lang.decimal
        )} ${this.lang.bbl}`;
      }

      return `${imperial} (${Highcharts.numberFormat(
        m3,
        2,
        this.lang.decimal
      )} m3)`;
    }
    return `${Highcharts.numberFormat(m3, 2, this.lang.decimal)} m3`;
  }

  addMapDisclaimer(type = "volume") {
    const disclaimerL = (map, position, alertStyle, text) => {
      const info = L.control({ position });
      info.onAdd = function () {
        const disclaimerDiv = L.DomUtil.create("div", "map-disclaimer");
        disclaimerDiv.innerHTML = `<div class="alert ${alertStyle}" style="padding:3px; max-width:670px"><p>${text}</p></div>`;
        return disclaimerDiv;
      };
      info.addTo(map);
      return info;
    };
    if (type === "volume") {
      if (!this.mapVolumeDisclaimer) {
        this.mapVolumeDisclaimer = disclaimerL(
          this.map,
          "topright",
          "alert-warning",
          this.lang.volumeDisclaimer
        );
      }
    } else if (type === "location") {
      if (!this.mapLocationDisclaimer) {
        this.mapLocationDisclaimer = disclaimerL(
          this.map,
          "bottomleft",
          "alert-info",
          this.lang.locationDisclaimer
        );
      }
    }
  }

  removeMapDisclaimer(type = "volume") {
    if (type === "volume") {
      if (this.mapVolumeDisclaimer) {
        this.mapVolumeDisclaimer.remove();
        this.mapVolumeDisclaimer = undefined;
      }
    } else if (type === "location") {
      if (this.mapLocationDisclaimer) {
        this.mapLocationDisclaimer.remove();
        this.mapVolumeDisclaimer = undefined;
      }
    }
  }

  toolTip(incidentParams, fillColor) {
    const formatCommaList = (text) => {
      if (text.includes(",")) {
        const itemList = text.split(",");
        let brokenText = ``;
        for (let i = 0; i < itemList.length; i += 1) {
          brokenText += `&nbsp- ${itemList[i]}<br>`;
        }
        return brokenText;
      }
      return `&nbsp${text}`;
    };

    const bubbleName =
      this.lang.EVENTCOLORS[this.field][incidentParams[this.field]].n;
    let toolTipText = `<div id="incident-tooltip"><p style="font-size:15px; font-family:Arial; text-align:center"><strong>${incidentParams.id}</strong></p>`;
    toolTipText += `<table>`;
    toolTipText += `<tr><td>${this.field}:</td><td style="color:${fillColor}">&nbsp<strong>${bubbleName}</strong></td></tr>`;
    toolTipText += `<tr><td>${
      this.lang.estRelease
    }</td><td>&nbsp<strong>${this.volumeText(
      incidentParams.vol,
      incidentParams.Substance
    )}</strong></td></tr>`;
    toolTipText += `<tr><td>${
      this.lang.what
    }?</td><td><strong>${formatCommaList(
      incidentParams.what
    )}</strong></td></tr>`;
    toolTipText += `<tr><td>${this.lang.why}?</td><td><strong>${formatCommaList(
      incidentParams.why
    )}</strong></td></tr>`;
    toolTipText += `</table></div>`;
    return toolTipText;
  }

  addCircle(x, y, color, fillColor, r, incidentParams = {}) {
    return L.circle([x, y], {
      color,
      fillColor,
      fillOpacity: 0.7,
      radius: this.minRadius,
      volRadius: r,
      weight: 1,
      incidentParams,
    });
  }

  updateRadius() {
    if (this.filters.type === "volume") {
      this.circles.eachLayer((layer) => {
        try {
          layer.setRadius(layer.options.volRadius);
        } catch (err) {
          layer.setRadius(0);
          console.log("Error setting new radius");
        }
      });
    } else {
      const currZoom = this.map.getZoom();
      const { minRadius } = this;
      if (currZoom >= 5 && currZoom <= 6.5) {
        this.circles.eachLayer((layer) => {
          layer.setRadius(minRadius);
        });
      } else if (currZoom <= 4.5) {
        this.circles.eachLayer((layer) => {
          layer.setRadius(minRadius * 2);
        });
      } else if (currZoom > 6.5) {
        let zoomFactor = currZoom - 6;
        if (currZoom > 11.5) {
          zoomFactor += 8;
        }
        if (zoomFactor < 2) {
          zoomFactor = 2;
        }
        this.circles.eachLayer((layer) => {
          layer.setRadius(minRadius / zoomFactor);
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
      }
      return 100000;
    };

    let years = []; // piggyback on data processing pass to get the year colors
    const colors = [
      cerPalette.Sun,
      "#022034",
      "#043454",
      "#043a5e",
      cerPalette["Night Sky"],
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
    const volumes = data.map((row) => row.vol);
    const [maxVol, minVol] = [Math.max(...volumes), Math.min(...volumes)];
    const maxRad = radiusCalc(maxVol);
    const allCircles = data.map((row) => {
      years.push(row.Year);
      let radiusVol = (row.vol - minVol) / (maxVol - minVol);

      radiusVol = Math.sqrt(radiusVol / Math.PI) * maxRad + 1000;
      return this.addCircle(
        row["lat long"][0],
        row["lat long"][1],
        cerPalette["Cool Grey"],
        this.applyColor(row[this.field], this.field), // fillColor
        radiusVol,
        row
      );
    });
    years = years.filter((v, i, a) => a.indexOf(v) === i); // get unique years
    years = years.sort((a, b) => b - a);
    const yearColors = {};
    years.forEach((yr, i) => {
      yearColors[yr] = { c: colors[i], n: yr };
    });
    this.colors.Year = yearColors;
    this.circles = L.featureGroup(allCircles).addTo(this.map);
    const currentDashboard = this;
    this.map.on("zoom", () => {
      currentDashboard.updateRadius();
    });
  }

  async findUser() {
    return new Promise((resolve, reject) => {
      const currentDashboard = this;
      this.map
        .locate({
          // setView: true,
          watch: false,
        }) /* This will return map so you can do chaining */
        .on("locationfound", (e) => {
          const marker = L.marker([e.latitude, e.longitude], {
            draggable: true,
          }).bindPopup(currentDashboard.lang.userPopUp);
          marker.on("drag", (d) => {
            const position = d.target.getLatLng();
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
        .on("locationerror", (err) => {
          console.log("locationerror in findUser method");
          reject(err);
        });
    });
  }

  async waitOnUser() {
    // this promise is handled one level above in ../indidents/incidentDashboard.js
    return this.findUser();
  }

  nearbyIncidents(range) {
    const [nearbyCircles, allCircles] = [[], []];
    const currentDashboard = this;
    this.circles.eachLayer((layer) => {
      allCircles.push(layer);
      const incLoc = layer._latlng;
      const distance = haversine(currentDashboard.user, {
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
    const incidentFlag = document.getElementById("nearby-flag");

    const userDummy = L.circle([this.user.latitude, this.user.longitude], {
      color: undefined,
      fillColor: undefined,
      fillOpacity: 0,
      radius: 1,
      weight: 1,
    });
    userDummy.addTo(this.map);

    if (nearbyCircles.length > 0) {
      this.nearby = L.featureGroup(nearbyCircles);
      const bounds = this.nearby.getBounds();
      bounds.extend(userDummy.getBounds());
      this.map.fitBounds(bounds, { maxZoom: 15 });
      // loop through the nearbyCircles and get some summary stats:
      let [nearbyGas, nearbyLiquid, nearbyOther] = [0, 0, 0];
      // const currentDashboard = this;
      this.nearby.eachLayer((layer) => {
        const layerState = currentDashboard.getState(
          layer.options.incidentParams.Substance
        );
        if (layerState === "gas") {
          nearbyGas += layer.options.incidentParams.vol;
        } else if (layerState === "liquid") {
          nearbyLiquid += layer.options.incidentParams.vol;
        } else {
          nearbyOther += layer.options.incidentParams.vol;
        }
      });
      let nearbyText = `<section class="alert alert-info"><h4>${this.lang.nearbyHeader(
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
      const userZoom = L.featureGroup(allCircles);
      const bounds = userZoom.getBounds();
      bounds.extend(userDummy.getBounds());
      this.map.fitBounds(bounds, { maxZoom: 15 });
      incidentFlag.innerHTML = `<section class="alert alert-warning">${this.lang.noNearby(
        this.eventType
      )}</section>`;
    }
  }

  reZoom() {
    const bounds = this.circles.getBounds();
    this.map.fitBounds(bounds);
  }

  resetMap() {
    this.circles.eachLayer((layer) => {
      layer.setStyle({ fillOpacity: 0.7 });
    });
    this.reZoom();
  }

  fieldChange(newField) {
    const newColors = this.colors[newField];

    this.field = newField;
    const currentDashboard = this;
    this.circles.eachLayer((layer) => {
      const newFill = newColors[layer.options.incidentParams[newField]].c;
      layer.setStyle({
        fillColor: newFill,
      });
      layer.bindTooltip(
        currentDashboard.toolTip(layer.options.incidentParams, newFill)
      );
    });
  }

  lookForSize() {
    const currentDashboard = this;
    let resize = false;
    window.addEventListener("resize", () => {
      resize = true;
    });
    document
      .getElementById("safety-env-navigation")
      .addEventListener("click", () => {
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
  constructor({
    plot,
    langPillTitles,
    height = 125,
    data = false,
    showClickText = true,
  }) {
    this.plot = plot;
    this.langPillTitles = langPillTitles;
    this.currentActive = undefined;
    this.barList = [];
    this.bars = {};
    this.barSeries = {};
    this.barColors = plot.colors;
    this.allDivs = [];
    this.height = height;
    this.data = data;
    this.greyScale = greyScale;
    this.showClickText = showClickText;
  }

  seriesify(name, series, yVal) {
    const seriesProps = (colors) => {
      if (colors) {
        return function (key, value) {
          return {
            name: colors[key].n,
            id: key,
            data: [{ name, y: value[yVal] }],
            color: colors[key].c,
            filter: yVal,
          };
        };
      }
      return function (key, value) {
        return {
          name: key,
          id: key,
          data: [{ name, y: value[yVal] }],
          filter: yVal,
        };
      };
    };

    const seriesList = [];
    Object.keys(series[name]).forEach((key) => {
      const seriesParams = seriesProps(this.barColors[name]);
      const value = series[name][key];
      seriesList.push(seriesParams(key, value, name, this.barColors[name]));
    });
    // console.log(seriesList);
    return seriesList;
  }

  // usefull for names like "Status" that could use additional description
  pillName(name) {
    if (
      Object.prototype.hasOwnProperty.call(this.langPillTitles.titles, name)
    ) {
      return this.langPillTitles.titles[name];
    }
    return `${name}`;
  }

  createBar(div, name, series) {
    const currentDashboard = this;
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
          fontWeight: "normal",
        },
        padding: -5,
        margin: 0,
      },

      xAxis: {
        visible: false,
        categories: true,
        gridLineWidth: 0,
      },

      yAxis: {
        maxPadding: 0,
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
        formatter() {
          let toolText = "";
          if (this.series.options.filter === "frequency") {
            toolText = `${this.series.name} - ${this.y}`;
          }
          if (this.series.options.filter === "volume") {
            toolText = `${this.series.name} - <strong>${Highcharts.numberFormat(
              this.y,
              0,
              "."
            )} m3</strong>`;
          }
          return toolText;
        },
      },

      legend: {
        alignColumns: false,
        margin: 0,
        symbolPadding: 2,
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
          grouping: false,
          shadow: false,
          states: {
            inactive: {
              enabled: false,
            },
            hover: {
              enabled: false,
            },
          },
          events: {
            legendItemClick() {
              return false;
            },
          },
        },
      },
      series: this.seriesify(name, series, "frequency"),
    });
  }

  prepareData(barName) {
    // TODO: this would run faster if all series were made in one pass
    let newBar = {};
    const addToSeries = (series, row, name) => {
      const newSeries = series;
      if (Object.prototype.hasOwnProperty.call(newSeries, row[name])) {
        newSeries[row[name]].frequency += 1;
        newSeries[row[name]].volume += row.vol;
      } else {
        newSeries[row[name]] = {
          frequency: 1,
          volume: row.vol,
        };
      }
      return newSeries;
    };

    this.data.forEach((row) => {
      newBar = addToSeries(newBar, row, barName);
    });
    this.barSeries[barName] = newBar;
  }

  deactivateChart(bar) {
    const { chart } = bar;
    const activeDiv = document.getElementById(bar.div);
    let clickText = "";
    if (this.showClickText) {
      clickText = ` (${this.langPillTitles.click})`;
    }

    if (chart) {
      const greyIndex = Math.floor(this.greyScale.length / chart.series.length);
      const everyNth = (arr, nth) => arr.filter((e, i) => i % nth === nth - 1);
      let greyColors;
      if (chart.series.length > 1) {
        greyColors = everyNth(this.greyScale, greyIndex).reverse();
      } else {
        greyColors = [this.greyScale[0]];
      }

      chart.series.forEach((s, i) => {
        chart.series[i].options.color = greyColors[i];
        chart.series[i].update(chart.series[i].options);
      });

      chart.update({
        title: { text: `${chart.title.textStr}${clickText}` },
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
      activeDiv.innerHTML = `<p>${this.pillName(bar.name)}${clickText}</p>`;
      activeDiv.style.padding = "5px";
    }
    activeDiv.style.borderStyle = "solid";
    activeDiv.style.borderColor = cerPalette["Dim Grey"];
    activeDiv.style.borderRadius = "5px";
    activeDiv.style.opacity = 0.4;
  }

  activateChart(bar) {
    const { chart } = bar;
    const activeDiv = document.getElementById(bar.div);
    if (chart) {
      const colors = this.barColors[bar.name];
      chart.series.forEach((s, i) => {
        chart.series[i].options.color = colors[s.options.id].c;
        chart.series[i].update(chart.series[i].options);
      });
      let activeTitle = chart.title.textStr;
      if (activeTitle.includes("(")) {
        [activeTitle] = activeTitle.split("(");
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
      activeDiv.style.padding = "5px";
    }
    this.currentActive = bar;
    activeDiv.style.borderStyle = "solid";
    activeDiv.style.borderColor = cerPalette["Cool Grey"];
    activeDiv.style.borderRadius = "5px";
    activeDiv.style.opacity = 1;
    this.plot.fieldChange(bar.name);
  }

  barEvents(bar) {
    const barDiv = document.getElementById(bar.div);
    const barNav = this;
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

    const newBar = {
      chart: bar ? this.createBar(div, barName, this.barSeries) : false,
      status,
      div,
      name: barName,
    };
    this.allDivs.push(div);
    this.barList.push(newBar);
    this.bars[barName] = newBar;
    if (status === "activated") {
      this.activateChart(newBar);
    } else if (status === "deactivated") {
      this.deactivateChart(newBar);
    }
  }

  divEvents() {
    this.barList.forEach((bar) => {
      this.barEvents(bar);
    });
  }

  switchY(newY) {
    this.barList.forEach((bar) => {
      const newSeries = this.seriesify(bar.name, this.barSeries, newY);
      bar.chart.update({
        series: newSeries,
      });
    });
  }
}

export class EventTrend extends EventMap {
  constructor({
    eventType,
    field,
    filters,
    data,
    hcDiv,
    lang,
    definitions = {},
  }) {
    super({ eventType, field });
    this.filters = filters;
    this.data = data;
    this.hcDiv = hcDiv;
    this.lang = lang;
    this.colors = lang.EVENTCOLORS;
    this.definitions = definitions;
    this.ONETOMANY = ONETOMANY;
    this.displayDefinitions();
  }

  processEventsData(data, field) {
    const yField = (multipleValues) => {
      if (!multipleValues) {
        return function (events) {
          const series = {};
          const uniqueYears = new Set();
          events.forEach((row) => {
            uniqueYears.add(row.Year);
            if (Object.prototype.hasOwnProperty.call(series, row[field])) {
              if (
                Object.prototype.hasOwnProperty.call(
                  series[row[field]],
                  row.Year
                )
              ) {
                series[row[field]][row.Year] += 1;
              } else {
                series[row[field]][row.Year] = 1;
              }
            } else {
              series[row[field]] = { [row.Year]: 1 };
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
          uniqueYears.add(row.Year);
          if (row[field].includes(",")) {
            itemList = row[field].split(",");
            itemList = itemList.map((value) => value.trim());
          } else {
            itemList = [row[field]];
          }
          itemList.forEach((yVal) => {
            if (Object.prototype.hasOwnProperty.call(series, yVal)) {
              if (
                Object.prototype.hasOwnProperty.call(series[yVal], row.Year)
              ) {
                series[yVal][row.Year] += 1;
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
    };
    const seriesCounter = yField(this.ONETOMANY[field]);
    const [series, uniqueYears] = seriesCounter(data);
    const seriesList = [];
    const dummySeries = { name: "dummy", showInLegend: false }; // makes sure that the x axis is in order
    const dummyData = [];
    uniqueYears.forEach((y, index) => {
      if (
        y + 1 !== uniqueYears[index + 1] &&
        index !== uniqueYears.length - 1
      ) {
        const firstYear = y;
        const lastYear = uniqueYears[index + 1] - 1;
        for (let i = firstYear; i <= lastYear; i += 1) {
          dummyData.push({ name: i.toString(), y: undefined });
        }
      } else {
        dummyData.push({ name: y.toString(), y: undefined });
      }
    });

    dummySeries.data = dummyData;
    seriesList.push(dummySeries);
    Object.keys(series).forEach((seriesName) => {
      const seriesData = series[seriesName];
      const hcData = [];
      Object.keys(seriesData).forEach((xVal) => {
        const yVal = seriesData[xVal];
        hcData.push({ name: xVal, y: yVal });
      });
      seriesList.push({
        name: seriesName,
        data: hcData,
        color: this.applyColor(seriesName, field),
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
    if (this.ONETOMANY[this.field]) {
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
    const definitionsPopUp = document.getElementById("trend-definitions");
    if (Object.prototype.hasOwnProperty.call(this.definitions, this.field)) {
      visibility(["trend-definitions"], "show");
      definitionsPopUp.innerHTML = this.lang.barClick(
        this.pillNameSubstitution()
      );
      this.onClickDefinition = true;
    } else {
      visibility(["trend-definitions"], "hide");
      this.onClickDefinition = false;
    }
  }

  createChart() {
    const currentTrend = this;
    this.chart = new Highcharts.chart(this.hcDiv, {
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
          text: currentTrend.lang.legendClick,
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
              if (currentTrend.onClickDefinition) {
                const definitionsPopUp =
                  document.getElementById("trend-definitions");
                const keyColor =
                  currentTrend.colors[currentTrend.field][this.name];

                const key = `<strong style="color:${keyColor}">${this.name}:</strong>&nbsp`;
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
      const newSeries = this.processEventsData(this.data, newField);
      while (this.chart.series.length) {
        this.chart.series[0].remove();
      }
      newSeries.forEach((series) => {
        this.chart.addSeries(series, false);
      });
      this.oneToManyDisclaimer();
      this.displayDefinitions();
      this.chart.redraw();
    }
  }

  updateRadius() {
    const newSeries = this.processEventsData(this.data, this.field);
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

export class KeyPointMap {
  constructor({
    points,
    selected,
    leafletDiv = "traffic-map",
    initZoomTo = [60, -97],
    companyName = "",
    lang = {},
  }) {
    this.points = points;
    this.selected = this.constructor.selectedPointNames(selected);
    this.initZoomTo = initZoomTo;
    this.leafletDiv = leafletDiv;
    this.companyName = companyName;
    this.lang = lang;
    this.mapDisclaimer = undefined;
    this.colors = {
      active: cerPalette.Sun,
      deactivated: cerPalette["Cool Grey"],
    };
    this.getInits(companyName, points);
  }

  static selectedPointNames(s) {
    return s.map((p) => p.name);
  }

  getInits(companyName, points) {
    let minRadius = 30000;
    let padding = [30, 30];
    let maxZoom;
    if (
      ["TransCanada PipeLines Limited", "Enbridge Pipelines Inc."].includes(
        companyName
      )
    ) {
      minRadius = 50000;
      padding = [0, 0];
    } else if (companyName === "Trans Mountain Pipeline ULC") {
      minRadius = 2000;
      padding = [60, 60];
    } else if (points.length === 1) {
      minRadius = 15000;
      padding = [150, 150];
      maxZoom = 6;
    }
    this.minRadius = minRadius;
    this.padding = padding;
    this.maxZoom = maxZoom;
  }

  addBaseMap() {
    const map = leafletBaseMap({
      div: this.leafletDiv,
      zoomSnap: 0.25,
      zoomDelta: 0.25,
      zoomControl: false,
      initZoomTo: this.initZoomTo,
      initZoomLevel: 4,
      minZoom: 2.5,
    });
    map.scrollWheelZoom.disable();
    map.setMaxZoom(this.maxZoom);
    this.map = map;
  }

  reZoom(zoomIn = true) {
    if (zoomIn) {
      const zoomRadius = this.minRadius;
      this.keyPoints.eachLayer((layer) => {
        layer.setRadius(zoomRadius);
      });
      this.map.fitBounds(this.keyPoints.getBounds(), { padding: this.padding });
    } else {
      this.keyPoints.eachLayer((layer) => {
        layer.setRadius(100000);
      });
      this.map.setView(this.initZoomTo, 2.5);
    }
  }

  addCircle(x, y, color, fillColor, fillOpacity, r, name) {
    let toolText = name;
    const toolList = name.split(" ");
    if (toolList.length - 1 > 5) {
      toolText = `${toolList.slice(0, 3).join(" ")}<br>${toolList
        .slice(3)
        .join(" ")}`;
    }
    return L.circle([x, y], {
      color,
      fillColor,
      fillOpacity,
      radius: this.minRadius,
      volRadius: r,
      weight: 1,
      name,
    }).bindTooltip(`<strong>${toolText}</strong>`);
  }

  addPoints() {
    const allPoints = this.points.map((point) => {
      let [pointColor, pointOpacity, toFront] = [
        undefined,
        undefined,
        undefined,
      ];
      if (this.selected.includes(point.name)) {
        pointColor = this.colors.active;
        pointOpacity = 1;
        toFront = true;
      } else {
        pointColor = this.colors.deactivated;
        pointOpacity = 0.5;
        toFront = false;
      }
      return this.addCircle(
        point.loc[0],
        point.loc[1],
        "#42464B",
        pointColor,
        pointOpacity,
        this.minRadius,
        point.name,
        toFront
      );
    });
    this.keyPoints = L.featureGroup(allPoints).addTo(this.map);
    const thisMap = this;
    this.keyPoints.eachLayer((layer) => {
      if (layer.options.name === thisMap.selected) {
        layer.bringToFront();
      }
    });
    this.reZoom();
  }

  pointChange(newPoint) {
    this.selected = this.constructor.selectedPointNames(newPoint);
    const thisMap = this;
    this.keyPoints.eachLayer((layer) => {
      if (thisMap.selected.includes(layer.options.name)) {
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
