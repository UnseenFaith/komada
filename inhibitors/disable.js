exports.conf = {
  enabled: true,
  spamProtection: false,
  priority: 9,
};

exports.run = (client, msg, cmd) => {
  if (cmd.conf.enabled) return false;
  return "This command is currently disabled";
};
