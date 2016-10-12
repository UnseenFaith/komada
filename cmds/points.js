exports.run = (client, msg, params = []) => {
  if (client.functions.optn.hasOwnProperty("points")) msg.reply(`Seems you got ${client.functions.optn.points(client, msg, "view")} points at the moment.`);
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
