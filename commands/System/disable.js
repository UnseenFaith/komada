exports.run = async (client, msg, [type, name]) => {
  switch (type) {
    case "inhibitor": {
      const inhibitor = client.commandInhibitors.get(name);
      if (!inhibitor) return msg.sendCode("diff", `- I cannot find the inhibitor: ${name}`);
      inhibitor.conf.enabled = false;
      return msg.sendCode("diff", `+ Successfully disabled inhibitor: ${name}`);
    }
    case "monitor": {
      const monitor = client.messageMonitors.get(name);
      if (!monitor) return msg.sendCode("diff", `- I cannot find the monitor: ${name}`);
      monitor.conf.enabled = false;
      return msg.sendCode("diff", `+ Successfully disabled monitor: ${name}`);
    }
    case "command": {
      const command = client.commands.get(name) || client.commands.get(client.aliases.has(name));
      if (!command) return msg.sendCode("diff", `- I cannot find the command: ${name}`);
      command.conf.enabled = false;
      return msg.sendCode("diff", `+ Successfully disabled command: ${name}`);
    }
    default:
      return msg.sendMessage("This will never happen");
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
  name: "disable",
  description: "Temporarily disables the inhibitor/monitor/command. Resets upon reboot.",
  usage: "<inhibitor|monitor|command> <name:str>",
  usageDelim: " ",
};
