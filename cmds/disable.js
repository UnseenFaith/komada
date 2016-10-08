exports.run = (bot, msg, params) => {
  let command;
  if (bot.commands.has(params[0])) {
    command = params[0];
  } else if (bot.aliases.has(params[0])) {
    command = bot.aliases.get(params[0]);
  }
  if (!command) {
    return msg.channel.sendMessage(`I cannot find the command: ${params[0]}`);
  } else {
    bot.commands.get(command).conf.enabled = false;
    return msg.channel.sendMessage(`Successfully disabled: ${params[0]}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 4
};

exports.help = {
  name: "disable",
  description: "Temperarily disables the command.",
  usage: "disable <commandname>"
};
