let config = require("../../config.json").messageProcessors;

if (config === undefined) config = [];

exports.conf = {
  enabled: config.includes("disable")
};

exports.run = (bot, msg, cmd) => {
  return new Promise ((resolve, reject) => {
    if (cmd.conf.enabled) {
      resolve();
    } else {
      msg.channel.sendMessage("This command is currently disabled")
      .then(() => {
        reject();
      });
    }
  });
};
