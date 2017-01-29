exports.run = async (client, msg, [type, name]) => {
  let m;
  let message;
  switch (type) {
    case "function":
      m = await msg.channel.sendMessage(`Attemping to reload function ${name}`).catch(err => client.funcs.log(err, "error"));
      message = await client.funcs.reload.function(client, client.clientBaseDir, name).catch(response => m.edit(`:x: ${response}`));
      m.edit(`:white_check_mark: ${message}`);
      break;
    case "inhibitor":
      m = await msg.channel.sendMessage(`Attempting to reload inhibitor ${name}`).catch(err => client.funcs.log(err, "error"));
      message = await client.funcs.reload.inhibitor(client, client.clientBaseDir, name).catch(response => m.edit(`:x: ${response}`));
      m.edit(`:white_check_mark ${message}`);
      break;
    case "monitor":
      m = await msg.channel.sendMessage(`Attempting to reload monitor ${name}`).catch(err => client.funcs.log(err, "error"));
      message = await client.funcs.reload.monitor(client, client.clientBaseDir, name).catch(response => m.edit(`:x: ${response}`));
      m.edit(`:white_check_mark: ${message}`);
      break;
    case "provider":
      m = await msg.channel.sendMessage(`Attempting to reload provider ${name}`).catch(err => client.funcs.log(err, "error"));
      message = await client.funcs.reload.provider(client, client.clientBaseDir, name).catch(response => m.edit(`:x: ${response}`));
      m.edit(`:white_check_mark: ${message}`);
      break;
    case "event":
      m = await msg.channel.sendMessage(`Attempting to reload event ${name}`).catch(err => client.funcs.log(err, "error"));
      message = await client.funcs.reload.event(client, name).catch(response => m.edit(`:x: ${response}`));
      m.edit(`:white_check_mark: ${message}`);
      break;
    case "command":
      switch (name) {
        case "all":
          await client.funcs.loadCommands(client);
          msg.channel.sendMessage(":white_check_mark: Reloaded all commands.");
          break;
        default:
          m = await msg.channel.sendMessage(`Attempting to reload command ${name}`).catch(err => client.funcs.log(err, "error"));
          message = await client.funcs.reload.command(client, client.clientBaseDir, name).catch(response => m.edit(`:x: ${response}`));
          m.edit(`:white_check_mark: ${message}`);
          break;
      }
      break;
      // no default
  }
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: ["r", "load"],
  permLevel: 10,
  botPerms: [],
  requiredFuncs: [],
};

exports.help = {
  name: "reload",
  description: "Reloads the command file, if it's been updated or modified.",
  usage: "<function|inhibitor|monitor|provider|event|command> <name:str>",
  usageDelim: " ",
};
