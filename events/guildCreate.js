exports.run = (client, guild) => {
  if(!guild.available) return;
  client.funcs.confs.add(client, guild);
};
