export async function getPipelineShape() {
  try {
    const url =
      "https://services5.arcgis.com/vNzamREXvX2WcX6d/ArcGIS/rest/services/CER_Pipeline_Systems_WGS84_view/FeatureServer/3/query?where=PipelineID='NGTL'&f=json";
    return fetch(url);
  } catch (err) {
    return err;
  }
}
