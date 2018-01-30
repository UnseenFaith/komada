const { performance: { now } } = require("perf_hooks");

exports.conf = {
  enabled: true,
  ignoreBots: true,
  ignoreSelf: true,
};

exports.run = (client, msg) => {
  if (!client.ready) return;
  if (!msg._handle) return;
  const res = this.parseCommand(client, msg);
  if (!res.command) return;
  this.handleCommand(client, msg, res);
};

exports.parseCommand = (client, msg, usage = false) => {
  const prefix = client.funcs.getPrefix(client, msg);
  if (!prefix) return false;
  const prefixLength = this.getLength(client, msg, prefix);
  if (usage) return prefixLength;
  return {
    command: msg.content.slice(prefixLength).trim().split(" ")[0].toLowerCase(),
    prefix,
    length: prefixLength,
  };
};

exports.getLength = (client, msg, prefix) => {
  if (client.config.prefixMention === prefix) return prefix.exec(msg.content)[0].length + 1;
  return prefix.exec(msg.content)[0].length;
};

exports.handleCommand = (client, msg, { command, prefix, length }) => {
  command = client.commands.get(command) || client.commands.get(client.aliases.get(command));
  if (!command) return;
  msg._registerCommand({ command, prefix, length });
  const start = now();
  const response = this.runInhibitors(client, msg, msg.command);
  if (response) {
    if (typeof response === "string") msg.reply(response);
    return;
  }
  this.runCommand(client, msg, start);
};

exports.runCommand = async (client, msg, start) => {
  await msg.validateArgs()
    .catch((error) => { throw client.funcs.handleError(client, msg, error); });
  msg.command.run(client, msg, msg.params)
    .then(mes => this.runFinalizers(client, msg, mes, start))
    .catch(err => client.funcs.handleError(client, msg, err));
};

exports.runInhibitors = (client, msg, command) => {
  let response;
  client.commandInhibitors.some((inhibitor) => {
    if (inhibitor.conf.enabled) {
      response = inhibitor.run(client, msg, command);
      if (response) return true;
    }
    return false;
  });
  return response;
};

exports.runFinalizers = (client, msg, mes, start) => {
  Promise.all(client.commandFinalizers.filter(i => i.conf.enabled).map(item => item.run(client, msg, mes, start)));
};
