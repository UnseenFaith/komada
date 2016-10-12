exports.run = (bot, msg, params) => {
  if (!params[0]) {

    let mapIter = bot.commands.keys();
    let toSend = [];

    (function buildHelp (key) {
      if (key !== undefined) {
        bot.functions.core.runCommandInhibitors(bot, msg, bot.commands.get(key), true)
        .then(() => {
          toSend.push(`${bot.config.prefix}${bot.commands.get(key).help.name} :: ${bot.commands.get(key).help.description}`);
          buildHelp(mapIter.next().value);
        })
        .catch(() => {
          buildHelp(mapIter.next().value);
        });
      } else {
        msg.channel.sendCode("asciidoc", `= Command List =\n\n[Use ${bot.config.prefix}help <commandname> for details]\n\n${toSend.join("\n")}`);
      }
    })(mapIter.next().value);

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
