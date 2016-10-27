exports.run = (client, guild) => {
  if(!guild.available) return;
  client.funcs.confs.remove(client, guild);
};
