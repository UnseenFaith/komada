module.exports = async (client, msg, command, args = undefined) => {
	const validCommand = this.getCommand(client, command);
	if (!validCommand) return;
	const response = this.runInhibitors(client, msg, validCommand);
	if (response) {
		if (typeof response === 'string') msg.reply(response);
		return;
	}
	try {
		const params = await client.funcs.usage.run(client, msg, validCommand, args);
		validCommand.run(client, msg, params)
			.then(mes => this.runFinalizers(client, msg, mes, validCommand));
	} catch (error) {
		if (error) {
			if (error.code === 1 && client.config.cmdPrompt) {
				client.funcs.awaitMessage(client, msg, validCommand, error.args, error.message);
			} else {
				if (error.stack) client.emit('error', error.stack);
				msg.channel.sendCode('JSON', error.message || error).catch(err => client.emit('error', err));
			}
		}
	}
};

exports.getCommand = (client, command) => {
	if (client.commands.has(command)) {
		return client.commands.get(command);
	} else if (client.aliases.has(command)) {
		return client.commands.get(client.aliases.get(command));
	}
	return false;
};

exports.runInhibitors = (client, msg, command) => {
	let response;
	client.commandInhibitors.some((inhibitor) => { // eslint-disable-line
		if (inhibitor.conf.enabled) {
			response = inhibitor.run(client, msg, command);
			if (response) return true;
		}
	});
	return response;
};

exports.runFinalizers = (client, msg, mes, command) => {
	Promise.all(client.commandFinalizers.map(item => item.run(client, msg, mes, command)));
};
