const vm = require("vm");
const util = require("util");

exports.run = (client, msg, [code]) => {
  try {
    const evaled = vm.runInNewContext(code, { client, msg, message: msg });
    msg.channel.sendCode("xl", client.funcs.clean(typeof evaled === "string" ? evaled : util.inspect("evaled")));
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
