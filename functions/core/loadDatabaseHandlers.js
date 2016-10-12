const fs = require("fs");

module.exports = client => {
  fs.readdir("./modules/db", (err, files) => {
    if (err) console.error(err);
    files = files.filter(f => { return f.slice(-3) === ".js"; });
    let o = 0;
    files.forEach(f => {
      let name = f.split(".")[0];
      client.log(`Loading Database: ${name}`);
      let props = require(`../../modules/db/${f}`);
      client.log(props.conf.enabled);
      if (props.conf.enabled) {
        client.databaseModules.set(name, props);
        props.init(client);
        o++;
      }
    });
    client.log(`Loaded ${o} database handlers`);
  });
};
