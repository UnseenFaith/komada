exports.run = (client, guild) => {
  if (!guild.available) return;
  client.configuration.insert(guild);
};
