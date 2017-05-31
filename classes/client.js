const Discord = require("discord.js");
const path = require("path");
const now = require("performance-now");
const CommandMessage = require("./commandMessage.js");
const Loader = require("./loader.js");
const ArgResolver = require("./argResolver.js");
const PermLevels = require("./permLevels.js");
 /* Will Change this later */
const Config = require("./Configuration Types/Config.js");

const defaultPermStructure = new PermLevels()
  .addLevel(0, false, () => true)
  .addLevel(2, false, (client, msg) => {
    if (!msg.guild) return false;
    const modRole = msg.guild.roles.find("name", msg.guild.conf.modRole);
    return modRole && msg.member.roles.has(modRole.id);
  })
  .addLevel(3, false, (client, msg) => {
    if (!msg.guild) return false;
    const adminRole = msg.guild.roles.find("name", msg.guild.conf.adminRole);
    return adminRole && msg.member.roles.has(adminRole.id);
  })
  .addLevel(4, false, (client, msg) => {
    if (!msg.guild) return false;
    return msg.author.id === msg.guild.owner.id;
  })
  .addLevel(9, true, (client, msg) => msg.author.id === client.config.ownerID)
  .addLevel(10, false, (client, msg) => msg.author.id === client.config.ownerID);

/* eslint-disable no-throw-literal, no-use-before-define, no-restricted-syntax, no-underscore-dangle */
module.exports = class Komada extends Discord.Client {

  constructor(config = {}) {
    if (typeof config !== "object") throw new TypeError("Configuration for Komada must be an object.");
    super(config.clientOptions);
    this.config = config;
    this.config.disabled = config.disabled || {};
    this.config.disabled = {
      commands: config.disabled.commands || [],
      events: config.disabled.events || [],
      functions: config.disabled.functions || [],
      inhibitors: config.disabled.inhibitors || [],
      finalizers: config.disabled.finalizers || [],
      monitors: config.disabled.monitors || [],
      providers: config.disabled.providers || [],
      extendables: config.disabled.extendables || [],
    };
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
    this.permStructure = this.validatePermStructure();
    this.CommandMessage = CommandMessage;
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
      splitMessage: Discord.splitMessage,
    };
    this.coreBaseDir = path.join(__dirname, "../");
    this.clientBaseDir = `${process.env.clientDir || process.cwd()}${path.sep}`;
    this.outBaseDir = `${process.env.outDir || process.cwd()}${path.sep}`;
    this.compiledLangs = process.env.compiledLangs || process.env.compiledLang || [];
    if (!Array.isArray(this.compiledLang)) this.compiledLangs = [this.compiledLangs];
    this.guildConfs = Config.guildConfs;
    this.configuration = Config;
    this.application = null;
    this.once("ready", this._ready.bind(this));
  }

  get invite() {
    if (!this.user.bot) throw "Why would you need an invite link for a selfbot...";
    const permissions = Discord.Permissions.resolve([...new Set(this.commands.reduce((a, b) => a.concat(b.conf.botPerms), ["READ_MESSAGES", "SEND_MESSAGES"]))]);
    return `https://discordapp.com/oauth2/authorize?client_id=${this.application.id}&permissions=${permissions}&scope=bot`;
  }

  validatePermStructure() {
    const structure = this.config.permStructure instanceof PermLevels ? this.config.permStructure.structure : null;
    const permStructure = structure || this.config.permStructure || defaultPermStructure.structure;
    if (!Array.isArray(permStructure)) throw "PermStructure must be an array.";
    if (permStructure.some(perm => typeof perm !== "object" || typeof perm.check !== "function" || typeof perm.break !== "boolean")) {
      throw "Perms must be an object with a check function and a break boolean.";
    }
    if (permStructure.length !== 11) throw "Permissions 0-10 must all be defined.";
    return permStructure;
  }

  async login(token) {
    const start = now();
    await this.funcs.loadAll(this);
    this.emit("log", `Loaded in ${(now() - start).toFixed(2)}ms.`);
    super.login(token);
  }

  async _ready() {
    this.config.prefixMention = new RegExp(`^<@!?${this.user.id}>`);
    if (this.user.bot) this.application = await super.fetchApplication();
    await Promise.all(Object.keys(this.funcs).map((key) => {
      if (this.funcs[key].init) return this.funcs[key].init(this);
      return true;
    }));
    await Promise.all(this.providers.map((piece) => {
      if (piece.init) return piece.init(this);
      return true;
    }));
    await Promise.all(this.commands.map((piece) => {
      if (piece.init) return piece.init(this);
      return true;
    }));
    await Promise.all(this.commandInhibitors.map((piece) => {
      if (piece.init) return piece.init(this);
      return true;
    }));
    await Promise.all(this.commandFinalizers.map((piece) => {
      if (piece.init) return piece.init(this);
      return true;
    }));
    await Promise.all(this.messageMonitors.map((piece) => {
      if (piece.init) return piece.init(this);
      return true;
    }));
    await this.configuration.initialize(this);
    this.ready = true;
  }

  sweepCommandMessages(lifetime = this.commandMessageLifetime) {
    if (typeof lifetime !== "number" || isNaN(lifetime)) throw new TypeError("The lifetime must be a number.");
    if (lifetime <= 0) {
      this.emit("debug", "Didn't sweep messages - lifetime is unlimited");
      return -1;
    }

    const lifetimeMs = lifetime * 1000;
    const rightNow = Date.now();
    const messages = this.commandMessages.size;

    for (const [key, message] of this.commandMessages) {
      if (rightNow - (message.trigger.editedTimestamp || message.trigger.createdTimestamp) > lifetimeMs) this.commandMessages.delete(key);
    }

    this.emit("debug", `Swept ${messages - this.commandMessages.size} commandMessages older than ${lifetime} seconds.`);
    return messages - this.commandMessages.size;
  }

};

process.on("unhandledRejection", (err) => {
  if (!err) return;
  console.error(`Uncaught Promise Error: \n${err.stack || err}`);
});
