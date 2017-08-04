exports.run = (client, guild) => {
  if (guild.available) client.settings.guilds.create(guild).catch(e => client.emit("log", e, "error"));
};
