exports.run = (bot, msg, params) => {
  let command;
  if (bot.commands.has(params[0])) {
    command = params[0];
  } else if (bot.aliases.has(params[0])) {
    command = bot.aliases.get(params[0]);
  }
  if (!command) {
    return msg.channel.sendMessage(`I cannot find the command: ${params[0]}`);
  } else {
    msg.channel.sendMessage(`Reloading: ${command}`)
    .then(() => {bot.reload(command);});
  }
};

exports.help = {
  name: "reload",
  description: "Reloads the command file, if it's been updated or modified.",
  usage: "reload <commandname>",
  aliases: [],
  restrict: (id) => { return id === "139412744439988224"; }
};
