exports.conf = {
  enabled: true,
  spamProtection: false,
};

exports.run = (client, msg, cmd) => new Promise((resolve, reject) => {
  if (cmd.conf.enabled && !msg.guildConf.disabledCommands.includes(cmd.help.name)) {
    resolve();
  } else {
    reject("This command is currently disabled");
  }
});
