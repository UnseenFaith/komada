exports.conf = {
  enabled: true,
  spamProtection: false,
  priority: 10,
};

exports.run = (client, msg, cmd) => new Promise(async (resolve, reject) => {
  const permlvl = await client.funcs.permissionLevel(client, msg.author, msg.guild).catch(err => client.funcs.log(err, "error"));
  msg.author.permLevel = permlvl;
  if (permlvl >= cmd.conf.permLevel) {
    resolve();
  } else {
    reject("You do not have permission to use this command.");
  }
});
