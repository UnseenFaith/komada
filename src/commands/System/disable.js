const longTypes = { command: "commands", inhibitor: "commandInhibitors", monitor: "messageMonitors", finalizer: "commandFinalizers" };

exports.run = async (client, msg, [type, name]) => {
  let toDisable = client[longTypes[type]].get(name);
  if (!toDisable && type === "command") toDisable = client.commands.get(client.aliases.get(name));
  if (!toDisable) return msg.sendCode("diff", `- I cannot find the ${type}: ${name}`);
  toDisable.conf.enabled = false;
  return msg.sendCode("diff", `+ Successfully disabled ${type}: ${name}`);
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: [],
  permLevel: 10,
  botPerms: ["SEND_MESSAGES"],
  requiredFuncs: [],
  requiredSettings: [],
};

exports.help = {
  name: "disable",
  description: "Re-disables or temporarily disables a command/inhibitor/monitor/finalizer. Default state restored on reboot.",
  usage: "<command|inhibitor|monitor|finalizer> <name:str>",
  usageDelim: " ",
};
