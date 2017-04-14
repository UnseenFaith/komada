exports.run = async (client, msg, [type, name]) => {
	switch (type) {
		case 'function':
			if (name === 'all') {
				await client.funcs.loadFunctions();
				await Promise.all(Object.keys(this.funcs).map(key => {
					if (this.funcs[key].init) return this.funcs[key].init(this);
					else return true;
				}));
				msg.sendMessage('✅ Reloaded all functions.');
			} else {
				await msg.sendMessage(`Attempting to reload function ${name}`);
				await client.funcs.reloadFunction(name)
					.then(mes => msg.sendMessage(`✅ ${mes}`))
					.catch(err => msg.sendMessage(`❌ ${err}`));
			}
			break;
		case 'inhibitor':
			if (name === 'all') {
				await client.funcs.loadCommandInhibitors();
				await Promise.all(this.commandInhibitors.map((piece) => {
					if (piece.init) return piece.init(this);
					else return true;
				}));
				msg.sendMessage('✅ Reloaded all inhibitors.');
			} else {
				await msg.sendMessage(`Attempting to reload inhibitor ${name}`);
				await client.funcs.reloadInhibitor(name)
					.then(mes => msg.sendMessage(`✅ ${mes}`))
					.catch(err => msg.sendMessage(`❌ ${err}`));
			}
			break;
		case 'finalizer':
			if (name === 'all') {
				await client.funcs.loadCommandFinalizers();
				await Promise.all(this.commandFinalizers.map((piece) => {
					if (piece.init) return piece.init(this);
					else return true;
				}));
				msg.sendMessage('✅ Reloaded all finalizers.');
			} else {
				await msg.sendMessage(`Attempting to reload finalizer ${name}`);
				await client.funcs.reloadFinalizer(name)
					.then(mes => msg.sendMessage(`✅ ${mes}`))
					.catch(err => msg.sendMessage(`❌ ${err}`));
			}
			break;
		case 'event':
			if (name === 'all') {
				await client.funcs.loadEvents();
				msg.sendMessage('✅ Reloaded all events.');
			} else {
				await msg.sendMessage(`Attempting to reload event: ${name}`);
				await client.funcs.reloadEvent(name)
					.then(mes => msg.sendMessage(`✅ ${mes}`))
					.catch(err => msg.sendMessage(`❌ ${err}`));
			}
			break;
		case 'monitor':
			if (name === 'all') {
				await client.funcs.loadMessageMonitors();
				await Promise.all(this.messageMonitors.map((piece) => {
					if (piece.init) return piece.init(this);
					else return true;
				}));
				msg.sendMessage('✅ Reloaded all monitors.');
			} else {
				await msg.sendMessage(`Attempting to reload monitor: ${name}`);
				await client.funcs.reloadMessageMonitor(name)
					.then(mes => msg.sendMessage(`✅ ${mes}`))
					.catch(err => msg.sendMessage(`❌ ${err}`));
			}
			break;
		case 'provider':
			if (name === 'all') {
				await client.funcs.loadProviders();
				await Promise.all(this.providers.map((piece) => {
					if (piece.init) return piece.init(this);
					else return true;
				}));
				msg.sendMessage('✅ Reloaded all providers.');
			} else {
				await msg.sendMessage(`Attempting to reload provider: ${name}`);
				await client.funcs.reloadProvider(name)
					.then(mes => msg.sendMessage(`✅ ${mes}`))
					.catch(err => msg.sendMessage(`❌ ${err}`));
			}
			break;
		case 'command':
			if (name === 'all') {
				await client.funcs.loadCommands();
				msg.sendMessage('✅ Reloaded all commands.');
				await Promise.all(this.commands.map((piece) => {
					if (piece.init) return piece.init(this);
					else return true;
				}));
			} else {
				await msg.sendMessage(`Attempting to reload command ${name}`);
				await client.funcs.reloadCommand(name)
					.then(mes => msg.sendMessage(`✅ ${mes}`))
					.catch(err => msg.sendMessage(`❌ ${err}`));
			}
			break;
      // no default
	}
};

exports.conf = {
	enabled: true,
	runIn: ['text', 'dm', 'group'],
	aliases: ['r', 'load'],
	permLevel: 10,
	botPerms: [],
	requiredFuncs: []
};

exports.help = {
	name: 'reload',
	description: "Reloads the command file, if it's been updated or modified.",
	usage: '<function|inhibitor|finalizer|monitor|provider|event|command> <name:str>',
	usageDelim: ' '
};
