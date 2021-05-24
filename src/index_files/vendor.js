/**
 * @file Serves as the entry point for the vendor bundles. Highcharts and leaflet are bundles seperately as specified in the
 * webpack configuration.
 *
 * The custom css for each dashboard/new section piggybacks on this file, because this file, and the css files, are really
 * the only files that are profile AND language agnostic. Importing the vendor code and css into the profile-code or data
 * entry points would be inefficent and could result in longer compile times.
 */

import "leaflet/dist/leaflet.css";
import "leaflet/dist/images/marker-shadow.png"; // TODO: is this needed?
import * as L from "leaflet";
import Highcharts from "highcharts";
import MapModule from "highcharts/modules/map";
import HighchartsMore from "highcharts/highcharts-more";
import NoDataToDisplay from "highcharts/modules/no-data-to-display";

require("../css/main.css");

/**
 * Applies highcharts and leaflet as window globals, accessible throughout the rest of the project as if they were script tags.
 * Currently includes: highcharts, highcharts more, no data to display, highmap module, and leaflet.
 */
export function bindToWindow() {
  HighchartsMore(Highcharts);
  NoDataToDisplay(Highcharts);
  MapModule(Highcharts);
  window.L = L;
  window.Highcharts = Highcharts;
}
