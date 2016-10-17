exports.run = (client, msg, [user]) => {
  msg.guild.member(user).ban()
  .then(() => msg.channel.sendMessage(`${user.username}#${user.discriminator} was banned.`))
  .catch(e=>msg.reply(`There was an error trying to ban: ${e}`));
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ["k"],
  permLevel: 3,
  botPerms: ["BAN_MEMBERS"],
  requiredFuncs: []
};

exports.help = {
  name: "ban",
  description: "Bans a mentionned user. Currently does not require reason (no mod-log)",
  usage: "<user:user>",
  usageDelim: ""
};
