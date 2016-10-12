let config = require("../../config.json").commandInhibitors;

if (config === undefined) config = [];

exports.conf = {
  enabled: config.includes("permissions")
};

exports.run = (bot, msg, cmd) => {
  return new Promise ((resolve, reject) => {
    let permlvl = 0;
    if(msg.guild) {
      let mod_role = msg.guild.roles.find("name", "Mods");
      if(mod_role && msg.member.roles.has(mod_role.id)) permlvl = 2;
      let admin_role = msg.guild.roles.find("name", "Devs");
      if(admin_role && msg.member.roles.has(admin_role.id)) permlvl = 3;
    }
    if(msg.author.id === bot.config.ownerid) permlvl = 4;
    if (permlvl >= cmd.conf.permLevel) {
      resolve();
    } else {
      reject("You do not have permission to use this command.");
    }
  });
};
