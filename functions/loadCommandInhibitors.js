const fs = require("fs-extra");
const path = require("path");

module.exports = client => {
  loadCommandInhibitors(client, client.coreBaseDir);
  loadCommandInhibitors(client, client.clientBaseDir);
};

const loadCommandInhibitors = (client, baseDir) => {
  return new Promise( (resolve, reject) => {
    let dir = path.resolve(baseDir + "./inhibitors/");
    fs.ensureDir(dir, err => {
      if (err) console.error(err);
      fs.readdir(dir, (err, files) => {
        if (err) console.error(err);
        let [p, o] = [0, 0];
        try{
          files = files.filter(f => { return f.slice(-3) === ".js"; });
          files.forEach(f => {
            let file = f.split(".");
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
            let module = /'[^']+'/g.exec(e.toString());
            client.funcs.installNPM(module[0].slice(1,-1))
            .then(() => {
              client.funcs.loadCommandInhibitors(client);
            })
            .catch(e => {
              console.error(e);
              process.exit();
            });
          } else {
            console.error(e);
          }
          reject();
        }
        resolve();
        client.funcs.log(`Loaded ${p} command inhibitors, with ${o} optional.`);
      });
    });
  });
};
