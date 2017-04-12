const Discord = require('discord.js');
const path = require('path');
const now = require('performance-now');

const Loader = require('./classes/loader.js');
const ArgResolver = require('./classes/argResolver.js');
const Config = require('./classes/Config.js');

require('./utils/Extendables.js');

// const loadFunctions = require("./utils/loadFunctions.js");
// const loadEvents = require("./utils/loadEvents.js");
// const loadProviders = require("./utils/loadProviders.js");
// const loadCommands = require("./utils/loadCommands.js");
// const loadCommandInhibitors = require("./utils/loadCommandInhibitors.js");
// const loadMessageMonitors = require("./utils/loadMessageMonitors.js");
// const log = require("./functions/log.js");

module.exports = class RuneInfo extends Discord.Client {

	constructor(config) {
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
		this.coreBaseDir = `${__dirname}${path.sep}`;
		this.clientBaseDir = `${process.env.clientDir || process.cwd()}${path.sep}`;
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
			await this.configuration.initialize(this);
			this.i18n = this.funcs.loadLocalizations;
			this.i18n.init(this);
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


	/* These will probably be removed in favour of Faith's Extendables (apply to class) */

	sendMessage(msg, content = '', options = {}) {
		const commandMessage = this.commandMessages.get(msg.id);
		if (!options.embed) options.embed = null;
		if (commandMessage) {
			return commandMessage.response.edit(content, options);
		} else {
			return msg.channel.send(content, options)
				.then(mes => {
					if (mes.constructor.name === 'Message') this.commandMessages.set(msg.id, { trigger: msg, response: mes });
					return mes;
				});
		}
	}

	sendEmbed(msg, embed, content, options) {
		if (!options && typeof content === 'object') {
			options = content;
			content = '';
		} else if (!options) {
			options = {};
		}
		return this.sendMessage(msg, content, Object.assign(options, { embed }));
	}

	sendCode(msg, lang, content, options = {}) {
		return this.sendMessage(msg, content, Object.assign(options, { code: lang }));
	}

	/* ^^^ */

};

process.on('unhandledRejection', (err) => {
	if (!err) return;
	console.error(`Uncaught Promise Error: \n${err.stack || err}`);
});
