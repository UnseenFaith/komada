const fs = require("fs");

module.exports = client => {
  fs.readdir("./modules/db", (err, files) => {
    if (err) console.error(err);
    files = files.filter(f => { return f.slice(-3) === ".js"; });
    let [d, o] = [0, 0];
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
    client.log(`Loaded ${d} database handlers, with ${o} optional.`);
  });
};
