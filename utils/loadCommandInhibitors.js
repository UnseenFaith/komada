const fs = require("fs-extra-promise");
const path = require("path");

const loadCommandInhibitors = (client, baseDir) => new Promise(async (resolve, reject) => {
  const dir = path.resolve(`${baseDir}./inhibitors/`);
  await fs.ensureDirAsync(dir);
  const files = await client.funcs.getFileListing(client, baseDir, "inhibitors").catch(err => client.emit("error", client.funcs.newError(err)));
  try {
    files.forEach((f) => {
      const props = require(`${f.path}${path.sep}${f.base}`);
      if (props.init) props.init(client);
      client.commandInhibitors.set(f.name, props);
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
      client.funcs.loadCommandInhibitors(client);
    } else {
      reject(e);
    }
  }
});

module.exports = async (client) => {
  client.commandInhibitors.clear();
  await loadCommandInhibitors(client, client.coreBaseDir).catch(err => client.emit("error", client.funcs.newError(err)));
  if (client.coreBaseDir !== client.clientBaseDir) {
    await loadCommandInhibitors(client, client.clientBaseDir).catch(err => client.emit("error", client.funcs.newError(err)));
  }
  client.funcs.log(`Loaded ${client.commandInhibitors.size} command inhibitors.`);
};
