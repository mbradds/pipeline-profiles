const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
//   .BundleAnalyzerPlugin;
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

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
        // inject:false,
        chunks: [`en/${name}/${name}`],
        chunkSortMode: "manual",
        template: "src/profile_en.html",
        publicPath: "../..",
        minify: false,
      });
    });
  }

  function entry(language = ["en"]) {
    const entryPoints = {};
    //const entryPoints = { shared: "leaflet" };
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
    publicPath: "/dist/en/",
  },

  devServer: {
    compress: true,
  },

  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src", "main.css"),
          to: path.resolve(__dirname, "dist", "main.css"),
        },
        {
          from: path.resolve(__dirname, "src", "GCWeb"),
          to: path.resolve(__dirname, "dist", "GCWeb"),
        },
        {
          from: path.resolve(__dirname, "src", "wet-boew"),
          to: path.resolve(__dirname, "dist", "wet-boew"),
        },
      ],
    }),
    new CleanWebpackPlugin(),
    // new BundleAnalyzerPlugin(),
  ].concat(profileWebpackConfig.htmlWebpack()),

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
        extractComments: false,
      }),
    ],
  },
};
