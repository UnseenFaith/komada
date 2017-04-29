exports.run = async (client, msg) => msg.sendMessage("Rebooting...")
		.then(() => process.exit())
		.catch(err => client.emit("error", err));

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
