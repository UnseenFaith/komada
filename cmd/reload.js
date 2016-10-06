exports.run = (bot, msg, params) => {
  let command = params[0];
  bot.reload(command);
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ['r'],
  permLevel: 4
};

exports.help = {
  name: "reload",
  description: "Reloads the command file, if it's been updated or modified.",
  usage: "reload <commandname>"
};
