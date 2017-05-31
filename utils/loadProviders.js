const fs = require("fs-extra");
const path = require("path");

const loadProviders = (client, baseDir) => new Promise(async (resolve, reject) => {
  const dir = path.resolve(`${baseDir}./providers/`);
  await fs.ensureDir(dir).catch(err => client.emit("error", client.funcs.newError(err)));
  let files = await client.funcs.getFileListing(client, baseDir, "providers").catch(err => client.emit("error", client.funcs.newError(err)));
  files = files.filter(file => !client.providers.get(file.name));
  try {
    const fn = files.map(f => new Promise((res) => {
      const props = require(`${f.path}${path.sep}${f.base}`);
      if (props.init) props.init(client);
      client.providers.set(f.name, props);
      res(delete require.cache[require.resolve(`${f.path}${path.sep}${f.base}`)]);
    }));
    await Promise.all(fn).catch(e => client.funcs.log(e, "error"));
    resolve();
  } catch (e) {
    if (e.code === "MODULE_NOT_FOUND") {
      const module = /'[^']+'/g.exec(e.toString());
      await client.funcs.installNPM(module[0].slice(1, -1))
        .catch((err) => {
          console.error(err);
          process.exit();
        });
      loadProviders(client, baseDir);
    } else {
      reject(e);
    }
  }
});

module.exports = async (client) => {
  client.providers.clear();
  await loadProviders(client, client.clientBaseDir).catch(err => client.emit("error", client.funcs.newError(err)));
  if (client.coreBaseDir !== client.clientBaseDir) {
    await loadProviders(client, client.coreBaseDir).catch(err => client.emit("error", client.funcs.newError(err)));
  }
  client.funcs.log(`Loaded ${client.providers.size} providers.`);
};
