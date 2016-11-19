module.exports = (client, user, guild = null) => {
  return new Promise((resolve, reject) => {
    const guildConf = client.funcs.confs.get(guild);
    let permlvl = 0;
    if (guild) {
      try {
        const member = guild.member(user);
        const mod_role = guild.roles.find("name", guildConf.mod_role);
        if (mod_role && member.roles.has(mod_role.id)) {
          permlvl = 2;
        }
        const admin_role = guild.roles.find("name", guildConf.admin_role);
        if (admin_role && member.roles.has(admin_role.id)) {
          permlvl = 3;
        }
        if (member === guild.owner) {
          permlvl = 4;
        }
      } catch (e) {
        reject(e);
      }
    }
    if (user.id === client.config.ownerid) {
      permlvl = 10;
    }
    resolve(permlvl);
  });
};
