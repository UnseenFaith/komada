exports.conf = {
  enabled: true,
  spamProtection: false
};

exports.run = (client, msg, cmd) => {
  return new Promise((resolve, reject) => {
    client.funcs.permissionLevel(client, msg.author, msg.guild)
      .then(permlvl => {
        if (permlvl >= cmd.conf.permLevel)
          resolve();
        else
          reject("You do not have permission to use this command.");
      });
  });
};
