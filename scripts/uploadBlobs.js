import { BlobServiceClient } from "@azure/storage-blob";
import connStrs from "./AZURE_STORAGE_CONNECTION_STRING.json";
import { data } from "../src/entry/data/Alliance.js";

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

async function uploadBlob(dataObject) {
  const jsonData = JSON.stringify(dataObject);
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobName = "Alliance.json";
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const uploadBlobResponse = await blockBlobClient.upload(
    jsonData,
    jsonData.length
  );
  console.log(
    `Upload block blob ${blobName} successfully`,
    uploadBlobResponse.requestId
  );
}

createContainer();
uploadBlob(data);
