exports.run = (client, msg, [code]) => {
  try {
    var evaled = eval(code);
    if (typeof evaled !== "string")
      evaled = require("util").inspect(evaled);
    msg.channel.sendCode("xl",client.funcs.clean(evaled));
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
  description: "Evaluates arbitrary Javascript. Not for the faint of heart.\nExpression may contain multiple lines. Oh and **you** can't use it.",
  usage: "<expression:str>",
  usageDelim: ""
};
