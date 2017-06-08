exports.run = async (client, msg, [type, name]) => {
  const t = { command: "commands", inhibitor: "commandInhibitors", monitor: "messageMonitors", finalizer: "commandFinalizers" }[type];
  const toDisable = client[t].get(name) || type === "command" ? client.commands.get(client.aliases.has(name)) : null;
  if (!toDisable) return msg.sendCode("diff", `- I cannot find the ${type}: ${name}`);
  toDisable.conf.enabled = false;
  return msg.sendCode("diff", `+ Successfully disabled ${type}: ${name}`);
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
  description: "Re-disables or temporarily disables a command/inhibitor/monitor/finalizer. Default state restored on reboot.",
  usage: "<command|inhibitor|monitor|finalizer> <name:str>",
  usageDelim: " ",
};
