const fs = require('fs-extra-promise');
const { exec } = require('child_process');
const { sep } = require('path');

const ParsedUsage = require('./parsedUsage');

module.exports = class Loader {

	constructor(client) {
		this.client = client;
	}

	async loadAll() {
		const [funcs, [commands, aliases], inhibitors, finalizers, events, monitors, providers] = await Promise.all([
			this.loadFunctions(),
			this.loadCommands(),
			this.loadCommandInhibitors(),
			this.loadCommandFinalizers(),
			this.loadEvents(),
			this.loadMessageMonitors(),
			this.loadProviders()
		]);
		this.client.emit('log', `Loaded ${funcs} functions.`);
		this.client.emit('log', `Loaded ${commands} commands, with ${aliases} aliases.`);
		this.client.emit('log', `Loaded ${inhibitors} command inhibitors.`);
		this.client.emit('log', `Loaded ${finalizers} command finalizers.`);
		this.client.emit('log', `Loaded ${monitors} message monitors.`);
		this.client.emit('log', `Loaded ${providers} providers.`);
		this.client.emit('log', `Loaded ${events} events`);
	}

	async loadFunctions() {
		const core = await fs.readdirAsync(`${this.client.coreBaseDir}functions${sep}`)
			.then(files => {
				this.loadFiles(files.filter(file => file.endsWith('.js')), this.client.coreBaseDir, this.loadNewFunction, this.loadFunctions);
				return files.length;
			})
			.catch(() => { fs.ensureDirAsync(`${this.client.coreBaseDir}functions${sep}`).catch(err => this.client.emit('error', this.client.funcs.newError(err))); }) || 0;
		const user = await fs.readdirAsync(`${this.client.clientBaseDir}functions${sep}`)
			.then(files => {
				this.loadFiles(files.filter(file => file.endsWith('.js')), this.client.clientBaseDir, this.loadNewFunction, this.loadFunctions);
				return files.length;
			})
			.catch(() => { fs.ensureDirAsync(`${this.client.clientBaseDir}functions${sep}`).catch(err => this.client.emit('error', this.client.funcs.newError(err))); }) || 0;
		return core + user;
	}

	loadNewFunction(file, dir) {
		this[file.split('.')[0]] = require(`${dir}functions${sep}${file}`);
		delete require.cache[require.resolve(`${dir}functions${sep}${file}`)];
	}

	async reloadFunction(name) {
		const file = name.endsWith('.js') ? name : `${name}.js`;
		if (name.endsWith('.js')) name = name.slice(0, -3);
		return await fs.readdirAsync(`${this.client.clientBaseDir}functions${sep}`)
			.then(files => {
				if (!files.includes(file)) throw `Could not find a reloadable file named ${file}`;
				if (this[name]) delete this[name];
				this.loadFiles([file], this.client.clientBaseDir, this.loadNewFunction, this.reloadFunction);
				if (this.client.funcs[name].init) this.client.funcs[name].init(this.client);
				return `Successfully reloaded the function ${name}.`;
			});
	}

	async loadCommands() {
		this.client.commands.clear();
		this.client.aliases.clear();
		await this.walkCommandDirectories(`${this.client.coreBaseDir}commands${sep}`);
		await this.walkCommandDirectories(`${this.client.clientBaseDir}commands${sep}`);
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
						const subFiles = await fs.readdirAsync(`${dir}${folder}${sep}`);
						this.loadFiles(subFiles.filter(file => file.endsWith('.js')).map(file => `${folder}${sep}${file}`), dir, this.loadNewCommand, this.loadCommands);
						subFiles.filter(file => !file.includes('.')).forEach(subfolder => subfolders.push({ folder: folder, subfolder: subfolder }));
						res();
					}));
				});
				mps = await Promise.all(mps);
				subfolders.forEach(async(subfolder) => {
					mps.push(new Promise(async(res) => {
						const subSubFiles = await fs.readdirAsync(`${dir}${subfolder.folder}/${subfolder.subfolder}${sep}`);
						// category/subcategory is enough
						this.loadFiles(subSubFiles.filter(file => file.endsWith('.js')).map(file => `${subfolder.folder}/${subfolder.subfolder}${sep}${file}`), dir, this.loadNewCommand, this.loadCommands);
						res();
					}));
				});
				return await Promise.all(mps);
			})
			.catch(() => { fs.ensureDirAsync(dir).catch(err => this.client.emit('error', this.client.funcs.newError(err))); });
	}

	loadNewCommand(command, dir) {
		const cmd = require(`${dir}${command}`);
		cmd.help.fullCategory = command.split(sep).slice(0, -1);
		cmd.help.subCategory = cmd.help.fullCategory[1] || 'General';
		cmd.help.category = cmd.help.fullCategory[0] || 'General';
		cmd.cooldown = new Map();
		this.client.commands.set(cmd.help.name, cmd);
		cmd.conf.aliases = cmd.conf.aliases || [];
		cmd.conf.aliases.forEach(alias => this.client.aliases.set(alias, cmd.help.name));
		cmd.usage = new ParsedUsage(this.client, cmd);
		delete require.cache[require.resolve(`${dir}${command}`)];
	}

	async reloadCommand(name) {
		if (name.endsWith('.js')) name = name.slice(0, -3);
		name = name.split('/').join(sep);
		const fullCommand = this.client.commands.get(name) || this.client.commands.get(this.client.aliases.get(name));
		const dir = `${this.client.clientBaseDir}commands${sep}`;
		let file, fileToCheck, dirToCheck;
		if (fullCommand) {
			file = `${fullCommand.help.fullCategory.length !== 0 ? `${fullCommand.help.fullCategory.join(sep)}${sep}` : ''}${fullCommand.help.name}.js`;
			fileToCheck = file.split(sep)[file.split(sep).length - 1];
			dirToCheck = `${dir}${fullCommand.help.fullCategory ? `${fullCommand.help.fullCategory.join(sep)}${sep}` : ''}`;
		} else {
			file = `${name}.js`;
			fileToCheck = file.split(sep)[file.split(sep).length - 1];
			dirToCheck = `${dir}${file.split(sep).slice(0, -1).join(sep)}`;
		}
		return await fs.readdirAsync(dirToCheck)
			.then(files => {
				if (!files.includes(fileToCheck)) throw `Could not find a reloadable file named ${file}`;
				this.client.aliases.forEach((cmd, alias) => {
					if (cmd === name) this.client.aliases.delete(alias);
				});
				this.loadFiles([file], dir, this.loadNewCommand, this.reloadCommand);
				if (this.client.commands.get(name.split(sep)[file.split(sep).length - 1]).init) this.client.commands.get(name.split(sep)[file.split(sep).length - 1]).init(this.client);
				return `Successfully reloaded the command ${name}.`;
			});
	}

	async loadCommandInhibitors() {
		this.client.commandInhibitors.clear();
		await fs.readdirAsync(`${this.client.coreBaseDir}inhibitors${sep}`)
			.then(files => { this.loadFiles(files.filter(file => file.endsWith('.js')), this.client.coreBaseDir, this.loadNewInhibitor, this.loadCommandInhibitors); })
			.catch(() => { fs.ensureDirAsync(`${this.client.coreBaseDir}inhibitors${sep}`).catch(err => this.client.emit('error', this.client.funcs.newError(err))); });
		await fs.readdirAsync(`${this.client.clientBaseDir}inhibitors${sep}`)
			.then(files => { this.loadFiles(files.filter(file => file.endsWith('.js')), this.client.clientBaseDir, this.loadNewInhibitor, this.loadCommandInhibitors); })
			.catch(() => { fs.ensureDirAsync(`${this.client.clientBaseDir}inhibitors${sep}`).catch(err => this.client.emit('error', this.client.funcs.newError(err))); });
		this.sortInhibitors();
		return this.client.commandInhibitors.size;
	}

	loadNewInhibitor(file, dir) {
		this.client.commandInhibitors.set(file.split('.')[0], require(`${dir}inhibitors${sep}${file}`));
		delete require.cache[require.resolve(`${dir}inhibitors${sep}${file}`)];
	}

	async reloadInhibitor(name) {
		const file = name.endsWith('.js') ? name : `${name}.js`;
		if (name.endsWith('.js')) name = name.slice(0, -3);
		return await fs.readdirAsync(`${this.client.clientBaseDir}inhibitors${sep}`)
			.then(files => {
				if (!files.includes(file)) throw `Could not find a reloadable file named ${file}`;
				this.loadFiles([file], this.client.clientBaseDir, this.loadNewInhibitor, this.reloadInhibitor);
				this.sortInhibitors();
				if (this.client.commandInhibitors.get(name).init) this.client.commandInhibitors.get(name).init(this.client);
				return `Successfully reloaded the inhibitor ${name}.`;
			});
	}

	sortInhibitors() {
		this.client.commandInhibitors = this.client.commandInhibitors.sort((low, high) => low.conf.priority < high.conf.priority);
	}

	async loadCommandFinalizers() {
		this.client.commandFinalizers.clear();
		await fs.readdirAsync(`${this.client.coreBaseDir}finalizers${sep}`)
			.then(files => { this.loadFiles(files.filter(file => file.endsWith('.js')), this.client.coreBaseDir, this.loadNewFinalizer, this.loadCommandFinalizers); })
			.catch(() => { fs.ensureDirAsync(`${this.client.coreBaseDir}finalizers${sep}`).catch(err => this.client.emit('error', this.client.funcs.newError(err))); });
		await fs.readdirAsync(`${this.client.clientBaseDir}finalizers${sep}`)
			.then(files => { this.loadFiles(files.filter(file => file.endsWith('.js')), this.client.clientBaseDir, this.loadNewFinalizer, this.loadCommandFinalizers); })
			.catch(() => { fs.ensureDirAsync(`${this.client.clientBaseDir}finalizers${sep}`).catch(err => this.client.emit('error', this.client.funcs.newError(err))); });
		return this.client.commandFinalizers.size;
	}

	loadNewFinalizer(file, dir) {
		this.client.commandFinalizers.set(file.split('.')[0], require(`${dir}finalizers${sep}${file}`));
		delete require.cache[require.resolve(`${dir}finalizers${sep}${file}`)];
	}

	async reloadFinalizer(name) {
		const file = name.endsWith('.js') ? name : `${name}.js`;
		if (name.endsWith('.js')) name = name.slice(0, -3);
		return await fs.readdirAsync(`${this.client.clientBaseDir}finalizers${sep}`)
			.then(files => {
				if (!files.includes(file)) throw `Could not find a reloadable file named ${file}`;
				this.loadFiles([file], this.client.clientBaseDir, this.loadNewFinalizer, this.reloadFinalizer);
				if (this.client.commandFinalizers.get(name).init) this.client.commandFinalizers.get(name).init(this.client);
				return `Successfully reloaded the finalizer ${name}.`;
			});
	}

	async loadEvents() { // Need to becareful here, if the user has an event of the same name, both events will exist, but only the last one will be reloadable
		this.client.eventHandlers.forEach((listener, event) => this.client.removeListener(event, listener));
		this.client.eventHandlers.clear();
		await fs.readdirAsync(`${this.client.coreBaseDir}events${sep}`)
			.then(files => { this.loadFiles(files.filter(file => file.endsWith('.js')), this.client.coreBaseDir, this.loadNewEvent, this.loadEvents); })
			.catch(() => { fs.ensureDirAsync(`${this.client.coreBaseDir}events${sep}`).catch(err => this.client.emit('error', this.client.funcs.newError(err))); });
		await fs.readdirAsync(`${this.client.clientBaseDir}events${sep}`)
			.then(files => { this.loadFiles(files.filter(file => file.endsWith('.js')), this.client.clientBaseDir, this.loadNewEvent, this.loadEvents); })
			.catch(() => { fs.ensureDirAsync(`${this.client.clientBaseDir}events${sep}`).catch(err => this.client.emit('error', this.client.funcs.newError(err))); });
		return this.client.eventHandlers.size;
	}

	loadNewEvent(file, dir) {
		const eventName = file.split('.')[0];
		this.client.eventHandlers.set(eventName, (...args) => require(`${dir}events${sep}${file}`).run(this.client, ...args));
		this.client.on(eventName, this.client.eventHandlers.get(eventName));
		delete require.cache[require.resolve(`${dir}events${sep}${file}`)];
	}

	async reloadEvent(name) {
		const file = name.endsWith('.js') ? name : `${name}.js`;
		if (name.endsWith('.js')) name = name.slice(0, -3);
		return await fs.readdirAsync(`${this.client.clientBaseDir}events${sep}`)
			.then(files => {
				if (!files.includes(file)) throw `Could not find a reloadable file named ${file}`;
				const listener = this.client.eventHandlers.get(name);
				if (this.client.eventHandlers.has(name)) this.client.removeListener(name, listener);
				this.loadFiles([file], this.client.clientBaseDir, this.loadNewEvent, this.reloadEvent);
				return `Successfully reloaded the event ${name}.`;
			});
	}

	async loadMessageMonitors() {
		this.client.messageMonitors.clear();
		await fs.readdirAsync(`${this.client.coreBaseDir}monitors${sep}`)
			.then(files => { this.loadFiles(files.filter(file => file.endsWith('.js')), this.client.coreBaseDir, this.loadNewMessageMonitor, this.loadMessageMonitors); })
			.catch(() => { fs.ensureDirAsync(`${this.client.coreBaseDir}monitors${sep}`).catch(err => this.client.emit('error', this.client.funcs.newError(err))); });
		await fs.readdirAsync(`${this.client.clientBaseDir}monitors${sep}`)
			.then(files => { this.loadFiles(files.filter(file => file.endsWith('.js')), this.client.clientBaseDir, this.loadNewMessageMonitor, this.loadMessageMonitors); })
			.catch(() => { fs.ensureDirAsync(`${this.client.clientBaseDir}monitors${sep}`).catch(err => this.client.emit('error', this.client.funcs.newError(err))); });
		return this.client.messageMonitors.size;
	}

	loadNewMessageMonitor(file, dir) {
		this.client.messageMonitors.set(file.split('.')[0], require(`${dir}monitors${sep}${file}`));
		delete require.cache[require.resolve(`${dir}monitors${sep}${file}`)];
	}

	async reloadMessageMonitor(name) {
		const file = name.endsWith('.js') ? name : `${name}.js`;
		if (name.endsWith('.js')) name = name.slice(0, -3);
		return await fs.readdirAsync(`${this.client.clientBaseDir}monitors${sep}`)
			.then(files => {
				if (!files.includes(file)) throw `Could not find a reloadable file named ${file}`;
				this.loadFiles([file], this.client.clientBaseDir, this.loadNewMessageMonitor, this.reloadMessageMonitor);
				if (this.client.messageMonitors.get(name).init) this.client.messageMonitors.get(name).init(this.client);
				return `Successfully reloaded the monitor ${name}.`;
			});
	}

	async loadProviders() {
		this.client.providers.clear();
		await fs.readdirAsync(`${this.client.coreBaseDir}providers${sep}`)
			.then(files => { this.loadFiles(files.filter(file => file.endsWith('.js')), this.client.coreBaseDir, this.loadNewProvider, this.loadProviders); })
			.catch(() => { fs.ensureDirAsync(`${this.client.coreBaseDir}providers${sep}`).catch(err => this.client.emit('error', this.client.funcs.newError(err))); });
		await fs.readdirAsync(`${this.client.clientBaseDir}providers${sep}`)
			.then(files => { this.loadFiles(files.filter(file => file.endsWith('.js')), this.client.clientBaseDir, this.loadNewProvider, this.loadProviders); })
			.catch(() => { fs.ensureDirAsync(`${this.client.clientBaseDir}providers${sep}`).catch(err => this.client.emit('error', this.client.funcs.newError(err))); });
		return this.client.providers.size;
	}

	loadNewProvider(file, dir) {
		this.client.providers.set(file.split('.')[0], require(`${dir}providers${sep}${file}`));
		delete require.cache[require.resolve(`${dir}providers${sep}${file}`)];
	}

	async reloadProvider(name) {
		const file = name.endsWith('.js') ? name : `${name}.js`;
		if (name.endsWith('.js')) name = name.slice(0, -3);
		return await fs.readdirAsync(`${this.client.clientBaseDir}providers${sep}`)
			.then(files => {
				if (!files.includes(file)) throw `Could not find a reloadable file named ${file}`;
				this.loadFiles([file], this.client.clientBaseDir, this.loadNewProvider, this.reloadProvider);
				if (this.client.providers.get(name).init) this.client.providers.get(name).init(this.client);
				return `Successfully reloaded the provider ${name}.`;
			});
	}

	async loadFiles(files, dir, loadNew, startOver) {
		try {
			files.forEach(file => loadNew.call(this, file, dir));
		} catch (error) {
			if (error.code === 'MODULE_NOT_FOUND') {
				await this.handleMissingDep(error);
				startOver.call(this, files[0]);
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
