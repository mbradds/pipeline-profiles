const HtmlWebpackPlugin = require("html-webpack-plugin");
const profileText = require("../components/htmlText");
const pm = require("../components/profileManager");

const profileWebpackConfig = (function config() {
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
          if (["milk_river", "wascana"].includes(name[0])) {
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

module.exports = profileWebpackConfig;
