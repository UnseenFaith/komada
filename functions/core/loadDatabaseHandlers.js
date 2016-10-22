const fs = require("fs");
const path = require("path");

const dir = path.resolve(__dirname + "/../../modules/db/");

module.exports = client => {
  fs.readdir(dir, (err, files) => {
    if (err) console.error(err);
    let [d, o] = [0, 0];
    try{
      files = files.filter(f => { return f.slice(-3) === ".js"; });
      files.forEach(f => {
        let file = f.split(".");
        let props;
        if (file[1] !== "opt") {
          props = require(`../../modules/db/${f}`);
          client.databaseModules.set(file[0], props);
          props.init(client);
          d++;
        } else if (client.config.databaseModules.includes(file[0])) {
          props = require(`../../modules/db/${f}`);
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
};
