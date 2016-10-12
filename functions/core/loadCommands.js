const fs = require("fs");

module.exports = client => {
  client.commands.clear();
  client.aliases.clear();
  fs.readdir("./cmds/", (err, files) => {
    if (err) console.error(err);
    files = files.filter(f => { return f.slice(-3) === ".js"; });
    let [c, a] = [0,0];
    files.forEach(f => {
      let props = require(`../../cmds/${f}`);
      client.commands.set(props.help.name, props);
      c++;
      if (props.conf.aliases === undefined) props.conf.aliases = [];
      props.conf.aliases.forEach(alias => {
        client.aliases.set(alias, props.help.name);
        a++;
      });
      if(typeof props.init === "function") props.init(bot);
    });
    files.forEach(f => {
      delete require.cache[require.resolve(`../../cmds/${f}`)];
    });
    client.log(`Loaded ${c} commands, with ${a} aliases.`);
  });
};
