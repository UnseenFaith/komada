const Discord = require("discord.js");
const { sep } = require("path");
const now = require("performance-now");
const CommandMessage = require("./classes/commandMessage.js");
const Loader = require("./classes/loader.js");
const ArgResolver = require("./classes/argResolver.js");
 /* Will Change this later */
const Config = require("./classes/Configuration Types/Config.js");

require("./classes/Extendables.js");

/* eslint-disable no-throw-literal, no-use-before-define, no-restricted-syntax */
module.exports = class Komada extends Discord.Client {

  constructor(config = {}) {
    if (typeof config !== "object") throw new TypeError("Configuration for Komada must be an object.");
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
    this.coreBaseDir = `${__dirname}${sep}`;
    this.clientBaseDir = `${process.env.clientDir || process.cwd()}${sep}`;
    this.guildConfs = Config.guildConfs;
    this.configuration = Config;
    this.application = null;
  }

  get invite() {
    if (this.config.selfbot) throw 'Why would you need an invite link for a selfbot...';
    const permissions = Discord.Permissions.resolve([...new Set(this.commands.reduce((a, b) => a.concat(b.conf.botPerms), ["READ_MESSAGES", "SEND_MESSAGES"]))]);
    return `https://discordapp.com/oauth2/authorize?client_id=${this.application.id}&permissions=${permissions}&scope=bot`;
  }

  validatePermStructure() {
    const permStructure = this.config.permStructure || defaultPermStructure;
    if (!Array.isArray(permStructure)) throw "PermStructure must be an array.";
    if (permStructure.some(perm => typeof perm !== "object" || typeof perm.check !== "function" || typeof perm.break !== "boolean")) {
      throw "Perms must be an object with a check function and a break boolean.";
    }
    if (permStructure.length !== 11) throw "Permissions 0-10 must all be defined.";
    return permStructure;
  }

  async login(token) {
    const start = now();
    await this.loadEverything();
    this.emit("log", `Loaded in ${(now() - start).toFixed(2)}ms.`);
    super.login(token);
  }

  async loadEverything() {
    await this.funcs.loadAll(this);
    this.once("ready", async () => {
      this.config.prefixMention = new RegExp(`^<@!?${this.user.id}>`);
      if (!this.config.selfbot) this.application = await super.fetchApplication();
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
    });
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

const defaultPermStructure = [
  {
    check: () => true,
    break: false,
  },
  {
    check: () => false,
    break: false,
  },
  {
    check: (client, msg) => {
      if (!msg.guild) return false;
      const modRole = msg.guild.roles.find("name", msg.guild.conf.modRole);
      if (modRole && msg.member.roles.has(modRole.id)) return true;
      return false;
    },
    break: false,
  },
  {
    check: (client, msg) => {
      if (!msg.guild) return false;
      const adminRole = msg.guild.roles.find("name", msg.guild.conf.adminRole);
      if (adminRole && msg.member.roles.has(adminRole.id)) return true;
      return false;
    },
    break: false,
  },
  {
    check: (client, msg) => {
      if (!msg.guild) return false;
      if (msg.author.id === msg.guild.owner.id) return true;
      return false;
    },
    break: false,
  },
  {
    check: () => false,
    break: false,
  },
  {
    check: () => false,
    break: false,
  },
  {
    check: () => false,
    break: false,
  },
  {
    check: () => false,
    break: false,
  },
  {
    check: (client, msg) => {
      if (msg.author.id === client.config.ownerID) return true;
      return false;
    },
    break: true,
  },
  {
    check: (client, msg) => {
      if (msg.author.id === client.config.ownerID) return true;
      return false;
    },
    break: false,
  },
];


process.on("unhandledRejection", (err) => {
  if (!err) return;
  console.error(`Uncaught Promise Error: \n${err.stack || err}`);
});
