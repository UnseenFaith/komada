const Discord = require("discord.js");
const path = require("path");

const loadFunctions = require("./utils/loadFunctions.js");
const loadEvents = require("./utils/loadEvents.js");
const loadProviders = require("./utils/loadProviders.js");
const loadCommands = require("./utils/loadCommands.js");
const loadCommandInhibitors = require("./utils/loadCommandInhibitors.js");
const loadMessageMonitors = require("./utils/loadMessageMonitors.js");

const Config = require("./classes/Config.js");

exports.start = async (config) => {
  if (typeof config !== "object") throw new TypeError("Configuration for Komada must be an object.");
  const client = new Discord.Client(config.clientOptions);

  client.config = config;

    // Extend client
  client.funcs = {};
  client.helpStructure = new Map();
  client.commands = new Discord.Collection();
  client.aliases = new Discord.Collection();
  client.commandInhibitors = new Discord.Collection();
  client.messageMonitors = new Discord.Collection();
  client.providers = new Discord.Collection();

    // Extend Client with Native Discord.js Functions for use in our pieces.
  client.methods = {};
  client.methods.Collection = Discord.Collection;
  client.methods.Embed = Discord.RichEmbed;
  client.methods.MessageCollector = Discord.MessageCollector;
  client.methods.Webhook = Discord.WebhookClient;
  client.methods.escapeMarkdown = Discord.escapeMarkdown;
  client.methods.splitMessage = Discord.splitMessage;

  client.coreBaseDir = `${__dirname}${path.sep}`;
  client.clientBaseDir = `${process.env.clientDir || process.cwd()}${path.sep}`;
  client.guildConfs = Config.guildConfs;
  client.configuration = Config;

  await loadEvents(client);

  client.once("ready", async () => {
    client.config.prefixMention = new RegExp(`^<@!?${client.user.id}>`);
    await client.configuration.initialize(client);
    await loadFunctions(client);
    await loadProviders(client);
    await loadCommands(client);
    await loadCommandInhibitors(client);
    await loadMessageMonitors(client);
    client.i18n = client.funcs.loadLocalizations;
    client.i18n.init(client);
    client.destroy = () => "You cannot use this within Komada, use process.exit() instead.";
    client.ready = true;
  });

  client.on("error", e => client.funcs.log(e, "error"));
  client.on("warn", w => client.funcs.log(w, "warning"));
  client.on("disconnect", e => client.funcs.log(`Disconnected: ${e.reason}`, "error"));

  client.on("message", async (msg) => {
    if (!client.ready) return;
    await client.funcs.runMessageMonitors(client, msg);
    msg.author.permLevel = await client.funcs.permissionLevel(client, msg.author, msg.guild);
    msg.guildConf = Config.get(msg.guild);
    client.i18n.use(msg.guildConf.lang);
    if (!client.funcs.handleMessage(client, msg)) return;
    const command = client.funcs.parseCommand(client, msg);
    client.funcs.handleCommand(client, msg, command);
  });

  client.login(client.config.botToken);
  return client;
};
process.on("unhandledRejection", (err) => {
  if (!err) return;
  console.error(`Uncaught Promise Error: \n${err.stack || err}`);
});
