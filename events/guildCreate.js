exports.run = (client, guild) => {
  if (guild.available) client.settingGateway.create(guild);
};
