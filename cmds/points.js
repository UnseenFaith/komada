exports.run = (client, msg, params = []) => {
  if (client.funcs.hasOwnProperty("points")) {
    client.funcs.points(client, msg, "view").then(points => {
      msg.reply(`Seems you have ${points} point${points !== 1 ? "" : "s"} at the moment.`);
    })
      .catch(console.error);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: ["points"]
};

exports.help = {
  name: "points",
  description: "Extra, Extra, get your points, get your fresh points!",
  usage: "points"
};
