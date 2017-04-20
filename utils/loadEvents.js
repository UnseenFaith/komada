const fs = require("fs-extra-promise");
const path = require("path");
const getFileListing = require("../functions/getFileListing.js");
const log = require("../functions/log.js");

let events = require("discord.js/src/util/Constants.js").Events;

events = Object.keys(events).map(k => events[k]);

const loadEvents = (client, baseDir, counts) => new Promise(async (resolve) => {
  const dir = path.resolve(`${baseDir}./events/`);
  await fs.ensureDirAsync(dir).catch(err => client.emit("error", client.funcs.newError(err)));
  let files = await getFileListing(client, baseDir, "events").catch(err => client.emit("error", client.funcs.newError(err)));
  files = files.filter(f => events.includes(f.name));
  files.forEach(async (f) => {
    const filePath = `${f.path}${path.sep}${f.base}`;
    client.on(f.name, (...args) => require(filePath).run(client, ...args));
    counts.count++;

    let codeLang = "JS";
    await Promise.all(client.compiledLangs.map(async (lang) => {
      // Remove the ".js" extension, if there is one, since it's optional.
      const compiledPath = `${filePath.replace(/\.js$/, "")}.${lang.toLowerCase()}`;
      // If there's an equivalent file that ends with the lang, it's a code
      // file that was compiled into JS.
      try {
        await fs.accessAsync(compiledPath);
        codeLang = lang.toUpperCase();
      } catch (e) {
        // Do nothing
      }
    }));
    counts.langCounts[codeLang] = counts.langCounts[codeLang] || 0;
    counts.langCounts[codeLang]++;
  });
  resolve(counts);
});


module.exports = async (client) => {
  let counts = { count: 0, langCounts: {} };
  counts = await loadEvents(client, client.coreBaseDir, counts).catch(err => client.emit("error", client.funcs.newError(err)));
  if (client.coreBaseDir !== client.clientBaseDir) {
    counts = await loadEvents(client, client.clientBaseDir, counts).catch(err => client.emit("error", client.funcs.newError(err)));
  }
  // Load from out dir if different from core and client dirs.
  if (client.outBaseDir &&
      client.outBaseDir !== client.coreBaseDir &&
      client.outBaseDir !== client.clientBaseDir) {
    counts = await loadEvents(client, client.outBaseDir, counts).catch(err => client.emit("error", client.funcs.newError(err)));
  }

  let countMsg = "";
  if (Object.keys(counts.langCounts).length >= 2) {
    countMsg = ` (${Object.entries(counts.langCounts).sort(([lang1], [lang2]) => {
      // JS should appear first
      if (lang1 === "JS") return -1;
      if (lang2 === "JS") return 1;
      // Otherwise sort based on the default comparison order
      if (lang1 === lang2) return 0;
      if ([lang1, lang2].sort()[0] === lang1) return -1;
      return 1;
    }).map(([lang, count]) => `${count} ${lang}`).join(", ")})`;
  }
  log(`Loaded ${counts.count} events${countMsg}.`);
};
