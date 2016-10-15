module.exports = function(client, command) {
  return new Promise((resolve, reject) => {
    try {
      let c = client.commands.get(command);
      let directory = `${c.help.category ? c.help.category +"/" : ""}${c.help.name}.js`;
      let cmd = require(`../../cmds/${directory}`);
      cmd.help["category"] = c.help.category;
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });

      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      delete require.cache[require.resolve(`../../cmds/${directory}`)];
      resolve();
    } catch (e){
      reject(e);
    }
  });
};
