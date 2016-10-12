exports.run = (client) => {
  client.log(`Komada: Ready to serve ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} servers.`);
};
