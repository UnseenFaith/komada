exports.run = async(client, msg) => {
	if (!client.config.selfbot) {
		const invite = await client.generateInvite([...new Set(client.commands.reduce((a, b) => a.concat(b.conf.botPerms), ['READ_MESSAGES', 'SEND_MESSAGES']))]);
		msg.channel.sendMessage([
			`To add ${client.user.username} to your discord guild:`,
			invite,
			'```The above link is generated requesting the minimum permissions required to use every command currently. I know not all permissions are right for every server, so don\'t be afraid to uncheck any of the boxes. If you try to use a command that requires more permissions than the bot is granted, it will let you know.```',
			'Please file an issue at <https://github.com/dirigeants/komada> if you find any bugs.'
		]);
	} else {
		msg.reply('Why would you need an invite link for a selfbot...');
	}
};

exports.help = {
	name: 'invite',
	description: 'Displays the join server link of the bot.',
	usage: '',
	usageDelim: ''
};

exports.conf = {
	enabled: true,
	runIn: ['text'],
	aliases: [],
	permLevel: 0,
	botPerms: [],
	requiredFuncs: []
};
