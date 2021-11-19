import path from "path";
import { fileURLToPath } from "url";
import { merge } from "webpack-merge";
import webpack from "webpack";
import common, { profileWebpackConfig } from "./webpack.common.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const azureHtmlFiles = profileWebpackConfig.htmlAzureWebpack();
// console.log(azureHtmlFiles);
export default merge(common, {
  mode: "production",
  entry: undefined,
  output: {
    path: path.resolve(__dirname, "dist_azure"),
    filename: "[name].[contenthash].js",
  },

  plugins: [...profileWebpackConfig.htmlAzureWebpack()],
});
