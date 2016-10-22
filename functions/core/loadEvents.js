const fs = require("fs");
const path = require("path");
let events = require("discord.js/src/util/Constants.js").Events;
events = Object.keys(events).map(k => events[k]);

const dir = path.resolve(__dirname + "/../events/");

module.exports = client => {
  fs.readdir(dir, (err, files) => {
    if(err) console.error(err);
    let e = 0;
    files = files.filter(f => {
      let name = f.split(".")[0];
      return events.includes(name);
    });
    files.forEach(f=> {
      let name = f.split(".")[0];
      client.on(name, (...args) => require(`../events/${f}`).run(client, ...args));
      e++;
    });
    client.funcs.log(`Loaded ${e} events`);
  });
};
