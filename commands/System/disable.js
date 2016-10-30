exports.run = (client, msg, [commandname]) => {
  let command;
  if (client.commands.has(commandname)) {
    command = commandname;
  } else if (client.aliases.has(commandname)) {
    command = client.aliases.get(commandname);
  }
  if (!command) {
    return msg.channel.sendMessage(`I cannot find the command: ${commandname}`);
  } else {
    client.commands.get(command).conf.enabled = false;
    return msg.channel.sendMessage(`Successfully disabled: ${commandname}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 10,
  botPerms: [],
  requiredFuncs: []
};

exports.help = {
  name: "disable",
  description: "Temporarily disables the command. Resets upon reboot.",
  usage: "<commandname:str>",
  usageDelim: ""
};
