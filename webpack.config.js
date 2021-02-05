const path = require("path");
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
//   .BundleAnalyzerPlugin;
// const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: "production",
  entry: {
    ngtl_eng: "./src/index_files/ngtl_eng.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle_[name].js",
    publicPath: "/pipeline-profiles/",
  },

  target: "node",

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
