exports.run = (client, msg, [commandname]) => {
  let command;
  if (client.commands.has(commandname)) {
    command = commandname;
  } else if (client.aliases.has(commandname)) {
    command = client.aliases.get(commandname);
  }
  if (!command) {
    return msg.channel.sendMessage(`I cannot find the command: ${commandname}`);
  }
  client.commands.get(command).conf.enabled = true;
  return msg.channel.sendMessage(`Successfully enabled: ${commandname}`);
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 10,
  botPerms: [],
  requiredFuncs: [],
};

exports.help = {
  name: "enable",
  description: "Re-enables or temporarily enables a command. Default state restored on reboot.",
  usage: "<commandname:str>",
  usageDelim: "",
};
