const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
// const webpack = require("webpack");
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
//   .BundleAnalyzerPlugin;

const profileManager = {
  ngtl: {
    sections: { traffic: true, apportion: false, safety: true },
  },
  alliance: {
    sections: { traffic: true, apportion: false, safety: true },
  },
  tcpl: {
    sections: { traffic: true, apportion: false, safety: true },
  },
  westcoast: {
    sections: { traffic: true, apportion: false, safety: true },
  },
  emera_brunswick: {
    sections: { traffic: false, apportion: false, safety: true },
  },
  maritimes_northeast: {
    sections: { traffic: true, apportion: false, safety: true },
  },
  many_islands: {
    sections: { traffic: true, apportion: false, safety: true },
  },
  tqm: {
    sections: { traffic: true, apportion: false, safety: true },
  },
  vector: {
    sections: { traffic: true, apportion: false, safety: true },
  },
  foothills: {
    sections: { traffic: true, apportion: false, safety: true },
  },
  enbridge_mainline: {
    sections: { traffic: true, apportion: true, safety: true },
  },
  keystone: {
    sections: { traffic: true, apportion: true, safety: true },
  },
  trans_mountain: {
    sections: { traffic: true, apportion: true, safety: true },
  },
  cochin: {
    sections: { traffic: true, apportion: true, safety: true },
  },
  southern_lights: {
    sections: { traffic: false, apportion: false, safety: true },
  },
  bakken: {
    sections: { traffic: false, apportion: false, safety: true },
  },
  norman_wells: {
    sections: { traffic: true, apportion: true, safety: true },
  },
  express_pipeline: {
    sections: { traffic: false, apportion: false, safety: true },
  },
  trans_northern: {
    sections: { traffic: true, apportion: false, safety: true },
  },
  genesis: {
    sections: { traffic: false, apportion: false, safety: true },
  },
  montreal: {
    sections: { traffic: false, apportion: false, safety: true },
  },
  westpur: {
    sections: { traffic: false, apportion: false, safety: true },
  },
  aurora: {
    sections: { traffic: false, apportion: false, safety: true },
  },
  milk_river: {
    sections: { traffic: false, apportion: false, safety: true },
  },
  wascana: {
    sections: { traffic: false, apportion: false, safety: true },
  },
};

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
  ];

  function htmlWebpack() {
    var html = [];
    language.forEach((lang) => {
      htmlFileNames.forEach((name) => {
        // const pageData = Object.assign({}, name[2]);
        const pageData = Object.assign({}, profileManager[name[0]]);
        if (lang === "en") {
          pageData.lang = { en: true, fr: false };
        } else if (lang === "fr") {
          pageData.lang = { en: false, fr: true };
        }
        html.push(
          new HtmlWebpackPlugin({
            page: pageData,
            filename: `${lang}/${name[1]}/${name[0]}_${lang}.html`,
            chunks: [
              `${lang}/profile_code_${lang}`,
              `${lang}/${name[1]}/js/data_${name[0]}_${lang}`,
            ],
            chunksSortMode: "auto",
            template: `src/profile_en.hbs`,
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
      // order of script addition to "entryPoints" matters for chunkSortMode
      entryPoints[
        `${lang}/profile_code_${lang}`
      ] = `./src/index_files/loadDashboards_${lang}.js`;
    });

    return entryPoints;
  }

  return { htmlWebpack: htmlWebpack, entry: entry };
})();

module.exports = {
  // mode: "development",
  mode: "production",
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
      { test: /\.hbs$/, loader: "handlebars-loader" },
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
