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
    "emera_brunswick.html",
    "southern_lights.html",
    "foothills.html",
    "many_islands.html",
    "maritimes_northeast.html",
    "tqm.html",
    "vector.html",
    "bakken.html",
    "norman_wells.html",
    "express_pipeline.html",
    "trans_northern.html",
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
  target: "es5",
  entry: {
    "js/en/ngtl": "./src/index_files/en/ngtl.js",
    "js/en/tcpl": "./src/index_files/en/tcpl.js",
    "js/en/enbridge_mainline": "./src/index_files/en/enbridge_mainline.js",
    "js/en/keystone": "./src/index_files/en/keystone.js",
    "js/en/trans_mountain": "./src/index_files/en/trans_mountain.js",
    "js/en/alliance": "./src/index_files/en/alliance.js",
    "js/en/cochin": "./src/index_files/en/cochin.js",
    "js/en/westcoast": "./src/index_files/en/westcoast.js",
    "js/en/emera_brunswick": "./src/index_files/en/emera_brunswick.js",
    "js/en/southern_lights": "./src/index_files/en/southern_lights.js",
    "js/en/foothills": "./src/index_files/en/foothills.js",
    "js/en/many_islands": "./src/index_files/en/many_islands.js",
    "js/en/maritimes_northeast": "./src/index_files/en/maritimes_northeast.js",
    "js/en/tqm": "./src/index_files/en/tqm.js",
    "js/en/vector": "./src/index_files/en/vector.js",
    "js/en/bakken": "./src/index_files/en/bakken.js",
    "js/en/norman_wells": "./src/index_files/en/norman_wells.js",
    "js/en/express_pipeline": "./src/index_files/en/express_pipeline.js",
    "js/en/trans_northern": "./src/index_files/en/trans_northern.js",
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
