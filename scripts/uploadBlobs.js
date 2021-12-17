import { BlobServiceClient } from "@azure/storage-blob";
import connStrs from "./AZURE_STORAGE_CONNECTION_STRING.json";
import { profileWebpackConfig } from "../webpack.common.js";

const blobServiceClient = BlobServiceClient.fromConnectionString(connStrs.test);
const containerName = "pipeline-profiles";

async function createContainer() {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const createContainerResponse = await containerClient.create();
    console.log(
      `Create container ${containerName} successfully`,
      createContainerResponse.requestId
    );
  } catch (e) {
    console.log(`${containerName} container already exists`);
  }
}

async function uploadBlob(dataObject, blobName) {
  const blobNameExt = `${blobName}.json`;
  const jsonData = JSON.stringify(dataObject);
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobNameExt);
  const uploadBlobResponse = await blockBlobClient.upload(
    jsonData,
    jsonData.length
  );
  console.log(
    `Upload block blob ${blobNameExt} successfully`,
    uploadBlobResponse.requestId
  );
}

async function getEntryData() {
  await Promise.all(
    profileWebpackConfig.htmlFileNames.map(async (pipelineId) => {
      const data = await import(`../src/entry/data/${pipelineId[0]}.js`);
      uploadBlob(data, pipelineId[0]);
    })
  );
}

createContainer().then(() => {
  getEntryData();
});
