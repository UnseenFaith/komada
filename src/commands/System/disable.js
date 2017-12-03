const longTypes = { command: "commands", inhibitor: "commandInhibitors", monitor: "messageMonitors", finalizer: "commandFinalizers" };
const { resolve } = require("path");
const fs = require("fs-nextra");


exports.init = async (client) => {
  this._path = resolve(client.clientBaseDir, "bwd", "disabled.json");
  this.disable = client.funcs._disabled;
};

exports.run = async (client, msg, [type, name]) => {
  let toDisable = client[longTypes[type]].get(name);
  if (!toDisable && type === "command") toDisable = client.commands.get(client.aliases.get(name));
  if (!toDisable) return msg.sendCode("diff", `- I cannot find the ${type}: ${name}`);
  if (this.disable[type].includes(name)) return msg.sendCode("diff", "- That piece is already currently disabled.");
  toDisable.conf.enabled = false;
  this.disable[type].push(name);
  fs.outputJSONAtomic(this._path, JSON.stringify(this.disabled));
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
  description: "Permanently disables a command/inhibitor/monitor/finalizer.",
  usage: "<command|inhibitor|monitor|finalizer> <name:str>",
  usageDelim: " ",
};
