const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
//   .BundleAnalyzerPlugin;
// const TerserPlugin = require("terser-webpack-plugin");

// deal with multiple html files
function generateHtmlPlugins() {
  const htmlFileNames = [
    "enbridge_mainline.html",
    "ngtl.html",
    "tcpl.html",
    "keystone.html",
    "trans_mountain.html",
    "alliance.html",
    "cochin.html",
    "westcoast.html",
  ];
  return htmlFileNames.map((name) => {
    return new HtmlWebpackPlugin({
      filename: `html/en/${name}`,
      chunks: [`js/en/${name.split(".")[0]}`],
      template: "src/profile_en.html",
      publicPath: "../..",
      minify: false,
    });
  });
}

module.exports = {
  // mode: "development",
  mode: "production",
  // target: "es5",
  entry: {
    "js/en/ngtl": "./src/index_files/en/ngtl.js",
    "js/en/tcpl": "./src/index_files/en/tcpl.js",
    "js/en/enbridge_mainline": "./src/index_files/en/enbridge_mainline.js",
    "js/en/keystone": "./src/index_files/en/keystone.js",
    "js/en/trans_mountain": "./src/index_files/en/trans_mountain.js",
    "js/en/alliance": "./src/index_files/en/alliance.js",
    "js/en/cochin": "./src/index_files/en/cochin.js",
    "js/en/westcoast": "./src/index_files/en/westcoast.js",
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

  plugins: generateHtmlPlugins(),

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

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        test: /\.js(\?.*)?$/i,
      }),
    ],
  },
};
