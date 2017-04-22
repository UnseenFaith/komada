exports.conf = {
	enabled: true,
	spamProtection: false,
	priority: 10
};

exports.default = [
	{
		check: () => true,
		break: false
	},
	{
		check: () => false,
		break: false
	},
	{
		check: (client, msg) => {
			if (!msg.guild) return false;
			const modRole = msg.guild.roles.find('name', msg.guild.conf.modRole);
			if (modRole && msg.member.roles.has(modRole.id)) return true;
			return false;
		},
		break: false
	},
	{
		check: (client, msg) => {
			if (!msg.guild) return false;
			const adminRole = msg.guild.roles.find('name', msg.guild.conf.adminRole);
			if (adminRole && msg.member.roles.has(adminRole.id)) return true;
			return false;
		},
		break: false
	},
	{
		check: (client, msg) => {
			if (msg.author.id === msg.guild.owner.id) return true;
			return false;
		},
		break: false
	},
	{
		check: () => false,
		break: false
	},
	{
		check: () => false,
		break: false
	},
	{
		check: () => false,
		break: false
	},
	{
		check: () => false,
		break: false
	},
	{
		check: (client, msg) => {
			if (msg.author.id === client.config.ownerID) return true;
			return false;
		},
		break: true
	},
	{
		check: (client, msg) => {
			if (msg.author.id === client.config.ownerID) return true;
			return false;
		},
		break: false
	}
];

exports.run = (client, msg, cmd) => {
	const permStructure = client.config.permStructure || this.default;
	for (let i = cmd.conf.permLevel; i < 11; i++) {
		if (i === 11) return true;
		if (permStructure[i].check(client, msg, cmd)) return false;
		if (permStructure[i].break) break;
	}
	return 'You do not have permission to use this command.';
};
