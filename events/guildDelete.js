exports.run = (client, guild) => {
  if (guild.available) client.configuration.remove(guild);
};
