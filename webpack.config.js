const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
//   .BundleAnalyzerPlugin;

var profileWebpackConfig = (function () {
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
    "genesis",
    "montreal",
    "westspur",
    "aurora",
    "milk_river",
    "wascana",
  ];

  function htmlWebpack() {
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

  function entry(language = ["en"]) {
    const entryPoints = {};
    language.map((lang) => {
      htmlFileNames.map((name) => {
        if (["aurora", "milk_river", "wascana"].includes(name)) {
          var scriptName = "plains";
        } else {
          var scriptName = name;
        }
        entryPoints[
          `${lang}/${name}/${name}`
        ] = `./src/index_files/${lang}/${scriptName}.js`;
      });
    });

    return entryPoints;
  }

  return { htmlWebpack: htmlWebpack, entry: entry };
})();

module.exports = {
  // mode: "development",
  mode: "production",
  target: "es5",
  entry: profileWebpackConfig.entry(["en"]),
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    //filename: '[name].[contenthash].js', // adds a unique hash for caching
    publicPath: "/dist/en/",
  },

  devServer: {
    compress: true,
  },

  plugins: profileWebpackConfig.htmlWebpack(),
  //plugins: generateHtmlPlugins(),

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
