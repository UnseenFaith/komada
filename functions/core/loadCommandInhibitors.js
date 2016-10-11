const fs = require("fs");

module.exports = bot => {
  fs.readdir("./functions/inhibitors", (err, files) => {
    if (err) console.error(err);
    files = files.filter(f => { return f.slice(-3) === ".js"; });
    let p = 0;
    files.forEach(f => {
      let name = f.split(".")[0];
      let props = require(`../inhibitors/${f}`);
      if (props.conf.enabled) {
        bot.commandInhibitors.set(name, props);
        p++;
      }
    });
    bot.log(`Loaded ${p} command inhibitors`);
  });
};
