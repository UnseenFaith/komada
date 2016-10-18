exports.conf = {
  enabled: true,
  spamProtection: false
};

exports.run = (client, msg, cmd) => {
  return new Promise((resolve, reject) => {
    if (!msg.author.bot) {
      resolve();
    } else {
      reject();
    }
  });
};
