const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
//   .BundleAnalyzerPlugin;
// const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  // mode: "development",
  mode: "production",
  target: "es5",
  entry: {
    "js/en/ngtl": "./src/index_files/en/ngtl.js",
    "js/en/tcpl": "./src/index_files/en/tcpl.js",
    "js/en/enbridge_mainline": "./src/index_files/en/enbridge_mainline.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    //filename: '[name].[contenthash].js', // adds a unique hash for caching
    publicPath: "/",
  },

  devServer: {
    compress: true,
  },

  // plugins: [
  //   new BundleAnalyzerPlugin()
  // ],

  plugins: [
    new HtmlWebpackPlugin({
      filename: "html/en/enbridge_mainline.html",
      chunks: ["js/en/enbridge_mainline"],
      template: "src/profile_en.html",
      publicPath: "../..",
    }),
    new HtmlWebpackPlugin({
      filename: "html/en/ngtl.html",
      chunks: ["js/en/ngtl"],
      template: "src/profile_en.html",
      publicPath: "../..",
    }),
    new HtmlWebpackPlugin({
      filename: "html/en/tcpl.html",
      chunks: ["js/en/tcpl"],
      template: "src/profile_en.html",
      publicPath: "../..",
    }),
  ],

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
