const fs = require("fs-extra-promise");
const path = require("path");

const loadFunctions = (client, baseDir, counts) => new Promise((resolve, reject) => {
  const dir = path.resolve(`${baseDir}./functions/`);
  fs.ensureDirAsync(dir)
  .then(() => {
    fs.readdirAsync(dir)
    .then((files) => {
      files = files.filter(f => f.slice(-3) === ".js");
      let c = counts;
      try {
        files.forEach((f) => {
          const file = f.split(".");
          if (file[0] === "loadFunctions") return;
          client.funcs[file[0]] = require(`${dir}/${f}`);
          if (client.funcs[file[0]].init) {
            client.funcs[file[0]].init(client);
          }
          c++;
        });
        resolve(c);
      } catch (e) {
        if (e.code === "MODULE_NOT_FOUND") {
          const module = /'[^']+'/g.exec(e.toString());
          client.funcs.installNPM(module[0].slice(1, -1))
              .then(() => {
                client.funcs.loadFunctions(client);
              })
              .catch((error) => {
                console.error(error);
                process.exit();
              });
        } else {
          reject(e);
        }
      }
    }).catch(err => client.funcs.log(err, "error"));
  }).catch(err => client.funcs.log(err, "error"));
});

module.exports = client => new Promise((resolve, reject) => {
  const count = 0;
  if (client.coreBaseDir !== client.clientBaseDir) {
    loadFunctions(client, client.coreBaseDir, count).then((counts) => {
      loadFunctions(client, client.clientBaseDir, counts).then((countss) => {
        const c = countss;
        client.funcs.log(`Loaded ${c} functions.`);
        resolve();
      });
    }).catch(reject);
  } else {
    loadFunctions(client, client.coreBaseDir, count).then((counts) => {
      const c = counts;
      client.funcs.log(`Loaded ${c} functions.`);
      resolve();
    }).catch(reject);
  }
});
