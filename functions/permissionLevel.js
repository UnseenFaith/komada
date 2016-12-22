module.exports = (client, user, guild) => new Promise((resolve, reject) => {
  let permlvl = 0;
  if (guild) {
    const guildConf = client.funcs.confs.get(guild);
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
        if (user.id === client.config.ownerID) {
          permlvl = 10;
        }
        resolve(permlvl);
      });
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
