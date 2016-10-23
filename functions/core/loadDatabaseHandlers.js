const fs = require("fs-extra");
const path = require("path");

module.exports = client => {
  loadDataProviders(client, client.coreBaseDir);
  loadDataProviders(client, client.clientBaseDir);
};

const loadDataProviders = (client, baseDir) => {
  let dir = path.resolve(baseDir + "./modules/db/");
  fs.ensureDir(dir, err => {
    if (err) console.error(err);
    fs.readdir(dir, (err, files) => {
      if (err) console.error(err);
      let [d, o] = [0, 0];
      try{
        files = files.filter(f => { return f.slice(-3) === ".js"; });
        files.forEach(f => {
          let file = f.split(".");
          let props;
          if (file[1] !== "opt") {
            props = require(`${dir}/${f}`);
            client.databaseModules.set(file[0], props);
            props.init(client);
            d++;
          } else if (client.config.databaseModules.includes(file[0])) {
            props = require(`${dir}/${f}`);
            client.databaseModules.set(file[0], props);
            props.init(client);
            o++;
          }
        });
      } catch (e) {
        if (e.code === "MODULE_NOT_FOUND") {
          let module = /'[^']+'/g.exec(e.toString());
          client.funcs.installNPM(module[0].slice(1,-1))
          .then(() => {
            client.funcs.loadDatabaseHandlers(client);
          })
          .catch(e => {
            console.error(e);
            process.exit();
          });
        } else {
          console.error(e);
        }
      }
      client.funcs.log(`Loaded ${d} database handlers, with ${o} optional.`);
    });
  });

};
