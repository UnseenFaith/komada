module.exports = function(client, command) {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`../../cmds/${command}`);
      cmd.help["category"] = command.split("/").slice(0,-1).join("/");

      client.commands.set(cmd.help.name, cmd);
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
