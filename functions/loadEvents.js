const fs = require("fs-extra");
const path = require("path");
let events = require("discord.js/src/util/Constants.js").Events;
events = Object.keys(events).map(k => events[k]);

module.exports = client => {
  let count = 0;
  loadEvents(client, client.coreBaseDir, count).then(count => {
    loadEvents(client, client.clientBaseDir, count).then(count => {
      client.funcs.log(`Loaded ${count} events`);
    });
  });
};

const loadEvents = (client, baseDir, count) => {
  return new Promise( (resolve, reject) => {
    let dir = path.resolve(baseDir + "./events/");
    fs.ensureDir(dir, err => {
      if(err) reject(err);
      fs.readdir(dir, (err, files) => {
        if(err) reject(err);
        let e = count;
        files = files.filter(f => {
          let name = f.split(".")[0];
          return events.includes(name);
        });
        files.forEach(f=> {
          let name = f.split(".")[0];
          client.on(name, (...args) => require(`${dir}/${f}`).run(client, ...args));
          e++;
        });
        resolve(e);
      });
    });
  });
};
