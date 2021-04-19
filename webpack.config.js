const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
//   .BundleAnalyzerPlugin;
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const webpack = require("webpack");

var profileWebpackConfig = (function () {
  const language = ["en", "fr"];

  const htmlFileNames = [
    ["ngtl", "natural-gas"],
    ["alliance", "natural-gas"],
    ["tcpl", "natural-gas"],
    ["westcoast", "natural-gas"],
    ["emera_brunswick", "natural-gas"],
    ["maritimes_northeast", "natural-gas"],
    ["many_islands", "natural-gas"],
    ["tqm", "natural-gas"],
    ["vector", "natural-gas"],
    ["foothills", "natural-gas"],
    ["enbridge_mainline", "oil-and-liquids"],
    ["keystone", "oil-and-liquids"],
    ["trans_mountain", "oil-and-liquids"],
    ["cochin", "oil-and-liquids"],
    ["southern_lights", "oil-and-liquids"],
    ["bakken", "oil-and-liquids"],
    ["norman_wells", "oil-and-liquids"],
    ["express_pipeline", "oil-and-liquids"],
    ["trans_northern", "oil-and-liquids"],
    ["genesis", "oil-and-liquids"],
    ["montreal", "oil-and-liquids"],
    ["westspur", "oil-and-liquids"],
    ["aurora", "oil-and-liquids"],
    ["milk_river", "oil-and-liquids"],
    ["wascana", "oil-and-liquids"],
    ["aurora", "oil-and-liquids"],
  ];

  function htmlWebpack() {
    var html = [];
    language.map((lang) => {
      htmlFileNames.map((name) => {
        var chunks = [
          `${lang}/${name[1]}/js/data_${name[0]}_${lang}`,
          `${lang}/profile_code_${lang}`,
        ];
        html.push(
          new HtmlWebpackPlugin({
            filename: `${lang}/${name[1]}/${name[0]}_${lang}.html`,
            chunks: chunks,
            chunkSortMode: "none",
            template: `src/profile_${lang}.html`,
            minify: {
              collapseWhitespace: false,
              keepClosingSlash: false,
              removeComments: false,
              removeRedundantAttributes: false,
              removeScriptTypeAttributes: false,
              removeStyleLinkTypeAttributes: false,
              useShortDoctype: false,
            },
          })
        );
      });
    });
    return html;
  }

  function entry(sections = ["data"]) {
    const entryPoints = {};
    language.map((lang) => {
      entryPoints[
        `${lang}/profile_code_${lang}`
      ] = `./src/index_files/loadDashboards_${lang}.js`;
      sections.map((section) => {
        htmlFileNames.map((name) => {
          if (["milk_river", "wascana"].includes(name[0])) {
            var folderName = "plains";
          } else {
            var folderName = name[0];
          }
          entryPoints[`${lang}/${name[1]}/js/${section}_${name[0]}_${lang}`] = {
            import: `./src/index_files/${lang}/${folderName}/${section}.js`,
            dependOn: `${lang}/profile_code_${lang}`,
          };
        });
      });
    });

    return entryPoints;
  }

  return { htmlWebpack: htmlWebpack, entry: entry };
})();

module.exports = {
  mode: "development",
  // mode: "production",
  entry: profileWebpackConfig.entry(),
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[contenthash].js",
    publicPath: "/dist/",
  },

  devServer: {
    compress: true,
  },

  devtool: false,

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
    // uncomment these lines below for easier browser debugging in development mode
    // new webpack.SourceMapDevToolPlugin({
    //   filename: "dist/[file].map",
    //   fileContext: "public",
    // }),
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
    usedExports: true,
  },
};
