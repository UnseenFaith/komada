const fs = require('fs-extra-promise');
const { exec } = require('child_process');
const path = require('path');

const ParsedUsage = require('./parsedUsage');

module.exports = class Loader {

	constructor(client) {
		this.client = client;
	}

	async loadAll() {
		const [funcs, [commands, aliases], inhibitors, finalizers, events, monitors, providers] = await Promise.all(
				[this.loadFunctions(), this.loadCommands(), this.loadCommandInhibitors(), this.loadCommandFinalizers(), this.loadEvents(), this.loadMessageMonitors(), this.loadProviders()]
			);
		this.client.emit('log', `Loaded ${funcs} functions.`);
		this.client.emit('log', `Loaded ${commands} commands, with ${aliases} aliases.`);
		this.client.emit('log', `Loaded ${inhibitors} command inhibitors.`);
		this.client.emit('log', `Loaded ${finalizers} command finalizers.`);
		this.client.emit('log', `Loaded ${monitors} message monitors.`);
		this.client.emit('log', `Loaded ${providers} providers.`);
		this.client.emit('log', `Loaded ${events} events`);
	}

	async loadFunctions() {
		const core = await fs.readdirAsync(`${this.client.coreBaseDir}./functions/`)
			.then(files => {
				this.loadFiles(files.filter(file => file.endsWith('.js')), this.client.coreBaseDir, this.loadNewFunction, this.loadFunctions);
				return files.length;
			})
			.catch(() => { fs.ensureDirAsync(`${this.client.coreBaseDir}./functions/`).catch(err => this.client.emit('error', this.client.funcs.newError(err))); }) || 0;
		const user = await fs.readdirAsync(`${this.client.clientBaseDir}./functions/`)
			.then(files => {
				this.loadFiles(files.filter(file => file.endsWith('.js')), this.client.coreBaseDir, this.loadNewFunction, this.loadFunctions);
				return files.length;
			})
			.catch(() => { fs.ensureDirAsync(`${this.client.clientBaseDir}./functions/`).catch(err => this.client.emit('error', this.client.funcs.newError(err))); }) || 0;
		return core + user;
	}

	loadNewFunction(file, dir) {
		this[file.split('.')[0]] = require(`${dir}./functions/${file}`);
		delete require.cache[require.resolve(`${dir}./functions/${file}`)];
	}

	async loadCommands() {
		this.client.commands.clear();
		this.client.aliases.clear();
		await Promise.all([this.walkCommandDirectories(`${this.client.coreBaseDir}./commands/`), this.walkCommandDirectories(`${this.client.clientBaseDir}./commands/`)]);
		return [this.client.commands.size, this.client.aliases.size];
	}

	async walkCommandDirectories(dir) {
		return await fs.readdirAsync(dir)
			.then(async(files) => {
				this.loadFiles(files.filter(file => file.endsWith('.js')), dir, this.loadNewCommand, this.loadCommands);
				let mps = [];
				const subfolders = [];
				files.filter(file => !file.includes('.')).forEach((folder) => {
					mps.push(new Promise(async(res) => {
						const subFiles = await fs.readdirAsync(`${dir}${folder}/`);
						this.loadFiles(subFiles.filter(file => file.endsWith('.js')).map(file => `${folder}/${file}`), dir, this.loadNewCommand, this.loadCommands);
						subFiles.filter(file => !file.includes('.')).forEach(subfolder => subfolders.push({ folder: folder, subfolder: subfolder }));
						res();
					}));
				});
				mps = await Promise.all(mps);
				subfolders.forEach(async(subfolder) => {
					mps.push(new Promise(async(res) => {
						const subSubFiles = await fs.readdirAsync(`${dir}${subfolder.folder}/${subfolder.subfolder}/`);
						// category/subcategory is enough
						this.loadFiles(subSubFiles.filter(file => file.endsWith('.js')).map(file => `${subfolder.folder}/${subfolder.subfolder}/${file}`), dir, this.loadNewCommand, this.loadCommands);
						res();
					}));
				});
				return await Promise.all(mps);
			})
			.catch(() => { fs.ensureDirAsync(dir).catch(err => this.client.emit('error', this.client.funcs.newError(err))); });
	}

	loadNewCommand(command, dir) {
		const cmd = require(`${dir}${command}`);
		cmd.help.category = command.split('/').slice(0, -1).join('/');
		cmd.cooldown = new Map();
		this.client.commands.set(cmd.help.name, cmd);
		cmd.conf.aliases = cmd.conf.aliases || [];
		cmd.conf.aliases.forEach(alias => this.client.aliases.set(alias, cmd.help.name));
		cmd.usage = new ParsedUsage(this.client, cmd);
		delete require.cache[require.resolve(`${dir}${command}`)];
	}

	async loadCommandInhibitors() {
		this.client.commandInhibitors.clear();
		await fs.readdirAsync(`${this.client.coreBaseDir}./inhibitors/`)
			.then(files => { this.loadFiles(files.filter(file => file.endsWith('.js')), this.client.coreBaseDir, this.loadNewInhibitor, this.loadCommandInhibitors); })
			.catch(() => { fs.ensureDirAsync(`${this.client.coreBaseDir}./inhibitors/`).catch(err => this.client.emit('error', this.client.funcs.newError(err))); });
		await fs.readdirAsync(`${this.client.clientBaseDir}./inhibitors/`)
			.then(files => { this.loadFiles(files.filter(file => file.endsWith('.js')), this.client.coreBaseDir, this.loadNewInhibitor, this.loadCommandInhibitors); })
			.catch(() => { fs.ensureDirAsync(`${this.client.clientBaseDir}./inhibitors/`).catch(err => this.client.emit('error', this.client.funcs.newError(err))); });
		return this.client.commandInhibitors.size;
	}

	loadNewInhibitor(file, dir) {
		this.client.commandInhibitors.set(file.split('.')[0], require(`${dir}./inhibitors/${file}`));
		delete require.cache[require.resolve(`${dir}./inhibitors/${file}`)];
	}

	async loadCommandFinalizers() {
		this.client.commandFinalizers.clear();
		await fs.readdirAsync(`${this.client.coreBaseDir}./finalizers/`)
			.then(files => { this.loadFiles(files.filter(file => file.endsWith('.js')), this.client.coreBaseDir, this.loadNewFinalizer, this.loadCommandFinalizers); })
			.catch(() => { fs.ensureDirAsync(`${this.client.coreBaseDir}./finalizers/`).catch(err => this.client.emit('error', this.client.funcs.newError(err))); });
		await fs.readdirAsync(`${this.client.clientBaseDir}./finalizers/`)
			.then(files => { this.loadFiles(files.filter(file => file.endsWith('.js')), this.client.coreBaseDir, this.loadNewFinalizer, this.loadCommandFinalizers); })
			.catch(() => { fs.ensureDirAsync(`${this.client.clientBaseDir}./finalizers/`).catch(err => this.client.emit('error', this.client.funcs.newError(err))); });
		return this.client.commandFinalizers.size;
	}

	loadNewFinalizer(file, dir) {
		this.client.commandFinalizers.set(file.split('.')[0], require(`${dir}./finalizers/${file}`));
		delete require.cache[require.resolve(`${dir}./finalizers/${file}`)];
	}

	async loadEvents() { // Need to becareful here, if the user has an event of the same name, both events will exist, but only the last one will be reloadable
		this.client.eventHandlers.forEach((listener, event) => this.client.removeListener(event, listener));
		this.client.eventHandlers.clear();
		await fs.readdirAsync(`${this.client.coreBaseDir}./events/`)
			.then(files => { this.loadFiles(files.filter(file => file.endsWith('.js')), this.client.coreBaseDir, this.loadNewEvent, this.loadEvents); })
			.catch(() => { fs.ensureDirAsync(`${this.client.coreBaseDir}./events/`).catch(err => this.client.emit('error', this.client.funcs.newError(err))); });
		await fs.readdirAsync(`${this.client.clientBaseDir}./events/`)
			.then(files => { this.loadFiles(files.filter(file => file.endsWith('.js')), this.client.coreBaseDir, this.loadNewEvent, this.loadEvents); })
			.catch(() => { fs.ensureDirAsync(`${this.client.clientBaseDir}./events/`).catch(err => this.client.emit('error', this.client.funcs.newError(err))); });
		return this.client.eventHandlers.size;
	}

	loadNewEvent(file, dir) {
		const eventName = file.split('.')[0];
		this.client.eventHandlers.set(eventName, (...args) => require(`${dir}./events/${file}`).run(this.client, ...args));
		this.client.on(eventName, this.client.eventHandlers.get(eventName));
		delete require.cache[require.resolve(`${dir}./events/${file}`)];
	}

	async loadMessageMonitors() {
		this.client.messageMonitors.clear();
		await fs.readdirAsync(`${this.client.coreBaseDir}./monitors/`)
			.then(files => { this.loadFiles(files.filter(file => file.endsWith('.js')), this.client.coreBaseDir, this.loadNewMessageMonitor, this.loadMessageMonitors); })
			.catch(() => { fs.ensureDirAsync(`${this.client.coreBaseDir}./monitors/`).catch(err => this.client.emit('error', this.client.funcs.newError(err))); });
		await fs.readdirAsync(`${this.client.clientBaseDir}./monitors/`)
			.then(files => { this.loadFiles(files.filter(file => file.endsWith('.js')), this.client.coreBaseDir, this.loadNewMessageMonitor, this.loadMessageMonitors); })
			.catch(() => { fs.ensureDirAsync(`${this.client.clientBaseDir}./monitors/`).catch(err => this.client.emit('error', this.client.funcs.newError(err))); });
		return this.client.messageMonitors.size;
	}

	loadNewMessageMonitor(file, dir) {
		this.client.messageMonitors.set(file.split('.')[0], require(`${dir}./monitors/${file}`));
		delete require.cache[require.resolve(`${dir}./monitors/${file}`)];
	}

	async loadProviders() {
		this.client.messageMonitors.clear();
		await fs.readdirAsync(`${this.client.coreBaseDir}./providers/`)
			.then(files => { this.loadFiles(files.filter(file => file.endsWith('.js')), this.client.coreBaseDir, this.loadNewProvider, this.loadProviders); })
			.catch(() => { fs.ensureDirAsync(`${this.client.coreBaseDir}./providers/`).catch(err => this.client.emit('error', this.client.funcs.newError(err))); });
		await fs.readdirAsync(`${this.client.clientBaseDir}./providers/`)
			.then(files => { this.loadFiles(files.filter(file => file.endsWith('.js')), this.client.coreBaseDir, this.loadNewProvider, this.loadProviders); })
			.catch(() => { fs.ensureDirAsync(`${this.client.clientBaseDir}./providers/`).catch(err => this.client.emit('error', this.client.funcs.newError(err))); });
		return this.client.messageMonitors.size;
	}

	loadNewProvider(file, dir) {
		this.client.messageMonitors.set(file.split('.')[0], require(`${dir}./providers/${file}`));
		delete require.cache[require.resolve(`${dir}./providers/${file}`)];
	}

	async loadFiles(files, dir, loadNew, startOver) {
		try {
			files.forEach(file => loadNew.call(this, file, dir));
		} catch (error) {
			if (error.code === 'MODULE_NOT_FOUND') {
				await this.handleMissingDep(error);
				startOver.call(this);
			} else {
				console.error(error);
			}
		}
	}

	handleMissingDep(err) {
		const module = /'([^']+)'/g.exec(err.toString());
		return this.installNPM(module[1]).catch(error => {
			console.error(error);
			process.exit();
		});
	}

	installNPM(module) {
		return new Promise((resolve, reject) => {
			console.log(`Installing: ${module}`);
			exec(`npm i ${module} --save`, (err, stdout, stderr) => {
				if (err) {
					console.log('=====NEW DEPENDANCY INSTALL FAILED HORRIBLY=====');
					return reject(err);
				} else {
					console.log('=====INSTALLED NEW DEPENDANCY=====');
					console.log(stdout);
					console.error(stderr);
					return resolve();
				}
			});
		});
	}

	/* Probably broke

    reload(command) {
		return new Promise(resolve => {
			const fullCommand = this.client.commands.get(command) || this.client.commands.get(this.client.aliases.get(command));
			const directory = `${fullCommand.help.category ? `${fullCommand.help.category}/` : ''}${fullCommand.help.name}.js`;
			this.client.commands.delete(command);
			this.client.aliases.forEach((cmd, alias) => {
				if (cmd === command) this.client.aliases.delete(alias);
			});
			this.loadNewCommand(directory);
			resolve();
		});
	}

    */

};
