const fs = require("fs");

module.exports = client => {
  client.commands.clear();
  client.aliases.clear();
  let [c, a] = [0,0];
  fs.readdir("./cmds/", (err, files) => {
    if (err) console.error(err);
    try {
      files = files.filter(f => { return f.slice(-3) === ".js"; });

      files.forEach(f => {
        let props = require(`../../cmds/${f}`);
        client.commands.set(props.help.name, props);
        c++;
        if (props.conf.aliases === undefined) props.conf.aliases = [];
        props.conf.aliases.forEach(alias => {
          client.aliases.set(alias, props.help.name);
          a++;
        });
      });
    } catch (e) {
      if (e.code === "MODULE_NOT_FOUND") {
        let module = /'[^']+'/g.exec(e.toString());
        client.funcs.installNPM(module[0].slice(1,-1))
        .then(() => {
          client.funcs.loadCommands(client);
        })
        .catch(e => {
          console.error(e);
          process.exit();
        });
      } else {
        console.error(e);
      }
    }
    files.forEach(f => {
      delete require.cache[require.resolve(`../../cmds/${f}`)];
    });
  });
  client.log(`Loaded ${c} commands, with ${a} aliases.`);
};
