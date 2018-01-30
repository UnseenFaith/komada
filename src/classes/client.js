/* eslint-disable no-throw-literal, no-use-before-define, no-restricted-syntax, no-underscore-dangle */
const Discord = require("discord.js");
const path = require("path");
const { performance: { now } } = require("perf_hooks");
const Loader = require("./loader");
const ArgResolver = require("./argResolver");
const PermLevels = require("./PermissionLevels");
const Settings = require("./settingsCache");
const merge = require("../functions/mergeConfig");
const Console = require("./console/Console");


const defaultPermStructure = new PermLevels()
  .add(0, false, () => true)
  .add(2, false, (client, msg) => {
    if (!msg.guild || !msg.guild.settings.modRole) return false;
    const modRole = msg.guild.roles.get(msg.guild.settings.modRole);
    return modRole && msg.member.roles.has(modRole.id);
  })
  .add(3, false, (client, msg) => {
    if (!msg.guild || !msg.guild.settings.adminRole) return false;
    const adminRole = msg.guild.roles.get(msg.guild.settings.adminRole);
    return adminRole && msg.member.roles.has(adminRole.id);
  })
  .add(4, false, (client, msg) => msg.guild && msg.author.id === msg.guild.owner.id)
  .add(9, true, (client, msg) => msg.author.id === client.config.ownerID)
  .add(10, false, (client, msg) => msg.author.id === client.config.ownerID);

/**
 * @typedef  {object}   OptionsDisabled
 * @property {string[]} [commands=Array]    Disabled Commands
 * @property {string[]} [events=Array]      Disabled Events
 * @property {string[]} [functions=Array]   Disabled Functions
 * @property {string[]} [inhibitors=Array]  Disabled Inhibitors
 * @property {string[]} [finalizers=Array]  Disabled Finalizers
 * @property {string[]} [monitors=Array]    Disabled Monitors
 * @property {string[]} [providers=Array]   Disabled Providers
 * @property {string[]} [extendables=Array] Disabled Extendables
 * @memberof Komada
 */

/**
 * @typedef  {object} OptionsProviders
 * @property {string} [engine=json] The Provider Engine SettingGateway will use to store and access to the persistent data.
 * @property {string} [cache=js]    The Provider Cache Engine CacheManager from SettingGateway will use to cache the data.
 * @memberof Komada
 */

/**
 * @typedef  {object}  Options
 * @property {string}  [prefix=?] The prefix for Komada. Defaults to '?'.
 * @property {string}  [ownerID=String] The bot owner's ID, Komada will autofetch it if it's not specified.
 *
 * @property {Komada.OptionsDisabled}  [disabled={}] The disabled pieces.
 * @property {PermissionLevels|Array<{}>} [permStructure=Array<{}>] The PermStructure for Komada.
 *
 * @property {boolean} [selfbot=boolean] Whether the bot is a selfbot or not. Komada detects this automatically.
 * @property {function}  [readyMessage=function] A custom function with a client argument that allows you to customize the ready string when Komada logs in.
 * @property {number}  [commandMessageLifetime=1800] The lifetime for the command messages, in milliseconds.
 * @property {number}  [commandMessageSweep=900] How frequent should Komada sweep the command messages.
 *
 * @property {boolean} [disableLogTimestamps=false] Whether the komada logger should show the timestamps.
 * @property {boolean} [disableLogColor=false] Whether the komada logger should show colours.
 *
 * @property {boolean} [cmdEditing=false] Whether Komada should consider edited messages as potential messages able to fire new commands.
 * @property {boolean} [cmdPrompt=false] Whether Komada should prompt missing/invalid arguments at failed command execution.
 *
 * @property {string} [clientBaseDir=path.dirname(require.main.filename)] Directory where client pieces are stored. Can be an absolute or relative path. Defaults to the location of the index.js/app.js
 *
 * @property {Komada.OptionsProviders}  [provider={}] The engines for SettingGateway, 'engine' for Persistent Data, 'cache' for Cache Engine (defaults to Collection)
 * @memberof Komada
 */

/**
 * The class for the magic behind Komada
 * @extends external:Client
 */
class Komada extends Discord.Client {

