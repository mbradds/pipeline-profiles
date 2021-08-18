const { merge } = require("webpack-merge");
const webpack = require("webpack");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "development",
  devServer: {
    compress: true,
    inline: true,
    hot: true,
    publicPath: "/",
    // contentBase: "./dist",
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
