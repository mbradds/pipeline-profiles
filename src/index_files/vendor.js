import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import Highcharts from "highcharts";
import MapModule from "highcharts/modules/map";
import HighchartsMore from "highcharts/highcharts-more";
import NoDataToDisplay from "highcharts/modules/no-data-to-display";

export function bindToWindow() {
  HighchartsMore(Highcharts);
  NoDataToDisplay(Highcharts);
  MapModule(Highcharts);
  window.L = L;
  window.Highcharts = Highcharts;
}
