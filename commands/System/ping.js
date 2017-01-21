exports.run = async (client, msg) => {
  const message = await msg.channel.sendMessage("Ping?").catch(err => client.funcs.log(err, "error"));
  message.edit(`Pong! (took: ${message.createdTimestamp - msg.createdTimestamp}ms)`);
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
};

exports.help = {
  name: "ping",
  description: "Ping/Pong command. I wonder what this does? /sarcasm",
  usage: "",
  usageDelim: "",
};
