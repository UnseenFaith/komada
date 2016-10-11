const Discord = require("discord.js");

function getAccessibleCommands(bot, msg, inhibitor){
  return new Promise((resolve, reject) => {
    let retVal = new Discord.Collection();
    bot.commands.forEach(c => {
      inhibitor.run(bot, msg, c, true).then(() => {
        retVal.set(c.help.name, c);
      });
    });
    resolve(retVal);
  });
}

function sendHelp(bot, msg, commands){
  msg.channel.sendCode("asciidoc",`= Command List =\n\n[Use ${bot.config.prefix}help <commandname> for details]\n\n${commands.map(c=>`${bot.config.prefix}${c.help.name} :: ${c.help.description}`).join("\n")}`);
}
exports.run = (bot, msg, params) => {
  if (!params[0]) {
    let permissionsInhibitor = bot.commandInhibitors.get("permissions");
    if(permissionsInhibitor){
      getAccessibleCommands(bot, msg, permissionsInhibitor).then(accessibleCommands => {
        sendHelp(bot, msg, accessibleCommands);
      });
    }
    else{
      sendHelp(bot, msg, bot.commands);
    }

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
