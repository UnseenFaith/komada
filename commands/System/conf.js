const util = require("util").inspect;

exports.run = async (client, msg, [action, key, ...value]) => {
  switch (action) {
    case "list": {
      return msg.sendCode("json", util(msg.guildConf));
    }
    case "get": {
      if (!key) return msg.sendMessage("Please provide a key you wish to view");
      return msg.sendMessage(`The value for ${key} is currently: ${msg.guildConf[key]}`);
    }
    case "set": {
      if (!key || value[0] === undefined) return msg.sendMessage("Please provide both a key and value!");
      const conf = client.guildConfs.get(msg.guild.id);
      if (conf[key].type === "Boolean") conf[key].toggle();
      if (conf[key].type === "String") conf[key].set(value.join(" "));
      if (conf[key].type === "Number") conf[key].set(parseInt(value.join("")));
      if (conf[key].type === "Array") conf[key].add(value);
      return msg.sendMessage(`The new value for ${key} is: ${conf[key].data}`);
    }
    case "reset": {
      if (!key) return msg.sendMessage("Please provide a key you wish to reset");
      client.guildConfs.get(msg.guild.id).reset(key);
      return msg.sendMessage("The key has been reset.");
    }
    default: {
      return msg.sendMessage("This will never happen");
    }
  }
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
  usage: "<set|get|reset|list> [key:str] [boolean:boolean|channel:channel|user:user|role:role|int:int|str:str]",
  usageDelim: " ",
};
