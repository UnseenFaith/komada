const fs = require("fs");

module.exports = client => {
  fs.readdir("./functions/inhibitors", (err, files) => {
    if (err) console.error(err);
    files = files.filter(f => { return f.slice(-3) === ".js"; });
    let [p, o] = [0, 0];
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
    client.log(`Loaded ${p} command inhibitors, with ${o} optional.`);
  });
};
