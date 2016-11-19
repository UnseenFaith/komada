exports.conf = {
  enabled: true,
  spamProtection: false,
};

exports.run = (client, msg, cmd) => {
  return new Promise((resolve, reject) => {
    if (msg.guild || !cmd.conf.guildOnly) {
      resolve();
    } else {
      reject("This command is only available in a guild.");
    }
  });
};
