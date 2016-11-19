const fs = require("fs-extra");
const path = require("path");

let events = require("discord.js/src/util/Constants.js").Events;

events = Object.keys(events).map(k => events[k]);

const loadEvents = (client, baseDir, count) => new Promise((resolve, reject) => {
  const dir = path.resolve(`${baseDir}./events/`);
  fs.ensureDir(dir, (err) => {
    if (err) reject(err);
    fs.readdir(dir, (error, files) => {
      if (error) reject(err);
      let e = count;
      files = files.filter((f) => {
        const name = f.split(".")[0];
        return events.includes(name);
      });
      files.forEach((f) => {
        const name = f.split(".")[0];
        client.on(name, (...args) => require(`${dir}/${f}`).run(client, ...args));
        e++;
      });
      resolve(e);
    });
  });
});

module.exports = (client) => {
  const count = 0;
  loadEvents(client, client.coreBaseDir, count).then((counts) => {
    loadEvents(client, client.clientBaseDir, counts).then((countss) => {
      client.funcs.log(`Loaded ${countss} events`);
    });
  });
};
