exports.run = async (client, msg) => {
	try {
		const message = await msg.sendMessage('Ping?');
		await message.edit(`Pong! (Roundtrip took: ${message.createdTimestamp - msg.createdTimestamp}ms. Heartbeat: ${client.ping}ms.)`);
	} catch (err) {
		client.emit('error', err);
	}
};

exports.conf = {
	enabled: true,
	runIn: ['text', 'dm', 'group'],
	aliases: [],
	permLevel: 0,
	botPerms: [],
	requiredFuncs: [],
};

exports.help = {
	name: 'ping',
	description: 'Ping/Pong command. I wonder what this does? /sarcasm',
	usage: '',
	usageDelim: '',
};
