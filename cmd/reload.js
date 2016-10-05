exports.run = (bot, msg, params) => {
  let command = params[0];
  bot.reload(command);
};

exports.help = {
  name: "reload",
  description: "Reloads the command file, if it's been updated or modified.",
  usage: "reload <commandname>",
  aliases: [],
  restrict: (id) => { return id === "139412744439988224" }
};
