const path = require("path");
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
//   .BundleAnalyzerPlugin;

module.exports = {
  mode: "production",
  target: "es5",
  entry: {
    ngtl_eng: "./src/index_files/ngtl_eng.js",
    ngtl_fra: "./src/index_files/ngtl_fra.js",
  },
  output: {
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
