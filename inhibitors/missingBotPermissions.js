exports.conf = {
	enabled: true,
	spamProtection: false,
	priority: 7
};

exports.run = (client, msg, cmd) => {
	let missing = [];
	if (msg.channel.type === 'text') {
		missing = msg.channel.permissionsFor(client.user).missingPermissions(cmd.conf.botPerms);
	} else {
		const impliedPermissions = client.funcs.impliedPermissions();
		cmd.conf.botPerms.forEach((perm) => {
			if (!impliedPermissions[perm]) missing.push(perm);
		});
	}
	if (missing.length > 0) return `Insufficient permissions, missing: **${client.funcs.toTitleCase(missing.join(', ').split('_').join(' '))}**`;
	return false;
};
