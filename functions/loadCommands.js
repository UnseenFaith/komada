const fs = require("fs-extra-promise");
const path = require("path");

const loadCommands = (client, baseDir) => new Promise(async (resolve, reject) => {
  const dir = path.resolve(`${baseDir}./commands/`);
  try {
    await fs.ensureDirAsync(dir).catch(err => client.funcs.log(err, "error"));
    const files = await client.funcs.getFileListing(client, baseDir, "commands").catch(err => client.funcs.log(err, "error"));
    files.forEach(async (f) => {
      await client.funcs.loadSingleCommand(client, `${f.name}`, false, `${f.path}${path.sep}${f.base}`).catch(err => client.funcs.log(err, "error"));
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
      client.funcs.loadCommands(client);
    } else {
      reject(e);
    }
  }
});

module.exports = async (client) => {
  client.commands.clear();
  client.aliases.clear();
  await loadCommands(client, client.coreBaseDir).catch(err => client.funcs.log(err, "error"));
  if (client.coreBaseDir !== client.clientBaseDir) {
    await loadCommands(client, client.clientBaseDir).catch(err => client.funcs.log(err, "error"));
  }
  client.funcs.log(`Loaded ${client.commands.size} commands, with ${client.aliases.size} aliases.`);
};
