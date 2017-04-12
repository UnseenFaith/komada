exports.run = (client, w) => {
	client.emit('log', w, 'warn');
};
