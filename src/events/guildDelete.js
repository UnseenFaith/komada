exports.run = (client, guild) => {
  if (guild.available) client.settings.guilds.destroy(guild.id).catch(() => null);
};
