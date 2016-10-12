const fs = require("fs");

module.exports = bot => {
  fs.readdir("./modules/db", (err, files) => {
    if (err) console.error(err);
    files = files.filter(f => { return f.slice(-3) === ".js"; });
    let o = 0;
    files.forEach(f => {
      let name = f.split(".")[0];
      bot.log(`Loading Database: ${name}`);
      let props = require(`../../modules/db/${f}`);
      if (props.conf.enabled) {
        bot.databaseModules.set(name, props);
        props.init(bot);
        o++;
      }
    });
    bot.log(`Loaded ${o} database handlers`);
  });
};
