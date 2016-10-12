const fs = require("fs");

module.exports = bot => {
  fs.readdir("./functions/optn", (err, files) => {
    bot.functions.optn = {};
    if (err) console.error(err);
    files = files.filter(f => { return f.slice(-3) === ".js"; });
    let o = 0;
    files.forEach(f => {
      let name = f.split(".")[0];
      bot.log(`Loading optional command: ${name}`);
      let props = require(`../optn/${f}`);
      if (props.conf.enabled) {
        bot.functions.optn[name] = props.run;
        o++;
      }
    });
    bot.log(`Loaded ${o} optional functions`);
  });
};
