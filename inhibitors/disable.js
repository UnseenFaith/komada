exports.conf = {
  enabled: true,
  spamProtection: false
};

exports.run = (client, msg, cmd) => {
  return new Promise((resolve, reject) => {
    if (cmd.conf.enabled) {
      resolve();
    } else {
      reject("This command is currently disabled");
    }
  });
};
