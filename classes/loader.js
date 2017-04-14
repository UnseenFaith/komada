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
		const core = await fs.readdirAsync(`${this.client.coreBaseDir}${path.sep}functions/`)
			.then(files => {
				this.loadFiles(files.filter(file => file.endsWith('.js')), this.client.coreBaseDir, this.loadNewFunction, this.loadFunctions);
				return files.length;
			})
			.catch(() => { fs.ensureDirAsync(`${this.client.coreBaseDir}${path.sep}functions/`).catch(err => this.client.emit('error', this.client.funcs.newError(err))); }) || 0;
		const user = await fs.readdirAsync(`${this.client.clientBaseDir}${path.sep}functions/`)
			.then(files => {
				this.loadFiles(files.filter(file => file.endsWith('.js')), this.client.clientBaseDir, this.loadNewFunction, this.loadFunctions);
				return files.length;
			})
			.catch(() => { fs.ensureDirAsync(`${this.client.clientBaseDir}${path.sep}functions/`).catch(err => this.client.emit('error', this.client.funcs.newError(err))); }) || 0;
		return core + user;
	}

	loadNewFunction(file, dir) {
		this[file.split('.')[0]] = require(`${dir}${path.sep}functions/${file}`);
		delete require.cache[require.resolve(`${dir}${path.sep}functions/${file}`)];
	}

	async reloadFunction(name) {
		const file = `${name}.js`;
		return await fs.readdirAsync(`${this.client.clientBaseDir}${path.sep}functions/`)
			.then(files => {
				if (!files.includes(name)) throw `Could not find a reloadable file named ${file}`;
				if (this[name]) delete this[name];
				this.loadNewFunction(file, this.client.clientBaseDir);
			});
	}

	async loadCommands() {
		this.client.commands.clear();
		this.client.aliases.clear();
		await this.walkCommandDirectories(`${this.client.coreBaseDir}${path.sep}commands/`);
		await this.walkCommandDirectories(`${this.client.clientBaseDir}${path.sep}commands/`);
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

	async reloadCommand(name) {
		const fullCommand = this.client.commands.get(name) || this.client.commands.get(this.client.aliases.get(name));
		const file = `${fullCommand.help.name}.js`;
		const dir = `${this.client.clientBaseDir}${path.sep}commands/${fullCommand.help.category ? `${fullCommand.help.category}/` : ''}`;
		return await fs.readdirAsync(dir)
			.then(files => {
				if (!files.includes(name)) throw `Could not find a reloadable file named ${file}`;
				this.client.aliases.forEach((cmd, alias) => {
					if (cmd === name) this.client.aliases.delete(alias);
				});
				this.loadNewCommand(file, dir);
			});
	}

	async loadCommandInhibitors() {
		this.client.commandInhibitors.clear();
		await fs.readdirAsync(`${this.client.coreBaseDir}${path.sep}inhibitors/`)
			.then(files => { this.loadFiles(files.filter(file => file.endsWith('.js')), this.client.coreBaseDir, this.loadNewInhibitor, this.loadCommandInhibitors); })
			.catch(() => { fs.ensureDirAsync(`${this.client.coreBaseDir}${path.sep}inhibitors/`).catch(err => this.client.emit('error', this.client.funcs.newError(err))); });
		await fs.readdirAsync(`${this.client.clientBaseDir}${path.sep}inhibitors/`)
			.then(files => { this.loadFiles(files.filter(file => file.endsWith('.js')), this.client.clientBaseDir, this.loadNewInhibitor, this.loadCommandInhibitors); })
			.catch(() => { fs.ensureDirAsync(`${this.client.clientBaseDir}${path.sep}inhibitors/`).catch(err => this.client.emit('error', this.client.funcs.newError(err))); });
		return this.client.commandInhibitors.size;
	}

	loadNewInhibitor(file, dir) {
		this.client.commandInhibitors.set(file.split('.')[0], require(`${dir}${path.sep}inhibitors/${file}`));
		delete require.cache[require.resolve(`${dir}${path.sep}inhibitors/${file}`)];
	}

	async reloadInhibitor(name) {
		const file = `${name}.js`;
		return await fs.readdirAsync(`${this.client.clientBaseDir}${path.sep}inhibitors/`)
			.then(files => {
				if (!files.includes(name)) throw `Could not find a reloadable file named ${file}`;
				this.loadNewInhibitor(file, this.client.clientBaseDir);
			});
	}

	async loadCommandFinalizers() {
		this.client.commandFinalizers.clear();
		await fs.readdirAsync(`${this.client.coreBaseDir}${path.sep}finalizers/`)
			.then(files => { this.loadFiles(files.filter(file => file.endsWith('.js')), this.client.coreBaseDir, this.loadNewFinalizer, this.loadCommandFinalizers); })
			.catch(() => { fs.ensureDirAsync(`${this.client.coreBaseDir}${path.sep}finalizers/`).catch(err => this.client.emit('error', this.client.funcs.newError(err))); });
		await fs.readdirAsync(`${this.client.clientBaseDir}${path.sep}finalizers/`)
			.then(files => { this.loadFiles(files.filter(file => file.endsWith('.js')), this.client.clientBaseDir, this.loadNewFinalizer, this.loadCommandFinalizers); })
			.catch(() => { fs.ensureDirAsync(`${this.client.clientBaseDir}${path.sep}finalizers/`).catch(err => this.client.emit('error', this.client.funcs.newError(err))); });
		return this.client.commandFinalizers.size;
	}

	loadNewFinalizer(file, dir) {
		this.client.commandFinalizers.set(file.split('.')[0], require(`${dir}${path.sep}finalizers/${file}`));
		delete require.cache[require.resolve(`${dir}${path.sep}finalizers/${file}`)];
	}

	async reloadFinalizer(name) {
		const file = `${name}.js`;
		return await fs.readdirAsync(`${this.client.clientBaseDir}${path.sep}finalizers/`)
			.then(files => {
				if (!files.includes(name)) throw `Could not find a reloadable file named ${file}`;
				this.loadNewFinalizer(file, this.client.clientBaseDir);
			});
	}

	async loadEvents() { // Need to becareful here, if the user has an event of the same name, both events will exist, but only the last one will be reloadable
		this.client.eventHandlers.forEach((listener, event) => this.client.removeListener(event, listener));
		this.client.eventHandlers.clear();
		await fs.readdirAsync(`${this.client.coreBaseDir}${path.sep}events/`)
			.then(files => { this.loadFiles(files.filter(file => file.endsWith('.js')), this.client.coreBaseDir, this.loadNewEvent, this.loadEvents); })
			.catch(() => { fs.ensureDirAsync(`${this.client.coreBaseDir}${path.sep}events/`).catch(err => this.client.emit('error', this.client.funcs.newError(err))); });
		await fs.readdirAsync(`${this.client.clientBaseDir}${path.sep}events/`)
			.then(files => { this.loadFiles(files.filter(file => file.endsWith('.js')), this.client.clientBaseDir, this.loadNewEvent, this.loadEvents); })
			.catch(() => { fs.ensureDirAsync(`${this.client.clientBaseDir}${path.sep}events/`).catch(err => this.client.emit('error', this.client.funcs.newError(err))); });
		return this.client.eventHandlers.size;
	}

	loadNewEvent(file, dir) {
		const eventName = file.split('.')[0];
		this.client.eventHandlers.set(eventName, (...args) => require(`${dir}${path.sep}events/${file}`).run(this.client, ...args));
		this.client.on(eventName, this.client.eventHandlers.get(eventName));
		delete require.cache[require.resolve(`${dir}${path.sep}events/${file}`)];
	}

	async reloadEvent(name) {
		const file = `${name}.js`;
		return await fs.readdirAsync(`${this.client.clientBaseDir}${path.sep}events/`)
			.then(files => {
				if (!files.includes(name)) throw `Could not find a reloadable file named ${file}`;
				const listener = this.client.eventHandlers.get(name);
				if (this.client.eventHandlers.has(name)) this.client.removeListener(name, listener);
				this.loadNewEvent(file, this.client.clientBaseDir);
			});
	}

	async loadMessageMonitors() {
		this.client.messageMonitors.clear();
		await fs.readdirAsync(`${this.client.coreBaseDir}${path.sep}monitors/`)
			.then(files => { this.loadFiles(files.filter(file => file.endsWith('.js')), this.client.coreBaseDir, this.loadNewMessageMonitor, this.loadMessageMonitors); })
			.catch(() => { fs.ensureDirAsync(`${this.client.coreBaseDir}${path.sep}monitors/`).catch(err => this.client.emit('error', this.client.funcs.newError(err))); });
		await fs.readdirAsync(`${this.client.clientBaseDir}${path.sep}monitors/`)
			.then(files => { this.loadFiles(files.filter(file => file.endsWith('.js')), this.client.clientBaseDir, this.loadNewMessageMonitor, this.loadMessageMonitors); })
			.catch(() => { fs.ensureDirAsync(`${this.client.clientBaseDir}${path.sep}monitors/`).catch(err => this.client.emit('error', this.client.funcs.newError(err))); });
		return this.client.messageMonitors.size;
	}

	loadNewMessageMonitor(file, dir) {
		this.client.messageMonitors.set(file.split('.')[0], require(`${dir}${path.sep}monitors/${file}`));
		delete require.cache[require.resolve(`${dir}${path.sep}monitors/${file}`)];
	}

	async reloadMessageMonitor(name) {
		const file = `${name}.js`;
		return await fs.readdirAsync(`${this.client.clientBaseDir}${path.sep}monitors/`)
			.then(files => {
				if (!files.includes(name)) throw `Could not find a reloadable file named ${file}`;
				this.loadNewMessageMonitor(file, this.client.clientBaseDir);
			});
	}

	async loadProviders() {
		this.client.providers.clear();
		await fs.readdirAsync(`${this.client.coreBaseDir}${path.sep}providers/`)
			.then(files => { this.loadFiles(files.filter(file => file.endsWith('.js')), this.client.coreBaseDir, this.loadNewProvider, this.loadProviders); })
			.catch(() => { fs.ensureDirAsync(`${this.client.coreBaseDir}${path.sep}providers/`).catch(err => this.client.emit('error', this.client.funcs.newError(err))); });
		await fs.readdirAsync(`${this.client.clientBaseDir}${path.sep}providers/`)
			.then(files => { this.loadFiles(files.filter(file => file.endsWith('.js')), this.client.clientBaseDir, this.loadNewProvider, this.loadProviders); })
			.catch(() => { fs.ensureDirAsync(`${this.client.clientBaseDir}${path.sep}providers/`).catch(err => this.client.emit('error', this.client.funcs.newError(err))); });
		return this.client.providers.size;
	}

	loadNewProvider(file, dir) {
		this.client.providers.set(file.split('.')[0], require(`${dir}${path.sep}providers/${file}`));
		delete require.cache[require.resolve(`${dir}${path.sep}providers/${file}`)];
	}

	async reloadProvider(name) {
		const file = `${name}.js`;
		return await fs.readdirAsync(`${this.client.clientBaseDir}${path.sep}providers/`)
			.then(files => {
				if (!files.includes(name)) throw `Could not find a reloadable file named ${file}`;
				this.loadNewProvider(file, this.client.clientBaseDir);
			});
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

};
