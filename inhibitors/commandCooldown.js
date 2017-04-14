exports.conf = {
	enabled: true,
	priority: 11
};

exports.run = (client, msg, cmd) => {
	if (msg.author.id === client.config.ownerID) return false;
	if (!cmd.conf.cooldown || cmd.conf.cooldown <= 0) return false;

	const instance = cmd.cooldown.get(msg.author.id);

	if (!instance) return false;

	const remaining = ((cmd.conf.cooldown * 1000) - (Date.now() - instance)) / 1000;
	return `You have just used this command. You can use this command again in ${Math.ceil(remaining)} seconds.`;
};
