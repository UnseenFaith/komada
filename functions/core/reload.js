module.exports = function(client, command) {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`../../cmds/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });

      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      delete require.cache[require.resolve(`../../cmds/${command}`)];
      resolve();
    } catch (e){
      reject(e);
    }
  });
};
