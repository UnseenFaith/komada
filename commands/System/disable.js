exports.run = async (client, msg, [type, name]) => {
  function sendSuccess() { msg.sendCode("diff", `+ Successfully disabled ${type}: ${name}`); }
  function sendError() { msg.sendCode("diff", `- I cannot find the ${type}: ${name}`); }
  switch (type) {
    case "command": {
      const command = client.commands.get(name) || client.commands.get(client.aliases.has(name));
      if (!command) return sendError();
      command.conf.enabled = false;
      return sendSuccess();
    }
    case "inhibitor": {
      const inhibitor = client.commandInhibitors.get(name);
      if (!inhibitor) return sendError();
      inhibitor.conf.enabled = false;
      return sendSuccess();
    }
    case "monitor": {
      const monitor = client.messageMonitors.get(name);
      if (!monitor) return sendError();
      monitor.conf.enabled = false;
      return sendSuccess();
    }
    case "finalizer": {
      const finalizer = client.commandFinalizers.get(name);
      if (!finalizer) return sendError();
      finalizer.conf.enabled = false;
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
  name: "disable",
  description: "Temporarily disables a command/inhibitor/monitor/finalizer. Default state restored on reboot.",
  usage: "<command|inhibitor|monitor|finalizer> <name:str>",
  usageDelim: " ",
};
