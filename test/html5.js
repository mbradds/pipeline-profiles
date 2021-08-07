const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

function findFiles(Directory) {
  fs.readdirSync(Directory).forEach((File) => {
    const absolutePath = path.join(Directory, File);
    if (fs.statSync(absolutePath).isDirectory()) {
      return findFiles(absolutePath);
    }
    if (/.html$/.test(absolutePath)) {
      console.log(`starting HTML5 validation: ${absolutePath}`);
      execSync(`npm exec html-validate ${absolutePath}`);
      console.log(`completed HTML5 validation: ${absolutePath}`);
    }
    return undefined;
  });
}

findFiles("./dist");
