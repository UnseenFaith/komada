const fs = require("fs-extra-promise");
const path = require("path");

const loadProviders = (client, baseDir) => new Promise(async (resolve, reject) => {
  const dir = path.resolve(`${baseDir}./providers/`);
  await fs.ensureDirAsync(dir).catch(err => client.emit("error", client.funcs.newError(err)));
  let files = await client.funcs.getFileListing(client, baseDir, "providers").catch(err => client.emit("error", client.funcs.newError(err)));
  files = files.filter(file => !client.providers.get(file.name));
  try {
    const fn = files.map(f => new Promise(async (res) => {
      const filePath = `${f.path}${path.sep}${f.base}`;
      const props = require(filePath);
      if (props.init) props.init(client);

      props.codeLang = "JS";
      await Promise.all(client.compiledLangs.map(async (lang) => {
        // Remove the ".js" extension, if there is one, since it's optional.
        const compiledPath = `${filePath.replace(/\.js$/, "")}.${lang.toLowerCase()}`;
        // If there's an equivalent file that ends with the lang, it's a code
        // file that was compiled into JS.
        try {
          await fs.accessAsync(compiledPath);
          props.codeLang = lang.toUpperCase();
        } catch (e) {
          // Do nothing
        }
      }));
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
  // Load from out dir if different from core and client dirs.
  if (client.outBaseDir &&
      client.outBaseDir !== client.coreBaseDir &&
      client.outBaseDir !== client.clientBaseDir) {
    await loadProviders(client, client.outBaseDir).catch(err => client.emit("error", client.funcs.newError(err)));
  }

  const langCounts = [];
  client.providers.forEach((p) => {
    const lang = p.codeLang;
    langCounts[lang] = langCounts[lang] || 0;
    langCounts[lang]++;
  });
  let countMsg = "";
  if (Object.keys(langCounts).length >= 2) {
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
  client.funcs.log(`Loaded ${client.providers.size} providers${countMsg}.`);
};
