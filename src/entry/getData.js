function removeLoaders(className = "loader") {
  Array.from(document.getElementsByClassName(className)).forEach((e) => {
    e.classList.remove(className);
  });
}

async function fetchErrorBackup(pipelineId) {
  console.log("getting backup data!");
  const { default: data } = await import(
    /* webpackChunkName: "data/[request]" */ `./data/${pipelineId}.js`
  );
  return data;
}

async function getAzureData(pipelineId, account = "certest") {
  const response = await fetch(
    `https://${account}.blob.core.windows.net/pipeline-profiles/${pipelineId}.json`
  );

  if (!response.ok) {
    console.log(`An error has occured: ${response.status}`);
    const data = await fetchErrorBackup(pipelineId);
    return data;
  }

  const data = await response.json();
  return data.data;
}

export function getData(id, loadChartCallback) {
  getAzureData(id).then((data) => {
    removeLoaders();
    loadChartCallback(data);
  });
}
