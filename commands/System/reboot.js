exports.run = (client, msg) => {
  msg.channel.send("Rebooting...")
    .then(() => {
      process.exit();
    })
    .catch((e) => {
      console.error(e);
    });
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: [],
  permLevel: 10,
  botPerms: [],
  requiredFuncs: [],
};

exports.help = {
  name: "reboot",
  description: "Reboots the bot.",
  usage: "",
  usageDelim: "",
};

exports.strings = {
  "Reboots the bot.": "Redémarre le bot",
  "Rebooting...": "Redémarrage",
};
