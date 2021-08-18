const { merge } = require("webpack-merge");
const webpack = require("webpack");
const common = require("./webpack.common.js");

module.exports = merge(common, {
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
