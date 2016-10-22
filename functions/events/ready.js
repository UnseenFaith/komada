exports.run = (client) => {
  client.funcs.log(`Komada: Ready to serve ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} servers.`);
  client.config.prefixMention = new RegExp(`^<@!?${client.user.id}>`);
};
