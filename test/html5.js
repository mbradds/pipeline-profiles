import path from "path";
import fs from "fs";
import { execSync } from "child_process";

function findFiles(Directory) {
  fs.readdirSync(Directory).forEach((File) => {
    const absolutePath = path.join(Directory, File);
    if (fs.statSync(absolutePath).isDirectory()) {
      return findFiles(absolutePath);
    }
    if (/.html$/.test(absolutePath)) {
      try {
        execSync(`npm exec html-validate ${absolutePath}`);
      } catch (err) {
        console.log(`Error validating: ${absolutePath}`);
        console.log(err);
      }
      console.log(`validated HTML5: ${absolutePath}`);
    }
    return undefined;
  });
}

findFiles("./dist");