  /**
   * Creates a new instance of Komada
   * @param {Komada.Options} [config={}] The configuration options to provide to Komada
   */
  constructor(config = {}) {
    if (typeof config !== "object") throw new TypeError("Configuration for Komada must be an object.");
    super(config.clientOptions);
    /**
     * The configuration used to create Komada
     * @type {Komada.Options}
     */

    this.config = merge(config);

    /**
     * The location of where the core files of Komada rely in, typically inside node_modules
     * @type {String}
     */
    this.coreBaseDir = path.join(__dirname, "../");

    /**
     * The location of where you installed Komada, Can be a absolute/relative path or the path to your app/index.js
     * @type {String}
     */
    this.clientBaseDir = `${this.config.clientBaseDir || path.dirname(require.main.filename)}${path.sep}`;

    /**
     * An object containing all the functions within Komada
     * @type {Loader}
     */
    this.funcs = new Loader(this);

    /**
     * The resolver that resolves arguments in commands into their expected results
     * @type {ArgResolver}
     */
    this.argResolver = new ArgResolver(this);

    /**
     * The collection of commands available for use in Komada
     * @type external:Collection
     */
    this.commands = new Discord.Collection();

    /**
     * The collection of aliases that point to commands in Komada
     * @type external:Collection
     */
    this.aliases = new Discord.Collection();

    /**
     * The collection of inhibitors ran on commands
     * @type external:Collection
     */
    this.commandInhibitors = new Discord.Collection();

    /**
     * The collection of finalizers ran on succcesful commands.
     * @type external:Collection
     */
    this.commandFinalizers = new Discord.Collection();

    /**
     * The collection of monitors that are ran are specific or all messages.
     * @type external:Collection
     */
    this.messageMonitors = new Discord.Collection();

    /**
     * The collection of providers that can be used in Komada
     * @type external:Collection
     */
    this.providers = new Discord.Collection();

    /**
     * The collection of event handlers in Komada, used for reloading
     * @type external:Collection
     */
    this.eventHandlers = new Discord.Collection();

    /**
     * The permStructure Komada will take into account when commands are ran and permLevel is calculated.
     * @type {PermissionStructure}
     */
    this.permStructure = config.permStructure instanceof PermLevels ? config.permStructure : defaultPermStructure;

    /**
     * The collection of stored command messages
     * @type external:Collection
     */
    this.commandMessages = new Discord.Collection();

    /**
     * The lifetime of command messages before they are removed from the cache and not editable anymore.
     * @type {Number}
     */
    this.commandMessageLifetime = config.commandMessageLifetime || 1800;

    /**
     * The amount of time in between each command message sweep in Komada.
     * @type {Number}
     */
    this.commandMessageSweep = config.commandMessageSweep || 900;

    /**
     * Whether or not Komada is completely ready to accept commands from users or not. This will be true after everything is initialized correctly.
     * @type {Boolean}
     */
    this.ready = false;

    /**
     * Additional methods to be used elsewhere in the bot
     * @type {Object}
     * @property {Class} Collection A discord.js collection
     * @property {Class} Embed A discord.js Message Embed
     * @property {Class} MessageCollector A discord.js MessageCollector
     * @property {Class} Webhook A discord.js WebhookClient
     * @property {Function} escapeMarkdown A discord.js escape markdown function
     * @property {Function} splitMessage A discord.js split message function
     */
    this.methods = {
      Collection: Discord.Collection,
      Embed: Discord.MessageEmbed,
      MessageCollector: Discord.MessageCollector,
      Webhook: Discord.WebhookClient,
      escapeMarkdown: Discord.escapeMarkdown,
      splitMessage: Discord.splitMessage,
    };

    /**
     * The object where the gateways are stored settings
     * @type {Object}
     */
    this.settings = null;

    /**
     * The oauth bots application. This will either be a full application object when Komada has finally loaded or null if the bot is a selfbot.
     * @type {Object}
     */
    this.application = null;

    /**
     * The console for this instance of Komada. You can disable timestmaps, colors, and add writable streams as config options to configure this.
     * @type {KomadaConsole}
     */
    this.console = new Console({ stdout: this.config.console.stdout, stderr: this.config.console.stderr, useColor: this.config.console.useColors, colors: this.config.console.colors, timestamps: this.config.console.timestamps });

    this.once("ready", this._ready.bind(this));
  }

  /**
   * The invite link for the bot
   * @readonly
   * @returns {string}
   */
  get invite() {
    if (!this.user.bot) throw "Why would you need an invite link for a selfbot...";
    const permissions = Discord.Permissions.resolve([...new Set(this.commands.reduce((a, b) => a.concat(b.conf.botPerms), ["VIEW_CHANNEL", "SEND_MESSAGES"]))]);
    return `https://discordapp.com/oauth2/authorize?client_id=${this.application.id}&permissions=${permissions}&scope=bot`;
  }

  /**
   * The owner for this bot
   * @readonly
   * @type {external:User}
   */
  get owner() {
    return this.users.get(this.config.ownerID);
  }

  /**
   * Use this to login to Discord with your bot
   * @param {string} token Your bot token
   */
  async login(token) {
    const start = now();
    await this.funcs.loadAll(this);
    this.settings = new Settings(this);
    this.emit("log", `Loaded in ${(now() - start).toFixed(2)}ms.`);
    super.login(token);
  }

  /**
   * The once ready function for the client to init all pieces
   * @private
   */
  async _ready() {
    this.config.prefixMention = new RegExp(`^<@!?${this.user.id}>`);
    if (this.user.bot) this.application = await super.fetchApplication();
    if (!this.config.ownerID) this.config.ownerID = this.user.bot ? this.application.owner.id : this.user.id;
    await Promise.all(this.providers.map((piece) => {
      if (piece.init) return piece.init(this);
      return true;
    }));
    await Promise.all(Object.keys(this.settings).map((key) => {
      if (this.settings[key].init) return this.settings[key].init();
      return true;
    }));
    await Promise.all(Object.keys(this.funcs).map((key) => {
      if (this.funcs[key].init) return this.funcs[key].init(this);
      return true;
    }));
    await Promise.all([
      this.commands.map(piece => (piece.init ? piece.init(this) : true)),
      this.commandInhibitors.map(piece => (piece.init ? piece.init(this) : true)),
      this.commandFinalizers.map(piece => (piece.init ? piece.init(this) : true)),
      this.messageMonitors.map(piece => (piece.init ? piece.init(this) : true)),
    ]);
    this.setInterval(this.sweepCommandMessages.bind(this), this.commandMessageLifetime);
    this.ready = true;
    this.emit("log", this.config.readyMessage(this));
  }

  /**
   * Sweeps command messages based on the lifetime parameter
   * @param {number} lifetime The threshold for how old command messages can be before sweeping since the last edit in seconds
   * @returns {number} The amount of messages swept
   */
  sweepCommandMessages(lifetime = this.commandMessageLifetime) {
    if (typeof lifetime !== "number" || Number.isNaN(lifetime)) throw new TypeError("The lifetime must be a number.");
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

}

module.exports = Komada;

process.on("unhandledRejection", (err) => {
  if (!err) return;
  console.error(`Uncaught Promise Error: \n${err.stack || err}`);
});
