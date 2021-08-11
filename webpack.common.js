const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
var HtmlWebpackPlugin = require("html-webpack-plugin");
var InlineChunkHtmlPlugin = require("react-dev-utils/InlineChunkHtmlPlugin");
const profileText = require("./src/components/htmlText");
const pm = require("./src/components/profileManager");

const profileWebpackConfig = (function config() {
  const language = ["en", "fr"];

  const htmlFileNames = [
    ["NGTL", "natural-gas"],
    ["Alliance", "natural-gas"],
    ["TCPL", "natural-gas"],
    ["Westcoast", "natural-gas"],
    ["Brunswick", "natural-gas"],
    ["MNP", "natural-gas"],
    ["ManyIslands", "natural-gas"],
    ["TQM", "natural-gas"],
    ["Vector", "natural-gas"],
    ["Foothills", "natural-gas"],
    ["EnbridgeMainline", "oil-and-liquids"],
    ["Keystone", "oil-and-liquids"],
    ["TransMountain", "oil-and-liquids"],
    ["Cochin", "oil-and-liquids"],
    ["SouthernLights", "oil-and-liquids"],
    ["EnbridgeBakken", "oil-and-liquids"],
    ["NormanWells", "oil-and-liquids"],
    ["Express", "oil-and-liquids"],
    ["TransNorthern", "oil-and-liquids"],
    ["Genesis", "oil-and-liquids"],
    ["Montreal", "oil-and-liquids"],
    ["Westspur", "oil-and-liquids"],
    ["Aurora", "oil-and-liquids"],
    ["MilkRiver", "oil-and-liquids"],
    ["Wascana", "oil-and-liquids"],
  ];

  function htmlWebpack(returnPaths = false) {
    const html = [];
    const htmlPathsForTest = [];
    language.forEach((lang) => {
      htmlFileNames.forEach((name) => {
        const pageData = { ...pm[name[0]] };
        if (lang === "en") {
          pageData.lang = { en: true, fr: false };
        } else if (lang === "fr") {
          pageData.lang = { en: false, fr: true };
        }
        pageData.text = profileText[lang];
        pageData.text.pipelineName = { id: name[0] };
        pageData.text.commodity = name[1];
        const htmlFileName = `${lang}/${name[1]}/${name[0]}_${lang}.html`;
        htmlPathsForTest.push(`dist/${htmlFileName}`);
        html.push(
          new HtmlWebpackPlugin({
            page: JSON.parse(JSON.stringify(pageData)),
            filename: htmlFileName,
            chunks: [
              `${lang}/${name[1]}/js/entry_${name[0]}`,
              `${lang}/profile_code_${lang}`,
              `data/data_${name[0]}`,
            ],
            chunksSortMode: "auto",
            template: `src/components/profile.hbs`,
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
    if (returnPaths) {
      return htmlPathsForTest;
    }
    return html;
  }

  function entry(sections = ["data"]) {
    const entryPoints = {};
    language.forEach((lang) => {
      // order of script addition to "entryPoints" matters for chunkSortMode
      sections.forEach((section) => {
        htmlFileNames.forEach((name) => {
          let folderName = name[0];
          if (["MilkRiver", "Wascana"].includes(name[0])) {
            folderName = "plains";
          }
          // data entry point
          entryPoints[
            `${section}/${section}_${name[0]}`
          ] = `./src/entry/data/${folderName}.js`;

          // main entry point
          entryPoints[`${lang}/${name[1]}/js/entry_${name[0]}`] = {
            import: `./src/entry/${lang}/${folderName}/index.js`,
            dependOn: [
              `${section}/${section}_${name[0]}`,
              `${lang}/profile_code_${lang}`,
            ],
          };
        });
      });
      entryPoints[
        `${lang}/profile_code_${lang}`
      ] = `./src/entry/loadDashboards_${lang}.js`;
    });

    return entryPoints;
  }

  return { htmlWebpack, entry };
})();

module.exports = {
  entry: profileWebpackConfig.entry(),
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[contenthash].js",
    publicPath: "/dist/",
  },

  plugins: [
    new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/entry/]),
    new CopyWebpackPlugin({
      patterns: [
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
    ...profileWebpackConfig.htmlWebpack(),
    new MiniCssExtractPlugin({
      filename: "css/main.[contenthash].css",
    }),
  ],

  resolve: {
    extensions: ["*", ".js"],
  },

  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.css$/i,
        exclude: /node_modules/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.css$/,
        include: /node_modules/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader", options: { url: false } },
        ],
      },
      {
        test: /\.png$/,
        use: {
          loader: "file-loader",
          options: {
            publicPath: "../../images",
            outputPath: "images",
            name: "[name].png",
          },
        },
        type: "javascript/auto",
      },
      {
        test: /\.hbs$/,
        loader: "handlebars-loader",
        options: {
          precompileOptions: {
            noEscape: true,
            strict: true,
            knownHelpersOnly: false,
          },
          runtime: path.resolve(__dirname, "src/components/helpers.js"),
          // knownHelpersOnly: false,
        },
      },
    ],
  },

  optimization: {
    usedExports: true,
    runtimeChunk: {
      name: "shared/runtime",
    },
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/](leaflet|highcharts)[\\/]/,
          chunks: "initial",
          reuseExistingChunk: true,
          enforce: true,
          filename: "shared/vendor.[contenthash].js",
        },
      },
    },
  },
};
