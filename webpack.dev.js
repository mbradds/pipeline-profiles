import { merge } from "webpack-merge";
import webpack from "webpack";
import common from "./webpack.common.js";

export default merge(common, {
  mode: "development",
  devServer: {
    compress: true,
    hot: true,
  },

  devtool: false,

  plugins: [
    new webpack.SourceMapDevToolPlugin({
      filename: "dist/[file].map",
      fileContext: "public",
    }),
  ],
  optimization: {
    minimize: false,
  },
});
