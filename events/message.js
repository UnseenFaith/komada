exports.run = async (client, msg) => {
	if (!client.ready) return;
	await this.runMessageMonitors(client, msg);
	client.i18n.use(msg.guildConf.lang);
	if (!client.funcs.handleMessage(client, msg)) return;
	const command = client.funcs.parseCommand(client, msg);
	client.funcs.handleCommand(client, msg, command);
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
