exports.run = async (client, msg, [type, name]) => {
  function sendSuccess() { msg.sendCode("diff", `+ Successfully enabled ${type}: ${name}`); }
  function sendError() { msg.sendCode("diff", `- I cannot find the ${type}: ${name}`); }
  switch (type) {
    case "command": {
      const command = client.commands.get(name) || client.commands.get(client.aliases.has(name));
      if (!command) sendError();
      command.conf.enabled = true;
      return sendSuccess();
    }
    case "inhibitor": {
      const inhibitor = client.commandInhibitors.get(name);
      if (!inhibitor) sendError();
      inhibitor.conf.enabled = true;
      return sendSuccess();
    }
    case "monitor": {
      const monitor = client.messageMonitors.get(name);
      if (!monitor) sendError();
      monitor.conf.enabled = true;
      return sendSuccess();
    }
    case "finalizer": {
      const finalizer = client.commandFinalizers.get(name);
      if (!finalizer) sendError();
      finalizer.conf.enabled = true;
      return sendSuccess();
    }
    // no default
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
  description: "Re-enables or temporarily enables a command/inhibitor/monitor/finalizer. Default state restored on reboot.",
  usage: "<command|inhibitor|monitor|finalizer> <name:str>",
  usageDelim: " ",
};
