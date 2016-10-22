const fs = require("fs-extra");
const path = require("path");
let events = require("discord.js/src/util/Constants.js").Events;
events = Object.keys(events).map(k => events[k]);

module.exports = client => {
  //loadEvents(client, client.coreBaseDir);
  loadEvents(client, client.clientBaseDir);
};

const loadEvents = (client, baseDir) => {
  let dir = path.resolve(baseDir + "./functions/events/");
  fs.ensureDir(dir, err => {
    if(err) console.error(err);
    fs.readdir(dir, (err, files) => {
      if(err) console.error(err);
      let e = 0;
      files = files.filter(f => {
        let name = f.split(".")[0];
        return events.includes(name);
      });
      files.forEach(f=> {
        let name = f.split(".")[0];
        client.on(name, (...args) => require(`${dir}/${f}`).run(client, ...args));
        e++;
      });
      client.funcs.log(`Loaded ${e} events`);
    });
  });
};
