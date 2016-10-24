const escapeRegex = require('escape-string-regexp');

exports.run = (client, msg, [code]) => {
  try {
    var evaled = eval(code);
    if (typeof evaled !== "string")
      evaled = require("util").inspect(evaled, {
        depth: 0
      }).replace(sensitivePattern(client), '---removed---').replace(client.user.email, '---removed---');
    msg.channel.sendCode("xl", client.funcs.clean(evaled));
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

function sensitivePattern(client) {
  if (!this._sensitivePattern) {
    let pattern = '';
    if (client.token) pattern += escapeRegex(client.token);
    if (client.token) pattern += (pattern.length > 0 ? '|' : '') + escapeRegex(client.token);
    if (client.email) pattern += (pattern.length > 0 ? '|' : '') + escapeRegex(client.email);
    if (client.password) pattern += (pattern.length > 0 ? '|' : '') + escapeRegex(client.password);
    this._sensitivePattern = new RegExp(pattern, 'gi');
  }
  return this._sensitivePattern;
};
