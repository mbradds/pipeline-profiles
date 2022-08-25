import * as L from "leaflet";

export async function getPipelineShape(PipelineID) {
  try {
    const url = `https://services5.arcgis.com/vNzamREXvX2WcX6d/ArcGIS/rest/services/CER_Pipeline_Systems_WGS84_view/FeatureServer/3/query?where=PipelineID='${PipelineID}'&f=json`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (err) {
    return undefined;
  }
}

export async function addPipelineShape() {
  if (this.pipelineShape) {
    try {
      const data = await this.pipelineShape;
      const pipeGeoJson = data.features[0];
      pipeGeoJson.type = "Feature";
      pipeGeoJson.geometry.type = "MultiLineString";
      pipeGeoJson.geometry.coordinates = pipeGeoJson.geometry.paths;
      const pipelineLayer = L.geoJSON(pipeGeoJson, {
        color: "black",
        opacity: 0.4,
      }).addTo(this.map);
      pipelineLayer.bringToBack();
      return pipelineLayer;
    } catch (err) {
      console.log(err);
      console.log("cant add pipeline layer");
      return undefined;
    }
  } else {
    return undefined;
  }
}
