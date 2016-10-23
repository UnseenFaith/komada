module.exports = function(client, command) {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`${client.clientBaseDir}commands/${command}`);
      cmd.help["category"] = `${client.clientBaseDir}commands/${command}`.split("/").slice(0,-1).join("/");

      client.commands.set(cmd.help.name, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      delete require.cache[require.resolve(`${client.clientBaseDir}commands/${command}`)];
      resolve();
    } catch (e){
      reject(e);
    }
  });
};
