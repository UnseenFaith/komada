/* eslint-disable no-case-declarations, consistent-return */
exports.run = async (client, msg, [type, name]) => {
	switch (type) {
		case 'inhibitor':
			let inhibitor;
			if (client.commandInhibitors.has(name)) {
				inhibitor = name;
			}
			if (!inhibitor) {
				msg.sendCode('diff', `- I cannot find the inhibitor: ${name}`);
			}
			client.commandInhibitors.get(inhibitor).conf.enabled = false;
			msg.sendCode('diff', `+ Successfully disabled inhibitor: ${name}`);
			break;
		case 'monitor':
			let monitor;
			if (client.messageMonitors.has(name)) {
				monitor = name;
			}
			if (!monitor) {
				return msg.sendCode('diff', `- I cannot find the monitor: ${name}`);
			}
			client.messageMonitors.get(monitor).conf.enabled = false;
			msg.sendCode('diff', `+ Successfully disabled monitor: ${name}`);
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
			client.commands.get(command).conf.enabled = false;
			msg.sendCode('diff', `+ Successfully disabled command: ${name}`);
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
	name: 'disable',
	description: 'Temporarily disables the inhibitor/monitor/command. Resets upon reboot.',
	usage: '<type:str> <name:str>',
	usageDelim: ' ',
};
