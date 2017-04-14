exports.conf = {
	enabled: true,
	spamProtection: false
};

exports.run = (client, msg, mes, user, cmd) => {
	if (user.id === client.config.ownerID) return false;
	if (!cmd.conf.cooldown || cmd.conf.cooldown <= 0) return false;

	cmd.cooldown.set(user.id, Date.now());
	setTimeout(() => cmd.cooldown.delete(user.id), cmd.conf.cooldown * 1000);
};
