const fs = require('fs-extra-promise');
const path = require('path');

const loadMessageMonitors = (client, baseDir) => new Promise(async (resolve, reject) => {
	const dir = path.resolve(`${baseDir}./monitors/`);
	await fs.ensureDirAsync(dir).catch(err => client.emit('error', client.funcs.newError(err)));
	let files = await client.funcs.getFileListing(client, baseDir, 'monitors').catch(err => client.emit('error', client.funcs.newError(err)));
	files = files.filter(file => !client.messageMonitors.get(file.name));
	try {
		const fn = files.map(f => new Promise((res) => {
			const props = require(`${f.path}${path.sep}${f.base}`);
			if (props.init) props.init(client);
			client.messageMonitors.set(f.name, props);
			res(delete require.cache[require.resolve(`${f.path}${path.sep}${f.base}`)]);
		}));
		await Promise.all(fn).catch(e => client.funcs.log(e, 'error'));
		resolve();
	} catch (e) {
		if (e.code === 'MODULE_NOT_FOUND') {
			const module = /'[^']+'/g.exec(e.toString());
			await client.funcs.installNPM(module[0].slice(1, -1))
      .catch((err) => {
	console.error(err);
	process.exit();
});
			loadMessageMonitors(client, baseDir);
		} else {
			reject(e);
		}
	}
});

module.exports = async (client) => {
	client.messageMonitors.clear();
	await loadMessageMonitors(client, client.clientBaseDir).catch(err => client.emit('error', client.funcs.newError(err)));
	if (client.coreBaseDir !== client.clientBaseDir) {
		await loadMessageMonitors(client, client.coreBaseDir).catch(err => client.emit('error', client.funcs.newError(err)));
	}
	client.funcs.log(`Loaded ${client.messageMonitors.size} command monitors.`);
};
