const fs = require("fs-extra-promise");
const path = require("path");

const loadProviders = (client, baseDir) => new Promise(async (resolve, reject) => {
  const dir = path.resolve(`${baseDir}./providers/`);
  await fs.ensureDirAsync(dir).catch(err => client.emit("error", client.funcs.newError(err)));
  const files = await client.funcs.getFileListing(client, baseDir, "providers").catch(err => client.emit("error", client.funcs.newError(err)));
  try {
    files.forEach((f) => {
      const props = require(`${f.path}${path.sep}${f.base}`);
      client.providers.set(f.name, props);
      if (props.init) { props.init(client); }
    });
    resolve();
  } catch (e) {
    if (e.code === "MODULE_NOT_FOUND") {
      const module = /'[^']+'/g.exec(e.toString());
      await client.funcs.installNPM(module[0].slice(1, -1))
      .catch((err) => {
        console.error(err);
        process.exit();
      });
    } else {
      reject(e);
    }
  }
});

module.exports = async (client) => {
  client.providers.clear();
  await loadProviders(client, client.coreBaseDir).catch(err => client.emit("error", client.funcs.newError(err)));
  if (client.coreBaseDir !== client.clientBaseDir) {
    await loadProviders(client, client.clientBaseDir).catch(err => client.emit("error", client.funcs.newError(err)));
  }
  client.funcs.log(`Loaded ${client.providers.size} providers.`);
};
