exports.conf = {
	enabled: true,
	spamProtection: false,
	priority: 10
};

exports.run = (client, msg, cmd) => {
	if (!msg.guild) {
		if (msg.author.permLevel >= cmd.conf.permLevel) return false;
		return 'You do not have permission to use this command.';
	}
	if (msg.member.permLevel >= cmd.conf.permLevel) return false;
	return 'You do not have permission to use this command.';
};
