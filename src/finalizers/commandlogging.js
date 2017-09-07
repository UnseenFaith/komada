const now = require("performance-now");

const colors = {
  prompted: { message: { background: "red" } },
  notprompted: { message: { background: "blue" } },
  user: { message: { background: "yellow", text: "black" } },
  channel: {
    text: { message: { background: "green" } },
    dm: { message: { background: "magenta" } },
    group: { message: { background: "cyan" } },
  },
};

exports.run = (client, msg, mes, start) => {
  if (client.config.cmdLogging) {
    client.emit("log", [
      `${msg.cmd.help.name}(${msg.args.join(", ")})`,
      msg.reprompted ? `${client.console.messages((`[${(now() - start).toFixed(2)}ms]`), colors.prompted.message)}` : `${client.console.messages(`[${(now() - start).toFixed(2)}ms]`, colors.notprompted.message)}`,
      `${client.console.messages(`${msg.author.username}[${msg.author.id}]`, colors.user.message)}`,
      this.channel(msg),
    ].join(" "), "log");
  }
};

exports.channel = (msg) => {
  switch (msg.channel.type) {
    case "text":
      return `${msg.client.console.messages(`${msg.guild.name}[${msg.guild.id}]`, colors.channel.text.message)}`;
    case "dm":
      return `${msg.client.console.messages("Direct Messages", colors.channel.dm.message)}`;
    case "group":
      return `${msg.client.console.messages(`Group DM => ${msg.channel.owner.username}[${msg.channel.owner.id}]`, colors.channel.group.message)}`;
    default:
      return "not going to happen";
  }
};
