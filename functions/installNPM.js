const exec = require('child_process').exec;

module.exports = module => new Promise((resolve, reject) => {
	console.log(`Installing: ${module}`);
	exec(`npm i ${module}`, (e, stdout, stderr) => {
		if (e) {
			console.log('=====NEW DEPENDANCY INSTALL FAILED HORRIBLY=====');
			reject(e);
		} else {
			console.log('=====INSTALLED NEW DEPENDANCY=====');
			console.log(stdout);
			console.error(stderr);
			resolve();
		}
	});
});
