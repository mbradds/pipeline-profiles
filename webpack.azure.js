import path from "path";
import { fileURLToPath } from "url";
import {
  mergeWithCustomize,
  customizeObject,
  customizeArray,
} from "webpack-merge";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import common, { profileWebpackConfig } from "./webpack.common.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default mergeWithCustomize({
  customizeArray: customizeArray({
    plugins: "replace",
  }),
  customizeObject: customizeObject({
    entry: "replace",
  }),
})(common, {
  mode: "production",
  entry: profileWebpackConfig.entryAzure(),
  output: {
    path: path.resolve(__dirname, "dist_azure"),
  },
  plugins: [
    ...profileWebpackConfig.htmlAzureWebpack(),
    new MiniCssExtractPlugin({
      filename: "css/main.[contenthash].css",
    }),
  ],
});
