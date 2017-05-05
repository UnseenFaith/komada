exports.run = (client, msg, [type, name]) => {
  switch (type) {
    case "inhibitor": {
      const inhibitor = client.commandInhibitors.get(name);
      if (!inhibitor) return msg.channel.sendCode("diff", `- I cannot find the inhibitor: ${name}`);
      inhibitor.conf.enabled = true;
      return msg.channel.sendCode("diff", `+ Successfully enabled inhibitor: ${name}`);
    }
    case "monitor": {
      const monitor = client.messageMonitors.get(name);
      if (!monitor) return msg.channel.sendCode("diff", `- I cannot find the monitor: ${name}`);
      monitor.conf.enabled = true;
      return msg.channel.sendCode("diff", `+ Successfully enabled monitor: ${name}`);
    }
    case "command": {
      const command = client.commands.get(name) || client.commands.get(client.aliases.has(name));
      if (!command) return msg.channel.sendCode("diff", `- I cannot find the command: ${name}`);
      command.conf.enabled = true;
      return msg.channel.sendCode("diff", `+ Successfully enabled command: ${name}`);
    }
    default:
      return msg.channel.sendMessage("This will never happen");
  }
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: [],
  permLevel: 10,
  botPerms: [],
  requiredFuncs: [],
};

exports.help = {
  name: "enable",
  description: "Re-enables or temporarily enables a Inhibitor/Command/Monitor. Default state restored on reboot.",
  usage: "<inhibitor|monitor|command> <name:str>",
  usageDelim: " ",
};
