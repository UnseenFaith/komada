exports.run = async (client, msg) => {
	if (!client.ready) return;
	await client.funcs.runMessageMonitors(client, msg);
	client.i18n.use(msg.guildConf.lang);
	if (!client.funcs.handleMessage(client, msg)) return;
	const command = client.funcs.parseCommand(client, msg);
	client.funcs.handleCommand(client, msg, command);
};
