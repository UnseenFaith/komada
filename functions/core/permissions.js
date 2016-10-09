module.exports = function(bot, msg) {
  /* This function should resolve to an ELEVATION level which
     is then sent to the command handler for verification*/
  let permlvl = 0;
  if(msg.guild) {
    let mod_role = msg.guild.roles.find("name", "Mods");
    if(mod_role && msg.member.roles.has(mod_role.id)) permlvl = 2;
    let admin_role = msg.guild.roles.find("name", "Devs");
    if(admin_role && msg.member.roles.has(admin_role.id)) permlvl = 3;
  }
  if(msg.author.id === bot.config.ownerid) permlvl = 4;
  return permlvl;
};
