exports.run = (bot, msg, params) => {
  if (!params[0]) {
    msg.channel.sendCode("asciidoc", `= Command List =\n\n[Use ${bot.config.prefix}help <commandname> for details]\n\n${bot.commands.map(c=>`${bot.config.prefix}${c.help.name} :: ${c.help.description}`).join("\n")}`);
  } else {
    let command = params[0];
    if(bot.commands.has(command)) {
      command = bot.commands.get(command);
      msg.channel.sendCode("asciidoc", `= ${command.help.name} = \n${command.help.description}\nusage :: ${bot.config.prefix}${command.help.usage}`);
    }
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 0,
  botPerms: []
};

exports.help = {
  name : "help",
  description: "Display help for a command.",
  usage: "help [command]"
};
