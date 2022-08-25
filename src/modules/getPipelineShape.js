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
