exports.run = (bot, msg, params = []) => {
  msg.channel.sendMessage('Ping?')
    .then(message => {
      message.edit(`Pong! (took: ${message.createdTimestamp - msg.createdTimestamp}ms)`);
      msg.delete();
    });
};

exports.help = {
  name: "ping",
  description: "Ping/Pong command. I wonder what this does? /sarcasm",
  usage: "ping",
  aliases: []
};
