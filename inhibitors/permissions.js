exports.conf = {
  enabled: true,
  spamProtection: false,
};

exports.run = (client, msg, cmd) => new Promise((resolve, reject) => {
  client.funcs.permissionLevel(client, msg.author, msg.guild)
      .then((permlvl) => {
        if (msg.guild) {
          msg.member.permLevel = permlvl;
        }
        if (permlvl >= cmd.conf.permLevel) {
          resolve();
        } else {
          reject("You do not have permission to use this command.");
        }
      });
});
