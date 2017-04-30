const fs = require("fs-extra-promise");
const path = require("path");

/* eslint-disable no-throw-literal */
exports.run = async (client, msg, [type, name]) => {
  const coreDir = client.coreBaseDir;
  const clientDir = client.clientBaseDir;
  const reload = {
    command: client.funcs.reloadCommand,
    function: client.funcs.reloadFunction,
    inhibitor: client.funcs.reloadInhibitor,
    finalizer: client.funcs.reloadFinalizer,
    event: client.funcs.reloadEvent,
    monitor: client.funcs.reloadMessageMonitor,
  };
  const isCommand = type === "command" ? "System/" : "";
  fs.copyAsync(path.resolve(`${coreDir}/${type}s/${isCommand}${name}.js`), path.resolve(`${clientDir}/${type}s/${isCommand}${name}.js`))
    .then(() => {
      reload[type](`System/${name}`).catch((response) => { throw `❌ ${response}`; });
      return msg.sendMessage(`✅ Successfully Transferred ${type}: ${name}`);
    })
    .catch((err) => {
      client.emit("error", err.stack);
      return msg.sendMessage(`Transfer of ${type}: ${name} to Client has failed. Please check your Console.`);
    });
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
  name: "transfer",
  description: "Transfers a core piece to its respected folder",
  usage: "<command|function|inhibitor|event|monitor> <name:str>",
  usageDelim: " ",
};
