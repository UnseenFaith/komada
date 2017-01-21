module.exports = (client, user, guild) => new Promise(async (resolve, reject) => {
  let permlvl = 0;
  if (guild) {
    const guildConf = client.configuration.get(guild);
    try {
      const modRole = guild.roles.find("name", guildConf.modRole);
      const member = await guild.fetchMember(user).catch(err => client.funcs.log(err, "error"));
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
      if (user.id === client.config.ownerID) {
        permlvl = 10;
      }
      resolve(permlvl);
    } catch (e) {
      reject(e);
    }
  } else {
    if (user.id === client.config.ownerID) {
      permlvl = 10;
    }
    resolve(permlvl);
  }
});
