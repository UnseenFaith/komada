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
  files.forEach((f) => {
    client.on(f.name, (...args) => require(`${f.path}${path.sep}${f.base}`).run(client, ...args));
    counts++;
  });
  resolve(counts);
});


module.exports = async (client) => {
  let counts = 0;
  counts = await loadEvents(client, client.coreBaseDir, counts).catch(err => client.emit("error", client.funcs.newError(err)));
  if (client.coreBaseDir !== client.clientBaseDir) {
    counts = await loadEvents(client, client.clientBaseDir, counts).catch(err => client.emit("error", client.funcs.newError(err)));
  }
  log(`Loaded ${counts} events`);
};
