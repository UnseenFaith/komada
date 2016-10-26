const path = require("path");
const fs = require("fs-extra");

module.exports = (client, baseDir, type) => {
  return new Promise( (resolve, reject) => {
    let dir = path.resolve(`${baseDir}/${type}/`);
    let files = [];
    try {
      fs.walk(dir)
      .on("data", (item) => {
        let fileinfo = path.parse(item.path);
        if(!fileinfo.ext) return;
        files.push({
          path: fileinfo.dir,
          name: fileinfo.name,
          base: fileinfo.base,
          ext: fileinfo.ext
        });
      })
      .on("end", () => {
        //client.funcs.log(`Modules: ${categories.join(",")}`);
        resolve(files);
      })
      .on("errors", (root, nodeStatsArray, next) => {
        nodeStatsArray.forEach(function (n) {
          client.funcs.log("[ERROR] " + n.name, "error");
          client.funcs.log(n.error.message || (n.error.code + ": " + n.error.path), "error");
        });
        next();
      });
    } catch (e) {
      if (e.code === "MODULE_NOT_FOUND") {
        let module = /'[^']+'/g.exec(e.toString());
        client.funcs.installNPM(module[0].slice(1,-1))
        .then(() => {
          client.funcs.loadCommands(client);
        })
        .catch(e => {
          console.error(e);
          process.exit();
        });
      } else {
        reject(e);
      }
    }
  });
};
