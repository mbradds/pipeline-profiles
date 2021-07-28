const { execSync } = require("child_process");
const profileWebpackConfig = require("../src/entry/webpackEntry");

const htmlDistFiles = profileWebpackConfig.htmlWebpack(true);

htmlDistFiles.forEach((file) => {
  console.log(`starting HTML5 validation: ${file}`);
  execSync(`npm exec html-validate ${file}`);
  console.log(`completed HTML5 validation: ${file}`);
});
