exports.run = (client, msg, params) => {
  if (!params[0]) {

    let mapIter = client.commands.keys();
    let toSend = [];

    (function buildHelp(key) {
      if (key !== undefined) {
        client.funcs.runCommandInhibitors(client, msg, client.commands.get(key), true)
          .then(() => {
            toSend.push(`${client.config.prefix}${client.commands.get(key).help.name} :: ${client.commands.get(key).help.description}`);
            buildHelp(mapIter.next().value);
          })
          .catch(() => {
            buildHelp(mapIter.next().value);
          });
      } else {
        msg.channel.sendCode("asciidoc", `= Command List =\n\n[Use ${client.config.prefix}help <commandname> for details]\n\n${toSend.join("\n")}`);
      }
    })(mapIter.next().value);

  } else {
    let command = params[0];
    if (client.commands.has(command)) {
      command = client.commands.get(command);
      msg.channel.sendCode("asciidoc", `= ${command.help.name} = \n${command.help.description}\nusage :: ${client.config.prefix}${command.help.usage}`);
    }
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: []
};

exports.help = {
  name: "help",
  description: "Display help for a command.",
  usage: "help [command]"
};
