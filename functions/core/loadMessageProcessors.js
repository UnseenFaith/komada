const fs = require("fs");

module.exports = bot => {
  fs.readdir("./functions/msgProcs", (err, files) => {
    bot.functions.optn = {};
    if (err) console.error(err);
    let p = 0;
    files.forEach(f=> {
      let name = f.split(".")[0];
      let props = require(`../msgProcs/${f}`);
      if (props.conf.enabled) {
        bot.messageProcessors.set(name, props);
        p++;
      }
    });
    bot.log(`Loaded ${p} message processors`);
  });
};
