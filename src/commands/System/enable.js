const longTypes = { command: "commands", inhibitor: "commandInhibitors", monitor: "messageMonitors", finalizer: "commandFinalizers" };
const fs = require("fs-nextra");
const { resolve } = require("path");


exports.init = async (client) => {
  this._path = resolve(client.clientBaseDir, "bwd", "disabled.json");
  this.disable = client.funcs._disabled;
};

exports.run = async (client, msg, [type, name]) => {
  let toEnable = client[longTypes[type]].get(name);
  if (!toEnable && type === "command") toEnable = client.commands.get(client.aliases.get(name));
  if (!toEnable) return msg.sendCode("diff", `- I cannot find the ${type}: ${name}`);
  if (!this.disable[type].includes(name)) return msg.sendCode("diff", "- That piece isn't currently disabled.");
  toEnable.conf.enabled = true;
  this.disable[type].splice(this.disable[type].indexOf(name), 1);
  fs.outputJSONAtomic(this._path, this.disable);
  return msg.sendCode("diff", `+ Successfully enabled ${type}: ${name}`);
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
  name: "enable",
  description: "Re-enables or temporarily enables a command/inhibitor/monitor/finalizer. Default state restored on reboot.",
  usage: "<command|inhibitor|monitor|finalizer> <name:str>",
  usageDelim: " ",
};
