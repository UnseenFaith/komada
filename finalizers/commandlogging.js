const chalk = require("chalk");
const now = require("performance-now");

exports.run = (client, msg, mes, start) => {
  if (client.config.cmdLogging) {
    chalk.enabled = !client.config.disableLogColor;
    client.emit("log", [
      `${msg.cmdMsg.cmd.help.name}(${msg.cmdMsg.args.join(", ")})`,
      msg.cmdMsg.reprompted ? `${chalk.bgRed(`[${(now() - start).toFixed(2)}ms]`)}` : `${chalk.bgBlue(`[${(now() - start).toFixed(2)}ms]`)}`,
      `${chalk.black.bgYellow(`${msg.author.username}[${msg.author.id}]`)}`,
      this.channel(msg),
    ].join(" "), "log");
  }
};

exports.channel = (msg) => {
  switch (msg.channel.type) {
    case "text":
      return `${chalk.bgGreen(`${msg.guild.name}[${msg.guild.id}]`)}`;
    case "dm":
      return `${chalk.bgMagenta("Direct Messages")}`;
    case "group":
      return `${chalk.bgCyan(`Group DM => ${msg.channel.owner.username}[${msg.channel.owner.id}]`)}`;
    default:
      return "not going to happen";
  }
};
