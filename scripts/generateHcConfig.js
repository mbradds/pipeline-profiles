import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pm } from "../src/components/profileManager.js";
import { profileWebpackConfig } from "../webpack.common.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function configJson(profileInfo) {
  const highchartConfigJson = [];
  Object.entries(profileInfo).forEach(
    // const commodityExt = profileWebpackConfig.htmlFile

    ([key, value]) =>
      highchartConfigJson.push({
        PipelineId: key,
        EnUrl: "en/natural-gas/Alliance_en.html",
        FrUrl: "fr/natural-gas/Alliance_fr.html",
      })
    // console.log(key, value)
  );
  // console.log(highchartConfigJson);
  const savePath = path.join(__dirname, "..", "dist", "highchartconfig.json");
  console.log(savePath);
  fs.writeFile(savePath, JSON.stringify(highchartConfigJson), (err) => {
    if (err) throw err;
  });
  return highchartConfigJson;
}

configJson(pm);
