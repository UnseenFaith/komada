const fs = require("fs-extra-promise");
const path = require("path");

let events = require("discord.js/src/util/Constants.js").Events;

events = Object.keys(events).map(k => events[k]);

const loadEvents = (client, baseDir, counts) => new Promise(async (resolve) => {
  const dir = path.resolve(`${baseDir}./events/`);
  await fs.ensureDirAsync(dir).catch(err => client.funcs.log(err, "error"));
  let files = await client.funcs.getFileListing(client, baseDir, "events").catch(err => client.funcs.log(err, "error"));
  files = files.filter(f => events.includes(f.name));
  files.forEach((f) => {
    client.on(f.name, (...args) => require(`${dir}/${f}`).run(client, ...args));
    counts++;
  });
  resolve(counts);
});


module.exports = async (client) => {
  let counts = 0;
  counts = await loadEvents(client, client.coreBaseDir, counts).catch(err => client.funcs.log(err, "error"));
  if (client.coreBaseDir !== client.clientBaseDir) {
    counts = await loadEvents(client, client.clientBaseDir, counts).catch(err => client.funcs.log(err, "error"));
  }
  client.funcs.log(`Loaded ${counts} events`);
};
