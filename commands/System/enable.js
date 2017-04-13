/* eslint-disable no-case-declarations, consistent-return */
exports.run = async (client, msg, [type, name]) => {
	switch (type) {
		case 'inhibitor':
			let inhibitor;
			if (client.commandInhibitors.has(name)) {
				inhibitor = name;
			}
			if (!inhibitor) {
				msg.channel.sendCode('diff', `- I cannot find the inhibitor: ${name}`);
			}
			client.commandInhibitors.get(inhibitor).conf.enabled = true;
			msg.sendCode('diff', `+ Successfully enabled inhibitor: ${name}`);
			break;
		case 'monitor':
			let monitor;
			if (client.messageMonitors.has(name)) {
				monitor = name;
			}
			if (!monitor) {
				return msg.channel.sendCode('diff', `- I cannot find the monitor: ${name}`);
			}
			client.messageMonitors.get(monitor).conf.enabled = true;
			msg.sendCode('diff', `+ Successfully enabled monitor: ${name}`);
			break;
		case 'command':
			let command;
			if (client.commands.has(name)) {
				command = name;
			} else if (client.aliases.has(name)) {
				command = client.aliases.get(name);
			}
			if (!command) {
				return msg.sendCode('diff', `- I cannot find the command: ${name}`);
			}
			client.commands.get(command).conf.enabled = true;
			msg.sendCode('diff', `+ Successfully enabled command: ${name}`);
			break;
    // no default
	}
};

exports.conf = {
	enabled: true,
	runIn: ['text', 'dm', 'group'],
	aliases: [],
	permLevel: 10,
	botPerms: [],
	requiredFuncs: [],
};

exports.help = {
	name: 'enable',
	description: 'Re-enables or temporarily enables a Inhibitor/Command/Monitor. Default state restored on reboot.',
	usage: '<type:str> <name:str>',
	usageDelim: ' ',
};
