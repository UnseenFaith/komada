module.exports = async (client, user, guild = null) => {
  const guildConf = client.funcs.confs.get(guild);
  let permlvl = 0;
  if (guild) {
    try {
      const member = await guild.fetchMember(user);
      const modRole = guild.roles.find("name", guildConf.modRole);
      if (modRole && member.roles.has(modRole.id)) {
        permlvl = 2;
      }
      const adminRole = guild.roles.find("name", guildConf.adminRole);
      if (adminRole && member.roles.has(adminRole.id)) {
        permlvl = 3;
      }
      if (member === guild.owner) {
        permlvl = 4;
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (user.id === client.config.ownerID) {
    permlvl = 10;
  }
  return permlvl;
};
