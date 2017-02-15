const fs = require("fs-extra-promise");
const path = require("path");

const loadFunctions = (client, baseDir) => new Promise(async (resolve, reject) => {
  const dir = path.resolve(`${baseDir}./functions/`);
  await fs.ensureDirAsync(dir).catch(err => client.emit("error", client.funcs.newError(err)));
  let files = await fs.readdirAsync(dir).catch(err => client.emit("error", client.funcs.newError(err)));
  files = files.filter(f => f.slice(-3) === ".js");
  try {
    files.forEach((f) => {
      const file = f.split(".");
      if (file[0] === "loadFunctions") return;
      client.funcs[file[0]] = require(`${dir}${path.sep}${f}`);
      // if (client.funcs[file[0]].init) client.funcs[file[0]].init(client);
    });
    resolve();
  } catch (e) {
    if (e.code === "MODULE_NOT_FOUND") {
      const module = /'[^']+'/g.exec(e.toString());
      await client.funcs.installNPM(module[0].slice(1, -1))
      .catch((error) => {
        console.error(error);
        process.exit();
      });
      loadFunctions(client);
    } else {
      reject(e);
    }
  }
});

module.exports = client => new Promise(async (resolve, reject) => {
  await loadFunctions(client, client.coreBaseDir).catch(reject);
  if (client.coreBaseDir !== client.clientBaseDir) {
    await loadFunctions(client, client.clientBaseDir).catch(reject);
  }
  client.funcs.log(`Loaded ${Object.keys(client.funcs).length} functions.`);
  resolve();
});
