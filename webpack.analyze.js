import { merge } from "webpack-merge";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import common from "./webpack.common.js";

export default merge(common, {
  mode: "production",
  devtool: false,
  plugins: [new BundleAnalyzerPlugin()],
  optimization: {
    minimize: true,
    minimizer: [`...`, new CssMinimizerPlugin()],
  },
});
