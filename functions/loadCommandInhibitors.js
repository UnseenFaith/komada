const fs = require("fs-extra-promise");
const path = require("path");

module.exports = (client) => {
  client.commandInhibitors.clear();
  const count = [0, 0];
  loadCommandInhibitors(client, client.coreBaseDir, count).then((counts) => {
    loadCommandInhibitors(client, client.clientBaseDir, counts).then((countss) => {
      const [p, o] = countss;
      client.funcs.log(`Loaded ${p} command inhibitors, with ${o} optional.`);
    });
  });
};

const loadCommandInhibitors = (client, baseDir, counts) => new Promise((resolve, reject) => {
  const dir = path.resolve(`${baseDir}./inhibitors/`);
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
            client.commandInhibitors.set(file[0], props);
            p++;
          } else if (client.config.commandInhibitors.includes(file[0])) {
            props = require(`${dir}/${f}`);
            client.commandInhibitors.set(file[0], props);
            o++;
          }
        });
      } catch (e) {
        if (e.code === "MODULE_NOT_FOUND") {
          const module = /'[^']+'/g.exec(e.toString());
          client.funcs.installNPM(module[0].slice(1, -1))
              .then(() => {
                client.funcs.loadCommandInhibitors(client);
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
    })
    .catch((err) => {
      client.funcs.log(err, "error");
    });
  })
.catch(err => client.funcs.log(err, "error"));
});
