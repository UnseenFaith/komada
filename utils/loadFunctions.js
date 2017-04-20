const fs = require("fs-extra-promise");
const path = require("path");

const loadFunctions = (client, baseDir) => new Promise(async (resolve, reject) => {
  const dir = path.resolve(`${baseDir}./functions/`);
  await fs.ensureDirAsync(dir).catch(err => client.emit("error", client.funcs.newError(err)));
  let files = await fs.readdirAsync(dir).catch(err => client.emit("error", client.funcs.newError(err)));
  files = files.filter(f => f.slice(-3) === ".js");
  files = files.filter(file => !client.funcs[file.split(".")[0]]);
  try {
    const fn = files.map(f => new Promise(async (res) => {
      const file = f.split(".");
      if (file[0] === "loadFunctions") res();
      const filePath = `${dir}${path.sep}${f}`;
      client.funcs[file[0]] = require(filePath);
      if (client.funcs[file[0]].init) client.funcs[file[0]].init(client);

      client.funcs[file[0]].codeLang = "JS";
      await Promise.all(client.compiledLangs.map(async (lang) => {
        // Remove the ".js" extension, if there is one, since it's optional.
        const compiledPath = `${filePath.replace(/\.js$/, "")}.${lang.toLowerCase()}`;
        // If there's an equivalent file that ends with the lang, it's a code
        // file that was compiled into JS.
        try {
          await fs.accessAsync(compiledPath);
          client.funcs[file[0]].codeLang = lang.toUpperCase();
        } catch (e) {
          // Do nothing
        }
      }));
      res(delete require.cache[require.resolve(`${dir}${path.sep}${f}`)]);
    }));
    await Promise.all(fn).catch(e => client.funcs.log(e, "error"));
    resolve();
  } catch (e) {
    if (e.code === "MODULE_NOT_FOUND") {
      const module = /'[^']+'/g.exec(e.toString());
      await client.funcs.installNPM(module[0].slice(1, -1))
      .catch((error) => {
        console.error(error);
        process.exit();
      });
      loadFunctions(client, baseDir);
    } else {
      reject(e);
    }
  }
});

module.exports = client => new Promise(async (resolve, reject) => {
  await loadFunctions(client, client.clientBaseDir).catch(reject);
  if (client.coreBaseDir !== client.clientBaseDir) {
    await loadFunctions(client, client.coreBaseDir).catch(reject);
  }
  // Load from out dir if different from core and client dirs.
  if (client.outBaseDir &&
      client.outBaseDir !== client.coreBaseDir &&
      client.outBaseDir !== client.clientBaseDir) {
    await loadFunctions(client, client.outBaseDir).catch(reject);
  }

  const langCounts = [];
  client.funcs.forEach((f) => {
    const lang = f.codeLang;
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
  client.funcs.log(`Loaded ${Object.keys(client.funcs).length} functions${countMsg}.`);
  resolve();
});
