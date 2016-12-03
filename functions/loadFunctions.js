const fs = require("fs-extra-promise");
const path = require("path");

const loadFunctions = (client, baseDir, counts) => new Promise((resolve, reject) => {
  const dir = path.resolve(`${baseDir}./functions/`);
  fs.ensureDirAsync(dir)
  .then(() => {
    fs.readdirAsync(dir)
    .then((files) => {
      files = files.filter(f => f.slice(-3) === ".js");
      let [d, o] = counts;
      try {
        files.forEach((f) => {
          const file = f.split(".");
          if (file[0] === "loadFunctions") return;
          if (file[1] !== "opt") {
            client.funcs[file[0]] = require(`${dir}/${f}`);
            d++;
          } else if (client.config.functions.includes(file[0])) {
            client.funcs[file[0]] = require(`${dir}/${f}`);
            o++;
          }
        });
        resolve([d, o]);
      } catch (e) {
        if (e.code === "MODULE_NOT_FOUND") {
          const module = /'[^']+'/g.exec(e.toString());
          client.funcs.installNPM(module[0].slice(1, -1))
              .then(() => {
                client.funcs.loadDataProviders(client);
              })
              .catch((error) => {
                console.error(error);
                process.exit();
              });
        } else {
          reject(e);
        }
      }
    }).catch(err => reject(err));
  }).catch(err => client.funcs.log(err, "error"));
});

module.exports = client => new Promise((resolve, reject) => {
  const count = [0, 0];
  loadFunctions(client, client.coreBaseDir, count).then((counts) => {
    loadFunctions(client, client.clientBaseDir, counts).then((countss) => {
      const [d, o] = countss;
      client.funcs.log(`Loaded ${d} functions, with ${o} optional.`);
      resolve();
    });
  }).catch(reject);
});
