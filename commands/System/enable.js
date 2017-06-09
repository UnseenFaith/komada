exports.run = async (client, msg, [type, name]) => {
  const t = { command: "commands", inhibitor: "commandInhibitors", monitor: "messageMonitors", finalizer: "commandFinalizers" }[type];
  let toEnable = client[t].get(name);
  if (!toEnable && type === "command") toEnable = client.commands.get(client.aliases.has(name));
  if (!toEnable) return msg.sendCode("diff", `- I cannot find the ${type}: ${name}`);
  toEnable.conf.enabled = true;
  return msg.sendCode("diff", `+ Successfully enabled ${type}: ${name}`);
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
