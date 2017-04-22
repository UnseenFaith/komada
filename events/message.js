const now = require('performance-now');

exports.run = async (client, msg) => {
	if (!client.ready) return;
	await this.runMessageMonitors(client, msg);
	if (!this.handleMessage(client, msg)) return;
	const command = this.parseCommand(client, msg);
	if (!command) return;
	this.handleCommand(client, msg, command);
};

exports.runMessageMonitors = (client, msg) => {
	client.messageMonitors.forEach((monit) => {
		if (monit.conf.enabled) {
			if (monit.conf.ignoreBots && msg.author.bot) return;
			if (monit.conf.ignoreSelf && client.user === msg.author) return;
			monit.run(client, msg);
		}
	});
};

exports.handleMessage = (client, msg, edited = false) => {
	// Ignore Bots if True
	if (client.config.ignoreBots && msg.author.bot) return false;
	// Ignore Self if true
	if (client.config.ignoreSelf && msg.author.id === client.user.id) return false;
	// Ignore other users if selfbot is true
	if (client.config.selfbot && msg.author.id !== client.user.id) return false;
	// Ignore other users if selfbot but config option is false
	if (!client.config.selfbot && msg.author.id === client.user.id) return false;
	// Ignore message if owner doesn't allow editableCommands
	if (!client.config.editableCommands && edited) return false;
	return true;
};

exports.parseCommand = (client, msg, usage = false) => {
	const prefix = this.getPrefix(client, msg);
	if (!prefix) return false;
	const prefixLength = this.getLength(client, msg, prefix);
	if (usage) return prefixLength;
	return msg.content.slice(prefixLength).split(' ')[0].toLowerCase();
};

exports.getLength = (client, msg, prefix) => {
	if (client.config.prefixMention === prefix) return prefix.exec(msg.content)[0].length + 1;
	return prefix.exec(msg.content)[0].length;
};

exports.getPrefix = (client, msg) => {
	if (client.config.prefixMention.test(msg.content)) return client.config.prefixMention;
	let prefix = msg.guildConf.prefix;
	const escape = client.funcs.regExpEsc;
	if (prefix instanceof Array) {
		prefix.forEach((pref) => {
			if (msg.content.startsWith(pref)) prefix = pref;
			else prefix = false;
		});
	}
	if (prefix && msg.content.startsWith(prefix)) return new RegExp(`^${escape(prefix)}`);
	return false;
};

exports.handleCommand = (client, msg, command) => {
	const validCommand = client.commands.get(command) || client.commands.get(client.aliases.get(command));
	if (!validCommand) return;
	const start = now();
	const response = this.runInhibitors(client, msg, validCommand);
	if (response) {
		if (typeof response === 'string') msg.reply(response);
		return;
	}

	msg.cmdMsg = new client.CommandMessage(msg, validCommand);

	this.runCommand(client, msg, start);
};

exports.runCommand = (client, msg, start) => {
	msg.cmdMsg.validateArgs()
		.then(params => {
			msg.cmdMsg.cmd.run(client, msg, params)
				.then(mes => this.runFinalizers(client, msg, mes, start))
				.catch(error => this.handleError(client, msg, error));
		})
		.catch(error => {
			if (error.code === 1 && client.config.cmdPrompt) {
				return this.awaitMessage(client, msg, start, error.message)
					.catch(err => this.handleError(client, msg, err));
			} else {
				return this.handleError(client, msg, error);
			}
		});
};

exports.awaitMessage = async (client, msg, start, error) => {
	const message = await msg.channel.sendMessage(`<@!${msg.member.id}> | **${error}** | You have **30** seconds to respond to this prompt with a valid argument. Type **"ABORT"** to abort this prompt.`)
		.catch(err => { throw client.funcs.newError(err); });

	const param = await msg.channel.awaitMessages(response => response.member.id === msg.author.id && response.id !== message.id, { max: 1, time: 30000, errors: ['time'] });

	if (param.first().content.toLowerCase() === 'abort') throw 'Aborted';
	msg.cmdMsg.args[msg.cmdMsg.args.lastIndexOf(null)] = param.first().content;

	if (message.deletable) message.delete();

	return this.runCommand(client, msg, start);
};

exports.handleError = (client, msg, error) => {
	if (error.stack) {
		client.emit('error', error.stack);
	} else if (error.message) {
		msg.sendCode('JSON', error.message).catch(err => client.emit('error', err));
	} else {
		msg.sendMessage(error).catch(err => client.emit('error', err));
	}
};

exports.runInhibitors = (client, msg, command) => {
	let response;
	client.commandInhibitors.some((inhibitor) => {
		if (inhibitor.conf.enabled) {
			response = inhibitor.run(client, msg, command);
			if (response) return true;
		}
		return false;
	});
	return response;
};

exports.runFinalizers = (client, msg, mes, start) => {
	Promise.all(client.commandFinalizers.map(item => item.run(client, msg, mes, start)));
};
