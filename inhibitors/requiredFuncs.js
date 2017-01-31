exports.conf = {
  enabled: true,
  spamProtection: false,
  priority: 6,
};

exports.run = (client, msg, cmd) => new Promise((resolve, reject) => {
  if (!cmd.conf.requiredFuncs) resolve();
  cmd.conf.requiredFuncs.forEach((func) => {
    if (!client.funcs.hasOwnProperty(func)) reject(`The client is missing **${func}**, and cannot run.`);
  });
  resolve();
});
