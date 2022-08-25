/**
 * @file Class definition for a simple leaflet map used to display a key point map beside the throughput and capacity charts.
 */

import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { cerPalette, leafletBaseMap, addPipelineShape } from "../util.js";

/**
 * Class for generating a very simple leaflet bubble map showing one or more selected bubbles, with large zoom in/out functionality
 */
export class KeyPointMap {
  /**
   * Simple leaflet map generator showing one or more points "selected" in yellow, and other points in grey.
   * @param {Object} constr - KeyPointMap constructor.
   * @param {Object[]} constr.points - Array of all key points for map: {id: number, name: string, loc:[lat, -long]}.
   * @param {Object[]} constr.selected - Array of key point objects {id: number, name: string}, with each key point showing up "selected".
   * @param {string} [constr.divId="traffic-map"] - HTML div id where key point map will load.
   * @param {number[]} [constr.initZoomTo=[60, -97]] - Initial lat long for map before zooming to points.
   * @param {string} [constr.companyName=""] - Used to get initial zooms and padding for specific companies.
   * @param {Object} [constr.lang={}] - Object holding language switching items.
   * @param {any} constr.pipelineShape
   */
  constructor({
    points,
    selected,
    divId = "traffic-map",
    initZoomTo = [60, -97],
    companyName = "",
    lang = {},
    pipelineShape = undefined,
  }) {
    this.points = points;
    this.selected = KeyPointMap.selectedPointNames(selected);
    this.initZoomTo = initZoomTo;
    this.divId = divId;
    this.companyName = companyName;
    this.lang = lang;
    this.mapDisclaimer = undefined;
    this.colors = {
      active: cerPalette.Sun,
      deactivated: cerPalette["Cool Grey"],
    };
    this.getInits(companyName, points);
    this.pipelineShape = pipelineShape;
    this.addPipelineShape = addPipelineShape;
    this.pipelineLayer = undefined;
  }

  static selectedPointNames(s) {
    return s.map((p) => p.name);
  }

  getInits(companyName, points) {
    let minRadius = 30000;
    let padding = [30, 30];
    let maxZoom;
    if (["TCPL", "EnbridgeMainline"].includes(companyName)) {
      minRadius = 50000;
      padding = [0, 0];
    } else if (companyName === "TransMountain") {
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

  /**
   * When called, loads the leaflet base map on the instantiated "divId".
   * This method is placed outside the constructor to help with conditonally loading map when key point data is available.
   */
  addBaseMap() {
    const map = leafletBaseMap(
      {
        div: this.divId,
        zoomSnap: 0.25,
        zoomDelta: 0.25,
        zoomControl: false,
        initZoomTo: this.initZoomTo,
        initZoomLevel: 4,
        minZoom: 2.5,
      },
      L
    );
    map.scrollWheelZoom.disable();
    map.setMaxZoom(this.maxZoom);
    map.dragging.disable();
    map.doubleClickZoom.disable();
    this.addPipelineShape();
    this.map = map;
  }

  reZoom(zoomIn = true) {
    if (zoomIn) {
      this.keyPoints.eachLayer((/** @type {L.Circle} */ layer) => {
        layer.setRadius(this.minRadius);
      });
      this.map.fitBounds(this.keyPoints.getBounds(), { padding: this.padding });
    } else {
      this.keyPoints.eachLayer((/** @type {L.Circle} */ layer) => {
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

  /**
   * Place filled circles on the base map.
   */
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
    this.keyPoints.eachLayer((/** @type {L.Circle} */ layer) => {
      if (layer.options.name === this.selected) {
        layer.bringToFront();
      }
    });
    this.reZoom();
  }

  pointChange(newPoint) {
    this.selected = KeyPointMap.selectedPointNames(newPoint);
    this.keyPoints.eachLayer((/** @type {L.Circle} */ layer) => {
      if (this.selected.includes(layer.options.name)) {
        layer.setStyle({
          fillColor: this.colors.active,
          fillOpacity: 1,
        });
        layer.bringToFront();
      } else {
        layer.setStyle({
          fillColor: this.colors.deactivated,
          fillOpacity: 0.5,
        });
      }
    });
  }
}
