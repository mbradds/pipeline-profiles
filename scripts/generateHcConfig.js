import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pm } from "../profileManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function configJson(profileInfo) {
  const highchartConfigJson = [];

  Object.entries(profileInfo).forEach(([key, value]) => {
    const sections = [];
    if (value.sections.traffic.map || value.sections.traffic.noMap) {
      sections.push("Traffic");
    }
    if (value.sections.apportion) {
      sections.push("Apportionment");
    }
    if (value.sections.tolls) {
      sections.push("Tolls");
    }
    if (value.sections.safety) {
      sections.push("safety-Environment");
    }

    highchartConfigJson.push({
      PipelineId: key,
      EnUrl: `en/${value.commodity}/${key}_en.html`,
      FrUrl: `fr/${value.commodity}/${key}_fr.html`,
      Sections: sections,
    });
  });

  const savePath = path.join(__dirname, "..", "dist", "highchartconfig.json");
  fs.writeFile(savePath, JSON.stringify(highchartConfigJson), (err) => {
    if (err) throw err;
  });
  return highchartConfigJson;
}

configJson(pm);
