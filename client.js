const Discord = require('discord.js');
const { sep } = require('path');
const now = require('performance-now');

const Loader = require('./classes/loader.js');
const ArgResolver = require('./classes/argResolver.js');
 /* Will Change this later */
const Config = require('./classes/Configuration Types/Config.js');

require('./classes/Extendables.js');

module.exports = class Komada extends Discord.Client {

	constructor(config = {}) {
		if (typeof config !== 'object') throw new TypeError('Configuration for Komada must be an object.');
		super(config.clientOptions);
		this.config = config;
		this.funcs = new Loader(this);
		this.argResolver = new ArgResolver(this);
		this.helpStructure = new Map();
		this.commands = new Discord.Collection();
		this.aliases = new Discord.Collection();
		this.commandInhibitors = new Discord.Collection();
		this.commandFinalizers = new Discord.Collection();
		this.messageMonitors = new Discord.Collection();
		this.providers = new Discord.Collection();
		this.eventHandlers = new Discord.Collection();
		this.commandMessages = new Discord.Collection();
		this.commandMessageLifetime = config.commandMessageLifetime || 1800;
		this.commandMessageSweep = config.commandMessageSweep || 900;
		this.ready = false;
		this.methods = {
			Collection: Discord.Collection,
			Embed: Discord.RichEmbed,
			MessageCollector: Discord.MessageCollector,
			Webhook: Discord.WebhookClient,
			escapeMarkdown: Discord.escapeMarkdown,
			splitMessage: Discord.splitMessage
		};
		this.coreBaseDir = `${__dirname}${sep}`;
		this.clientBaseDir = `${process.env.clientDir || process.cwd()}${sep}`;
		this.guildConfs = Config.guildConfs;
		this.configuration = Config;
	}

	async login(token) {
		const start = now();
		await this.loadEverything();
		this.emit('log', `Loaded in ${(now() - start).toFixed(2)}ms.`);
		super.login(token);
	}

	async loadEverything() {
		await this.funcs.loadAll(this);
		this.once('ready', async () => {
			this.config.prefixMention = new RegExp(`^<@!?${this.user.id}>`);
			await Promise.all(Object.keys(this.funcs).map(key => {
				if (this.funcs[key].init) return this.funcs[key].init(this);
				else return true;
			}));
			await Promise.all(this.providers.map((piece) => {
				if (piece.init) return piece.init(this);
				else return true;
			}));
			await Promise.all(this.commands.map((piece) => {
				if (piece.init) return piece.init(this);
				else return true;
			}));
			await Promise.all(this.commandInhibitors.map((piece) => {
				if (piece.init) return piece.init(this);
				else return true;
			}));
			await Promise.all(this.commandFinalizers.map((piece) => {
				if (piece.init) return piece.init(this);
				else return true;
			}));
			await Promise.all(this.messageMonitors.map((piece) => {
				if (piece.init) return piece.init(this);
				else return true;
			}));
			await this.configuration.initialize(this);
			this.destroy = () => 'You cannot use this within Komada, use process.exit() instead.';
			this.ready = true;
		});
	}

	sweepCommandMessages(lifetime = this.commandMessageLifetime) {
		if (typeof lifetime !== 'number' || isNaN(lifetime)) throw new TypeError('The lifetime must be a number.');
		if (lifetime <= 0) {
			this.emit('debug', 'Didn\'t sweep messages - lifetime is unlimited');
			return -1;
		}

		const lifetimeMs = lifetime * 1000;
		const rightNow = Date.now();
		const messages = this.commandMessages.size;

		for (const [key, message] of this.commandMessages) {
			if (rightNow - (message.trigger.editedTimestamp || message.trigger.createdTimestamp) > lifetimeMs) this.commandMessages.delete(key);
		}

		this.emit('debug', `Swept ${messages - this.commandMessages.size} commandMessages older than ${lifetime} seconds.`);
		return messages - this.commandMessages.size;
	}

};

process.on('unhandledRejection', (err) => {
	if (!err) return;
	console.error(`Uncaught Promise Error: \n${err.stack || err}`);
});
