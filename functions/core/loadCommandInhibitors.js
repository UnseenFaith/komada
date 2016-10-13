const fs = require("fs");

module.exports = client => {
  fs.readdir("./functions/inhibitors", (err, files) => {
    if (err) console.error(err);
    let [p, o] = [0, 0];
    try{
      files = files.filter(f => { return f.slice(-3) === ".js"; });
      files.forEach(f => {
        let file = f.split(".");
        let props;
        if (file[1] !== "opt") {
          props = require(`../inhibitors/${f}`);
          client.commandInhibitors.set(file[0], props);
          p++;
        } else if (client.config.commandInhibitors.includes(file[0])) {
          props = require(`../inhibitors/${f}`);
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
        });
      } else {
        console.error(e);
      }
    }
    client.log(`Loaded ${p} command inhibitors, with ${o} optional.`);
  });
};
