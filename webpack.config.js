const path = require("path");
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
//   .BundleAnalyzerPlugin;
// const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  // mode: "development",
  mode: "production",
  target: "es5",
  entry: {
    ngtl_eng: "./src/index_files/ngtl_eng.js",
    tcpl_eng: "./src/index_files/tcpl_eng.js",
    enbridge_mainline_eng: "./src/index_files/enbridge_mainline_eng.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle_[name].js",
    publicPath: "/pipeline-profiles/",
  },

  devServer: {
    compress: true,
  },

  // plugins: [
  //   new BundleAnalyzerPlugin()
  // ],

  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  resolve: {
    extensions: ["*", ".js"],
  },

  // optimization: {
  //   minimize: true,
  //   minimizer: [new TerserPlugin()],
  // },
};
