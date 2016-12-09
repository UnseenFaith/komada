exports.run = (client, msg, [type, name]) => {
  switch (type) {
    case "function":
      msg.channel.sendMessage(`Attemping to reload function ${name}`).then((m) => {
        client.funcs.reload.function(client, client.clientBaseDir, name).then((message) => {
          m.edit(`:white_check_mark: ${message}`);
        }).catch((e) => {
          m.edit(`:x: ${e}`);
        });
      });
      break;
    case "inhibitor":
      msg.channel.sendMessage(`Attempting to reload inhibitor ${name}`).then((m) => {
        client.funcs.reload.inhibitor(client, client.clientBaseDir, name).then((message) => {
          m.edit(`:white_check_mark: ${message}`);
        }).catch((e) => {
          m.edit(`:x: ${e}`);
        });
      });
      break;
    case "monitor":
      msg.channel.sendMessage(`Attempting to reload monitor ${name}`).then((m) => {
        client.funcs.reload.monitor(client, client.clientBaseDir, name).then((message) => {
          m.edit(`:white_check_mark: ${message}`);
        }).catch((e) => {
          m.edit(`:x: ${e}`);
        });
      });
      break;
    case "provider":
      msg.channel.sendMessage(`Attempting to reload provider ${name}`).then((m) => {
        client.funcs.reload.provider(client, client.clientBaseDir, name).then((message) => {
          m.edit(`:white_check_mark: ${message}`);
        }).catch((e) => {
          m.edit(`:x: ${e}`);
        });
      });
      break;
    case "event":
      msg.channel.sendMessage(`Attempting to reload event ${name}`).then((m) => {
        client.funcs.reload.event(client, name).then((message) => {
          m.edit(`:white_check_mark: ${message}`);
        }).catch((e) => {
          m.edit(`:x: ${e}`);
        });
      });
      break;
    case "command":
      switch (name) {
        case "all":
          client.funcs.loadCommands(client);
          msg.channel.sendMessage(":white_check_mark: Reloaded all commands.");
          break;
        default:
          msg.channel.sendMessage(`Attempting to reload command ${name}`).then((m) => {
            client.funcs.reload.command(client, client.clientBaseDir, name).then((message) => {
              m.edit(`:white_check_mark: ${message}`);
            }).catch((e) => {
              m.edit(`:x: ${e}`);
            });
          });
          break;
      }
      break;
      // no default
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
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
