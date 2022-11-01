import * as L from "leaflet";

async function apiRequest(PipelineID) {
  try {
    const url = `https://services5.arcgis.com/vNzamREXvX2WcX6d/ArcGIS/rest/services/CER_Pipeline_Systems_WGS84_view/FeatureServer/3/query?where=PipelineID='${PipelineID}'&f=json`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (err) {
    return undefined;
  }
}

export async function getPipelineShape(PipelineID) {
  // these pipelines are not ready
  const dontGet = ["Westcoast", "EnbridgeBakken"];
  if (dontGet.includes(PipelineID)) {
    return undefined;
  }
  // enbridge corner case
  if (PipelineID === "EnbridgeMainline") {
    const mainline = await apiRequest(PipelineID);
    const line9 = await apiRequest("EnbridgeLine9");
    const line7 = await apiRequest("EnbridgeLine7");
    const line11 = await apiRequest("EnbridgeLine11");
    mainline.features[0].geometry.paths =
      mainline.features[0].geometry.paths.concat(
        line9.features[0].geometry.paths,
        line7.features[0].geometry.paths,
        line11.features[0].geometry.paths
      );
    return mainline;
  }
  const data = apiRequest(PipelineID);
  return data;
}

export async function addPipelineShape() {
  if (this.pipelineShape) {
    try {
      const data = await this.pipelineShape;
      const pipeGeoJson = data.features[0];
      if (pipeGeoJson) {
        pipeGeoJson.type = "Feature";
        pipeGeoJson.geometry.type = "MultiLineString";
        pipeGeoJson.geometry.coordinates = pipeGeoJson.geometry.paths;
        const pipelineLayer = L.geoJSON(pipeGeoJson, {
          color: "black",
          opacity: 0.4,
        }).addTo(this.map);
        pipelineLayer.bringToBack();
        this.map.attributionControl.addAttribution(
          '<a href="https://gdm-inc.com/">GDM</a>'
        );
        return pipelineLayer;
      }
      console.warn("pipeline shape API returned no data");
      return undefined;
    } catch (err) {
      console.warn(err);
      return undefined;
    }
  } else {
    return undefined;
  }
}
