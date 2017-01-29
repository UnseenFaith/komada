exports.conf = {
  enabled: true,
  spamProtection: false,
  priority: 8,
};

exports.run = (client, msg, cmd) => new Promise((resolve, reject) => {
  if (cmd.conf.runIn.includes(msg.channel.type)) {
    resolve();
  } else {
    reject(`This command is only avaliable in ${cmd.conf.runIn.join(" ")} channels`);
  }
});
