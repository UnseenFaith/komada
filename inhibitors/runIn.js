exports.conf = {
  enabled: true,
  spamProtection: false,
  priority: 8,
};

exports.run = (client, msg, cmd) => {
  if (!cmd.conf.runIn) return false;
  if (cmd.conf.runIn.includes(msg.channel.type)) {
    return false;
  } else {
    return `This command is only avaliable in ${cmd.conf.runIn.join(" ")} channels`;
  }
};
