const path = require("path");
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
//   .BundleAnalyzerPlugin;

module.exports = {
  mode: "production",
  entry: {
    ngtl_eng: "./src/index_files/ngtl_eng.js",
  },
  output: {
    publicPath: "/pipeline-profiles/",
    path: path.resolve(__dirname, "dist"),
    filename: "bundle_[name].js",
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
};
