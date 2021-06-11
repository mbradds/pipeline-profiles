const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
// const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

module.exports = merge(common, {
  mode: "production",
  devtool: false,
  // plugins: [new BundleAnalyzerPlugin()],
  optimization: {
    minimize: true,
    minimizer: [`...`, new CssMinimizerPlugin()],
  },
});
