const fs = require("fs");

module.exports = bot => {
  bot.commands.clear();
  bot.aliases.clear();
  fs.readdir("./cmds/", (err, files) => {
    if (err) console.error(err);
    files = files.filter(f => { return f.slice(-3) === ".js"; });
    let [c, a] = [0,0];
    files.forEach(f => {
      let props = require(`../../cmds/${f}`);
      bot.commands.set(props.help.name, props);
      c++;
      if (props.conf.aliases === undefined) props.conf.aliases = [];
      props.conf.aliases.forEach(alias => {
        bot.aliases.set(alias, props.help.name);
        a++;
      });
      if(typeof props.init === "function") props.init(bot);
    });
    files.forEach(f => {
      delete require.cache[require.resolve(`../../cmds/${f}`)];
    });
    bot.log(`Loaded ${c} commands, with ${a} aliases.`);
  });
};
