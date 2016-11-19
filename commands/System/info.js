exports.run = (client, msg) => {
  msg.channel.sendMessage(`This bot is built on the Komada framework, a plug-and-play bot builder made by <@139412744439988224> (LuckyEvie#4611 , aka \`root\`).
For more information visit: <https://komada.js.org>`);
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
  name: "info",
  description: "Provides some information about this bot.",
  usage: "",
  usageDelim: "",
};
