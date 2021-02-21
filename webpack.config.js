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
    "js/ngtl": "./src/index_files/en/ngtl.js",
    "js/tcpl": "./src/index_files/en/tcpl.js",
    "js/enbridge_mainline": "./src/index_files/en/enbridge_mainline.js",
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
      filename: "html/enbridge_mainline.html",
      chunks: ["js/enbridge_mainline"],
      template: "src/profile_en.html",
      publicPath: "..",
    }),
    new HtmlWebpackPlugin({
      filename: "html/ngtl.html",
      chunks: ["js/ngtl"],
      template: "src/profile_en.html",
      publicPath: "..",
    }),
    new HtmlWebpackPlugin({
      filename: "html/tcpl.html",
      chunks: ["js/tcpl"],
      template: "src/profile_en.html",
      publicPath: "..",
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
