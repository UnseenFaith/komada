module.exports = async (client, msg, command, args = undefined) => {
	const validCommand = client.commands.get(command) || client.commands.get(client.aliases.get(command));
	if (!validCommand) return;
	const response = this.runInhibitors(client, msg, validCommand);
	if (response) {
		if (typeof response === 'string') msg.reply(response);
		return;
	}
	try {
		const params = await client.funcs.usage.run(client, msg, validCommand, args);
		await validCommand.run(client, msg, params)
			.then(mes => this.runFinalizers(client, msg, mes, validCommand));
	} catch (error) {
		if (error.code === 1 && client.config.cmdPrompt) {
			client.funcs.awaitMessage(client, msg, validCommand, error.args, error.message);
		} else if (error.stack) {
			client.emit('error', error.stack);
		} else if (error.message) {
			msg.sendCode('JSON', error.message).catch(err => client.emit('error', err));
		} else {
			msg.sendMessage(error).catch(err => client.emit('error', err));
		}
	}
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
