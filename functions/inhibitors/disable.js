let config = require("../../config.json").commandInhibitors;

if (config === undefined) config = [];

exports.conf = {
  enabled: config.includes("disable"),
  spamProtection: false
};

exports.run = (bot, msg, cmd) => {
  return new Promise ((resolve, reject) => {
    if (cmd.conf.enabled) {
      resolve();
    } else {
      reject("This command is currently disabled");
    }
  });
};
