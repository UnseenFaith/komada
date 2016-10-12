exports.run = (bot, msg, params = []) => {
  if (bot.functions.optn.hasOwnProperty("points")) {
    bot.functions.optn.points(bot, msg, "view").then(points => {
      msg.reply(`Seems you got ${points} points at the moment.`);
    })
    .catch(console.error);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: 0,
  botPerms: []
};

exports.help = {
  name: "points",
  description: "Extra, Extra, get your points, get your fresh points!",
  usage: "points"
};
