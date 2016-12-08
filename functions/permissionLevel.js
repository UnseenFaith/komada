module.exports = (client, user, guild = null) => new Promise((resolve, reject) => {
  const guildConf = client.funcs.confs.get(guild);
  let permlvl = 0;
  if (guild) {
    try {
      const modRole = guild.roles.find("name", guildConf.modRole);
      guild.fetchMember(user).then((member) => {
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
        if (user.id === client.config.ownerid) {
          permlvl = 10;
        }
        resolve(permlvl);
      });
    } catch (e) {
      reject(e);
    }
  }
});
