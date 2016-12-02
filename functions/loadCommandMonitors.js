const fs = require("fs-extra");
const path = require("path");

module.exports = (client) => {
  client.commandMonitors.clear();
  const count = [0, 0];
  loadCommandMonitors(client, client.coreBaseDir, count).then((counts) => {
    loadCommandMonitors(client, client.clientBaseDir, counts).then((countss) => {
      const [p, o] = countss;
      client.funcs.log(`Loaded ${p} command monitors, with ${o} optional.`);
    });
  });
};

const loadCommandMonitors = (client, baseDir, counts) => new Promise((resolve, reject) => {
  const dir = path.resolve(`${baseDir}./monitors/`);
  fs.ensureDirAsync(dir)
  .then(() => {
    fs.readdirAsync(dir)
    .then((files) => {
      let [p, o] = counts;
      try {
        files = files.filter(f => f.slice(-3) === ".js");
        files.forEach((f) => {
          const file = f.split(".");
          let props;
          if (file[1] !== "opt") {
            props = require(`${dir}/${f}`);
            client.commandMonitors.set(file[0], props);
            p++;
          } else if (client.config.commandMonitors.includes(file[0])) {
            props = require(`${dir}/${f}`);
            client.commandMonitors.set(file[0], props);
            o++;
          }
        });
      } catch (e) {
        if (e.code === "MODULE_NOT_FOUND") {
          const module = /'[^']+'/g.exec(e.toString());
          client.funcs.installNPM(module[0].slice(1, -1))
              .then(() => {
                client.funcs.loadCommandMonitors(client);
              })
              .catch((e) => {
                console.error(e);
                process.exit();
              });
        } else {
          reject(e);
        }
      }
      resolve([p, o]);
    }).catch(err => client.funcs.log(err, "error"));
  })
  .catch(err => client.funcs.log(err, "error"));
});
