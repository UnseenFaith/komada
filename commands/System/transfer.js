const fs = require('fs-extra-promise');
const path = require('path');

exports.run = async (client, msg, [type, name]) => {
	const coreDir = client.coreBaseDir;
	const clientDir = client.clientBaseDir;
	const reload = {
		command: client.funcs.reloadCommand,
		function: client.funcs.reloadFunction,
		inhibitor: client.funcs.reloadInhibitor,
		finalizer: client.funcs.reloadFinalizer,
		event: client.funcs.reloadEvent,
		monitor: client.funcs.reloadMessageMonitor
	};
	if (type !== 'command') {
		fs.copyAsync(path.resolve(`${coreDir}/${type}s/${name}.js`), path.resolve(`${clientDir}/${type}s/${name}.js`))
			.then(() => {
				reload[type](name).catch(response => msg.edit(`❌ ${response}`));
				msg.sendMessage(`✅ Successfully Transferred ${type}: ${name}`);
			})
			.catch((err) => {
				msg.sendMessage(`Transfer of ${type}: ${name} to Client has failed. Please check your Console.`);
				client.emit('error', err.stack);
			});
	} else {
		fs.copyAsync(path.resolve(`${coreDir}/${type}s/System/${name}.js`), path.resolve(`${clientDir}/${type}s/System/${name}.js`))
			.then(() => {
				reload[type](`System/${name}`).catch(response => msg.edit(`❌ ${response}`));
				msg.channel.send(`✅ Successfully Transferred ${type}: ${name}`);
			})
			.catch((err) => {
				msg.sendMessage(`Transfer of ${type}: ${name} to Client has failed. Please check your Console.`);
				client.emit('error', err.stack);
			});
	}
};

exports.conf = {
	enabled: true,
	runIn: ['text', 'dm', 'group'],
	aliases: [],
	permLevel: 10,
	botPerms: [],
	requiredFuncs: []
};

exports.help = {
	name: 'transfer',
	description: 'Transfers a core piece to its respected folder',
	usage: '<command|function|inhibitor|event|monitor> <name:str>',
	usageDelim: ' '
};
