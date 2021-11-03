import path from "path";
import { fileURLToPath } from "url";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { profileText } from "./src/components/htmlText.js";
import { pm } from "./src/components/profileManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const profileWebpackConfig = (function config() {
  const language = ["en", "fr"];

  const htmlFileNames = [
    ["NGTL", "natural-gas", "NOVA Gas Transmission Ltd. (NGTL)"],
    ["Alliance", "natural-gas", "Alliance Pipeline"],
    ["TCPL", "natural-gas", "TransCanada’s Canadian Mainline"],
    ["Westcoast", "natural-gas", "Westcoast Pipeline"],
    ["Brunswick", "natural-gas", "Emera Brunswick"],
    ["MNP", "natural-gas", "Maritimes &amp; Northeast"],
    ["ManyIslands", "natural-gas", "Many Islands"],
    ["TQM", "natural-gas", "Trans Québec &amp; Maritimes"],
    ["Vector", "natural-gas", "Vector"],
    ["Foothills", "natural-gas", "Foothills"],
    ["EnbridgeMainline", "oil-and-liquids", "Enbridge Canadian Mainline"],
    ["Keystone", "oil-and-liquids", "Keystone Pipeline"],
    ["TransMountain", "oil-and-liquids", "Trans Mountain"],
    ["Cochin", "oil-and-liquids", "Cochin Pipeline"],
    ["SouthernLights", "oil-and-liquids", "Southern Lights"],
    ["EnbridgeBakken", "oil-and-liquids", "Enbridge Bakken"],
    ["NormanWells", "oil-and-liquids", "Enbridge Norman Wells"],
    ["Express", "oil-and-liquids", "Express"],
    ["TransNorthern", "oil-and-liquids", "Trans-Northern"],
    ["Genesis", "oil-and-liquids", "Genesis"],
    ["Montreal", "oil-and-liquids", "Montreal"],
    ["Westspur", "oil-and-liquids", "Westspur"],
    ["Aurora", "oil-and-liquids", "Aurora"],
    ["MilkRiver", "oil-and-liquids", "Milk River"],
    ["Wascana", "oil-and-liquids", "Wascana"],
  ];

  function htmlWebpack() {
    const html = [];
    const indexLinks = {
      en: { "oil-and-liquids": [], "natural-gas": [] },
      fr: { "oil-and-liquids": [], "natural-gas": [] },
    };
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
        pageData.text.tollDescription =
          profileText.tollsDescription[name[0]][lang];
        const htmlFileName = `${lang}/${name[1]}/${name[0]}_${lang}.html`;
        indexLinks[lang][name[1]].push({ link: htmlFileName, name: name[2] });
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
    html.push(
      new HtmlWebpackPlugin({
        page: JSON.parse(JSON.stringify(indexLinks)),
        filename: "index.html",
        template: "src/components/index.hbs",
        inject: false,
      })
    );
    return html;
  }

  function entry(sections = ["data"]) {
    const entryPoints = {};
    language.forEach((lang) => {
      // order of script addition to "entryPoints" matters for chunkSortMode
      sections.forEach((section) => {
        htmlFileNames.forEach((name) => {
          let folderName = name[0];
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

export default {
  entry: profileWebpackConfig.entry(),
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[contenthash].js",
  },

  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src", "GCWeb"),
          to: path.resolve(__dirname, "dist", "GCWeb"),
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
        sideEffects: true,
      },
      {
        test: /\.css$/,
        include: /node_modules/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader", options: { url: false } },
        ],
        sideEffects: true,
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
          runtime: path.resolve(__dirname, "src/components/helpers.cjs"),
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
