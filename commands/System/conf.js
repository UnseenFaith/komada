const inspect = require("util").inspect;

exports.run = (client, msg, [action, key, ...value]) => {
  if (msg.guildConf[key].constructor.name === "String") {
    value = value.join(" ");
  } else
  if (msg.guildConf[key].constructor.name === "Boolean") {
    value = value[0];
  }
  if (action === "get") {
    if (!key) return msg.reply("Please provide a key you wish to view");
    return msg.reply(`The value for ${key} is currently: ${msg.guildConf[key]}`);
  } else

  if (action === "set") {
    if (!key || value === undefined) return msg.reply("Please provide both a key and value!");
    client.funcs.confs.set(msg.guild, key, value);
    return msg.reply(`The value for ${key} has been set to: ${value}`);
  } else

  if (action === "reset") {
    if (!key) return msg.reply("Please provide a key you wish to reset");
    client.funcs.confs.resetKey(msg.guild, key);
    return msg.reply("The key has been reset.");
  }
  return msg.channel.sendCode("json", inspect(msg.guildConf));
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: 3,
  botPerms: [],
  requiredFuncs: [],
};

exports.help = {
  name: "conf",
  description: "Define per-server configuration.",
  usage: "[set|get|reset] [key:str] [boolean:boolean|channel:channel|user:user|role:role|int:int|str:str]",
  usageDelim: " ",
};
