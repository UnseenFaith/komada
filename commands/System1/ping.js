exports.run = (client, msg) => {
  msg.channel.sendMessage("Ping?")
    .then(message => {
      message.edit(`Pong! (took: ${message.createdTimestamp - msg.createdTimestamp}ms)`);
    });
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: []
};

exports.help = {
  name: "ping",
  description: "Ping/Pong command. I wonder what this does? /sarcasm",
  usage: "",
  usageDelim: ""
};
