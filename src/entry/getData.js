async function fetchErrorBackup(pipelineId) {
  console.log("getting backup data!");
  const { default: data } = await import(`./data/${pipelineId}.js`);
  return data;
}

async function getAzureData(pipelineId, account = "certest") {
  const response = await fetch(
    `https://${account}.blob.core.windows.net/pipeline-profiles/${pipelineId}.json`
  );

  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    console.log(message);
    const data = await fetchErrorBackup(pipelineId);
    return data;
  }
  const data = await response.json();
  return data.data;
}

export function getData(id, loadChartCallback) {
  getAzureData(id).then((data) => {
    loadChartCallback(data);
  });
}
