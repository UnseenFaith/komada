const { inspect } = require("util");

exports.run = async (client, msg, [action, key, ...value]) => {
  const configs = msg.guild.conf;

  switch (action) {
    case "set": {
      if (!key) return msg.sendMessage("You must provide a key");
      if (!value[0]) return msg.sendMessage("You must provide a value");
      if (!configs.id) await client.settingGateway.create(msg.guild);
      const response = await client.settingGateway.update(msg.guild, key, value.join(" "));
      return msg.sendMessage(`Successfully updated the key **${key}**: **${response}**`);
    }
    case "get": {
      if (!key) return msg.sendMessage("You must provide a key");
      if (!(key in configs)) return msg.sendMessage(`The key ${key} does not seem to exist.`);
      return msg.sendMessage(`The value for the key **${key}** is: **${configs[key]}**`);
    }
    case "reset": {
      if (!key) return msg.sendMessage("You must provide a key");
      if (!configs.id) await client.settingGateway.create(msg.guild);
      const response = await client.settingGateway.reset(msg.guild, key);
      return msg.sendMessage(`The key **${key}** has been reset to: **${response}**`);
    }
    case "list": return msg.sendCode("js", inspect(configs));
    // no default
  }

  return null;
};

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: [],
  permLevel: 3,
  botPerms: [],
  requiredFuncs: [],
};

exports.help = {
  name: "conf",
  description: "Define per-server configuration.",
  usage: "<set|get|reset|list> [key:string] [value:string]",
  usageDelim: " ",
};
