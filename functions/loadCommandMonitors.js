const fs = require("fs-extra");
const path = require("path");

module.exports = (client) => {
  client.commandMonitors.clear();
  const counts = [0, 0];
  loadCommandMonitors(client, client.coreBaseDir, counts).then((counts) => {
    loadCommandMonitors(client, client.clientBaseDir, counts).then((counts) => {
      const [p, o] = counts;
      client.funcs.log(`Loaded ${p} command monitors, with ${o} optional.`);
    });
  });
};

const loadCommandMonitors = (client, baseDir, counts) => new Promise((resolve, reject) => {
  const dir = path.resolve(`${baseDir}./monitors/`);
  fs.ensureDir(dir, (err) => {
    if (err) console.error(err);
    fs.readdir(dir, (err, files) => {
      if (err) console.error(err);
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
    });
  });
});
