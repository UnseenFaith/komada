const now = require("performance-now");

exports.run = async (client, msg) => {
  if (!client.ready) return;
  await this.runMessageMonitors(client, msg);
  if (!this.handleMessage(client, msg)) return;
  const res = await this.parseCommand(client, msg);
  if (!res.command) return;
  this.handleCommand(client, msg, res);
};

exports.runMessageMonitors = (client, msg) => {
  client.messageMonitors.forEach((monit) => {
    if (monit.conf.enabled) {
      if (monit.conf.ignoreBots && msg.author.bot) return;
      if (monit.conf.ignoreSelf && client.user === msg.author) return;
      monit.run(client, msg);
    }
  });
};

exports.handleMessage = (client, msg) => {
  // Ignore Bots if True
  if (client.config.ignoreBots && msg.author.bot) return false;
  // Ignore Self if true
  if (client.config.ignoreSelf && msg.author.id === client.user.id) return false;
  // Ignore other users if selfbot
  if (!client.user.bot && msg.author.id !== client.user.id) return false;
  // Ignore self if bot
  if (client.user.bot && msg.author.id === client.user.id) return false;
  return true;
};

exports.parseCommand = async (client, msg, usage = false) => {
  const prefix = client.funcs.getPrefix(client, msg);
  if (!prefix) return false;
  const prefixLength = this.getLength(client, msg, prefix);
  if (usage) return prefixLength;
  return {
    command: msg.content.slice(prefixLength).trim().split(" ")[0].toLowerCase(),
    prefix,
    prefixLength,
  };
};

exports.getLength = (client, msg, prefix) => {
  if (client.config.prefixMention === prefix) return prefix.exec(msg.content)[0].length + 1;
  return prefix.exec(msg.content)[0].length;
};

exports.handleCommand = (client, msg, { command, prefix, prefixLength }) => {
  const validCommand = client.commands.get(command) || client.commands.get(client.aliases.get(command));
  if (!validCommand) return;
  const start = now();
  const response = this.runInhibitors(client, msg, validCommand);
  if (response) {
    if (typeof response === "string") msg.reply(response);
    return;
  }
  const proxy = this.createProxy(msg, new client.CommandMessage(msg, validCommand, prefix, prefixLength));
  this.runCommand(client, proxy, start);
};

exports.createProxy = (msg, cmdMsg) => new Proxy(msg, {
  get: function handler(target, param) {
    return param in msg ? msg[param] : cmdMsg[param];
  },
});

exports.runCommand = (client, msg, start) => {
  msg.validateArgs()
    .then((params) => {
      msg.cmd.run(client, msg, params)
        .then(mes => this.runFinalizers(client, msg, mes, start))
        .catch(error => client.funcs.handleError(client, msg, error));
    })
    .catch((error) => {
      if (error.code === 1 && client.config.cmdPrompt) {
        return this.awaitMessage(client, msg, start, error.message)
          .catch(err => client.funcs.handleError(client, msg, err));
      }
      return client.funcs.handleError(client, msg, error);
    });
};

/* eslint-disable no-throw-literal */
exports.awaitMessage = async (client, msg, start, error) => {
  const message = await msg.channel.send(`<@!${msg.member.id}> | **${error}** | You have **30** seconds to respond to this prompt with a valid argument. Type **"ABORT"** to abort this prompt.`)
    .catch((err) => { throw client.funcs.newError(err); });

  const param = await msg.channel.awaitMessages(response => response.member.id === msg.author.id && response.id !== message.id, { max: 1, time: 30000, errors: ["time"] });
  if (param.first().content.toLowerCase() === "abort") throw "Aborted";
  msg.args[msg.args.lastIndexOf(null)] = param.first().content;
  msg.reprompted = true;

  if (message.deletable) message.delete();

  return this.runCommand(client, msg, start);
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
  Promise.all(client.commandFinalizers.map(item => item.run(client, msg, mes, start)));
};
