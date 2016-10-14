exports.run = (client, msg, [user]) => {
  user = require("util").inspect(user, { depth: 0 });
  msg.channel.sendCode("xl",client.funcs.clean(user));
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
  description: "Spies on a user",
  usage: "<user:mention>",
  usageDelim: ""
};
