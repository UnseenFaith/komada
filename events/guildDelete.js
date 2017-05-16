exports.run = (client, guild) => {
  if (!guild.available) return;
  client.settings.remove(guild);
};
