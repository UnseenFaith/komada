exports.run = (client, msg, [code]) => {
  try {
    var evaled = eval(code);
    if (typeof evaled !== "string")
      evaled = require("util").inspect(evaled);
    msg.channel.sendCode("xl", client.funcs.clean(client, evaled));
  } catch (err) {
    msg.channel.sendMessage("`ERROR` ```xl\n" +
      client.funcs.clean(err) +
      "\n```");
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["ev"],
  permLevel: 10,
  botPerms: [],
  requiredFuncs: []
};

exports.help = {
  name: "eval",
  description: "Evaluates arbitrary Javascript. Reserved for bot owner.",
  usage: "<expression:str>",
  usageDelim: ""
};
