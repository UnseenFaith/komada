const path = require('path');
const fs = require('fs-extra');

module.exports = (client, baseDir, type) => new Promise((resolve, reject) => {
	const dir = path.resolve(`${baseDir}/${type}/`);
	const files = [];
	try {
		fs.walk(dir)
        .on('data', (item) => {
	const fileinfo = path.parse(item.path);
	if (!fileinfo.ext || fileinfo.ext !== '.js') return;
	files.push({
		path: fileinfo.dir,
		name: fileinfo.name,
		base: fileinfo.base,
		ext: fileinfo.ext
	});
})
        .on('end', () => {
	resolve(files);
})
        .on('errors', (root, nodeStatsArray, next) => {
	nodeStatsArray.forEach((n) => {
		client.funcs.log(`[ERROR] " ${n.name}, "error"`);
		client.funcs.log(n.error.message || `${n.error.code}: ${n.error.path}`, 'error');
	});
	next();
});
	} catch (err) {
		reject(err);
	}
});
