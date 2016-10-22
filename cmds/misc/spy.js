exports.run = (client, msg, [ugc]) => {
  ugc = require("util").inspect(ugc, { depth: 0 });
  msg.channel.sendCode("xl",client.funcs.clean(ugc));
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 3,
  botPerms: [],
  requiredFuncs: []
};

exports.help = {
  name: "spy",
  description: "Spies on a user, guild, or channel",
  usage: "<role:role|msg:msg|user:user|guild:guild|channel:channel>",
  usageDelim: ""
};
