const Discord = require("discord.js");
const moment = require("moment");
require("moment-duration-format");

exports.run = (client, msg) => {
  const komada = require(`${client.coreBaseDir}/package.json`); // eslint-disable-line
  const duration = moment.duration(client.uptime).format(" D [days], H [hrs], m [mins], s [secs]");
  msg.channel.sendCode("asciidoc", `= STATISTICS =

• Mem Usage  :: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
• Uptime     :: ${duration}
• Users      :: ${client.guilds.reduce((a, b) => a + b.memberCount, 0).toLocaleString()}
• Servers    :: ${client.guilds.size.toLocaleString()}
• Channels   :: ${client.channels.size.toLocaleString()}
• Komada     :: v${komada.version}
• Discord.js :: v${Discord.version}`);
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["details", "what"],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
};

exports.help = {
  name: "stats",
  description: "Provides some details about the bot and stats.",
  usage: "",
  usageDelim: "",
};
