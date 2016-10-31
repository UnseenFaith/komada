exports.run = (client, msg, [action, key, ... value]) => {
  value = value.join(" ");
  if(action === "list") {
    msg.channel.sendCode("json", require("util").inspect(msg.guildConf));
    return;
  } else

  if(action === "get") {
    if(!key) return msg.reply("Please provide a key you wish to view");
    msg.reply(`The value for ${key} is currently: ${msg.guildConf[key]}`);
    return;
  } else

  if(action === "set") {
    if(!key || !value) return msg.reply("Please provide both a key and value!");
    if (value === "true")
      value = true;
    if (value === "false")
      value = false;
    client.funcs.confs.set(msg.guild, key, value);
    return msg.reply(`The value for ${key} has been set to: ${value}`);
  } else

  if(action === "reset") {
    if(!key) return msg.reply("Please provide a key you wish to reset");
    client.funcs.confs.resetKey(msg.guild, key);
    return msg.reply("The key has been reset.");
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: 3,
  botPerms: [],
  requiredFuncs: []
};

exports.help = {
  name: "conf",
  description: "Define per-server configuration.",
  usage: "<set|get|reset|list> [key:str] [true|false|channel:channel|user:user|role:role|int:int|str:str]",
  usageDelim: " "
};
