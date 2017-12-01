exports.run = (client, msg) => {
  if (msg.author.id === client.config.ownerID) return;
  if (!msg.command.conf.cooldown || msg.command.conf.cooldown <= 0) return;

  msg.command.cooldown.set(msg.author.id, Date.now());
  setTimeout(() => msg.command.cooldown.delete(msg.author.id), msg.command.conf.cooldown * 1000);
};
