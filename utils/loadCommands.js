const fs = require("fs-extra-promise");
const path = require("path");

const loadCommands = (client, baseDir) => new Promise(async (resolve, reject) => {
  const dir = path.resolve(`${baseDir}./commands/`);
  try {
    await fs.ensureDirAsync(dir).catch(err => client.funcs.log(err, "error"));
    const files = await client.funcs.getFileListing(client, baseDir, "commands").catch(err => client.emit("error", client.funcs.newError(err)));
    const fn = files.map(f => client.funcs.loadSingleCommand(client, `${f.name}`, false, `${f.path}${path.sep}${f.base}`));
    await Promise.all(fn).catch(e => client.funcs.log(e, "error"));
    resolve();
  } catch (e) {
    if (e.code === "MODULE_NOT_FOUND") {
      const module = /'[^']+'/g.exec(e.toString());
      await client.funcs.installNPM(module[0].slice(1, -1))
        .catch((err) => {
          client.funcs.log(err, "error");
          process.exit();
        });
      loadCommands(client, baseDir);
    } else {
      reject(e);
    }
  }
});

module.exports = async (client) => {
  // The base directory of code compiled into JS.
  client.outBaseDir = client.config.outBaseDir;

  client.commands.clear();
  client.aliases.clear();
  await loadCommands(client, client.clientBaseDir).catch(err => client.emit("error", client.funcs.newError(err)));
  if (client.coreBaseDir !== client.clientBaseDir) {
    await loadCommands(client, client.coreBaseDir).catch(err => client.emit("error", client.funcs.newError(err)));
  }
  // Load from out dir if different from core and client dirs.
  if (client.outBaseDir &&
      client.outBaseDir !== client.coreBaseDir &&
      client.outBaseDir !== client.clientBaseDir) {
    await loadCommands(client, client.outBaseDir).catch(err => client.emit("error", client.funcs.newError(err)));
  }

  const langCounts = [];
  client.commands.forEach((c) => {
    const lang = c.help.codeLang;
    langCounts[lang] = langCounts[lang] || 0;
    langCounts[lang]++;
  });
  let countMsg = "";
  if (langCounts.length >= 2) {
    countMsg = ` (${Object.entries(langCounts).sort(([lang1], [lang2]) => {
      // JS should appear first
      if (lang1 === "JS") return -1;
      if (lang2 === "JS") return 1;
      // Otherwise sort based on the default comparison order
      if (lang1 === lang2) return 0;
      if ([lang1, lang2].sort()[0] === lang1) return -1;
      return 1;
    }).map(([lang, count]) => `${count} ${lang}`).join(", ")})`;
  }
  client.funcs.log(`Loaded ${client.commands.size} commands${countMsg}, with ${client.aliases.size} aliases.`);
};
