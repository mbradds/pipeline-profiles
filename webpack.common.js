import path from "path";
import { fileURLToPath } from "url";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { profileText } from "./src/components/htmlText.js";
import { pm } from "./profileManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const profileWebpackConfig = (function config() {
  const language = ["en", "fr"];

  function htmlWebpack() {
    const html = [];
    const indexLinks = {
      en: { "oil-and-liquids": [], "natural-gas": [] },
      fr: { "oil-and-liquids": [], "natural-gas": [] },
    };
    language.forEach((lang) => {
      for (const [key, value] of Object.entries(pm)) {
        const pageData = { ...pm[key] };
        if (lang === "en") {
          pageData.lang = { en: true, fr: false };
        } else if (lang === "fr") {
          pageData.lang = { en: false, fr: true };
        }
        pageData.text = profileText[lang];
        pageData.text.pipelineName = { id: key };
        pageData.text.commodity = value.commodity;
        pageData.text.tollDescription = profileText.tollsDescription[key][lang];
        const htmlFileName = `${lang}/${value.commodity}/${key}_${lang}.html`;
        indexLinks[lang][value.commodity].push({
          link: htmlFileName,
          name: value.name,
        });
        html.push(
          new HtmlWebpackPlugin({
            page: JSON.parse(JSON.stringify(pageData)),
            filename: htmlFileName,
            chunks: [
              `${lang}/${value.commodity}/js/entry_${key}`,
              `${lang}/profile_code_${lang}`,
              `data/data_${key}`,
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
      }
      // );
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
        for (const [key, value] of Object.entries(pm)) {
          const folderName = key;
          // data entry point
          entryPoints[
            `${section}/${section}_${key}`
          ] = `./src/entry/data/${folderName}.js`;

          // main entry point
          entryPoints[`${lang}/${value.commodity}/js/entry_${key}`] = {
            import: `./src/entry/${lang}/${folderName}/index.js`,
            dependOn: [
              `${section}/${section}_${key}`,
              `${lang}/profile_code_${lang}`,
            ],
          };
        }
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
