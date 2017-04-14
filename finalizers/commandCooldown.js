exports.run = (client, msg, mes, cmd) => {
	if (msg.author.id === client.config.ownerID) return;
	if (!cmd.conf.cooldown || cmd.conf.cooldown <= 0) return;

	cmd.cooldown.set(msg.author.id, Date.now());
	setTimeout(() => cmd.cooldown.delete(msg.author.id), cmd.conf.cooldown * 1000);
};
