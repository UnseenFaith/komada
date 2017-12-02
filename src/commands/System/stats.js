const { version: discordVersion } = require("discord.js");
const { version: komadaVersion, Duration } = require("komada");

exports.run = async (client, msg) => msg.sendCode("asciidoc", [
  "= STATISTICS =",
  "",
  `• Mem Usage  :: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
  `• Uptime     :: ${Duration.format(client.uptime)}`,
  `• Users      :: ${client.guilds.reduce((a, b) => a + b.memberCount, 0).toLocaleString()}`,
  `• Servers    :: ${client.guilds.size.toLocaleString()}`,
  `• Channels   :: ${client.channels.size.toLocaleString()}`,
  `• Komada     :: v${komadaVersion}`,
  `• Discord.js :: v${discordVersion}`,
  `• Node.js    :: ${process.version}`,
]);

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: ["details", "what"],
  permLevel: 0,
  botPerms: ["SEND_MESSAGES"],
  requiredFuncs: [],
  requiredSettings: [],
};

exports.help = {
  name: "stats",
  description: "Provides some details about the bot and stats.",
  usage: "",
  usageDelim: "",
};
