exports.conf = {
  enabled: true,
  spamProtection: false
};

exports.run = (client, msg, cmd) => {
  return new Promise((resolve, reject) => {
    if(client.config.selfbot) {
      if (msg.author === client.user) {
        resolve();
      } else {
        reject();
      }
    } else {
      resolve();
    }
  });
};
