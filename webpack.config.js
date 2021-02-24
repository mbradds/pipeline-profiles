const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
//   .BundleAnalyzerPlugin;

// deal with multiple html files
function generateHtmlPlugins() {
  const htmlFileNames = [
    "ngtl",
    "enbridge_mainline",
    "tcpl",
    "keystone",
    "trans_mountain",
    "alliance",
    "cochin",
    "westcoast",
    "emera_brunswick",
    "southern_lights",
    "foothills",
    "many_islands",
    "maritimes_northeast",
    "tqm",
    "vector",
    "bakken",
    "norman_wells",
    "express_pipeline",
    "trans_northern",
  ];
  return htmlFileNames.map((name) => {
    return new HtmlWebpackPlugin({
      filename: `en/${name}/${name}.html`,
      chunks: [`en/${name}/${name}`],
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
    "en/ngtl/ngtl": "./src/index_files/en/ngtl.js",
    "en/tcpl/tcpl": "./src/index_files/en/tcpl.js",
    "en/enbridge_mainline/enbridge_mainline":
      "./src/index_files/en/enbridge_mainline.js",
    "en/keystone/keystone": "./src/index_files/en/keystone.js",
    "en/trans_mountain/trans_mountain":
      "./src/index_files/en/trans_mountain.js",
    "en/alliance/alliance": "./src/index_files/en/alliance.js",
    "en/cochin/cochin": "./src/index_files/en/cochin.js",
    "en/westcoast/westcoast": "./src/index_files/en/westcoast.js",
    "en/emera_brunswick/emera_brunswick":
      "./src/index_files/en/emera_brunswick.js",
    "en/southern_lights/southern_lights":
      "./src/index_files/en/southern_lights.js",
    "en/foothills/foothills": "./src/index_files/en/foothills.js",
    "en/many_islands/many_islands": "./src/index_files/en/many_islands.js",
    "en/maritimes_northeast/maritimes_northeast":
      "./src/index_files/en/maritimes_northeast.js",
    "en/tqm/tqm": "./src/index_files/en/tqm.js",
    "en/vector/vector": "./src/index_files/en/vector.js",
    "en/bakken/bakken": "./src/index_files/en/bakken.js",
    "en/norman_wells/norman_wells": "./src/index_files/en/norman_wells.js",
    "en/express_pipeline/express_pipeline":
      "./src/index_files/en/express_pipeline.js",
    "en/trans_northern/trans_northern":
      "./src/index_files/en/trans_northern.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    //filename: '[name].[contenthash].js', // adds a unique hash for caching
    publicPath: "/dist/en/",
  },

  devServer: {
    compress: true,
  },

  plugins: generateHtmlPlugins(),
  // plugins: [
  //   new HtmlWebpackPlugin({
  //     filename: `en/ngtl/ngtl.html`,
  //     chunks: [`ngtl/ngtl.js`, `ngtl/incidents.js`],
  //     template: "./src/profile_en.html",
  //     publicPath: "../..",
  //     minify: false,
  //   }),
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

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        test: /\.js(\?.*)?$/i,
        extractComments: false,
      }),
    ],
  },
};
