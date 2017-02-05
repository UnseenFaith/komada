const Discord = require("discord.js");
const path = require("path");

const loadFunctions = require("./functions/loadFunctions.js");
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

  client.coreBaseDir = `${__dirname}${path.sep}`;
  client.clientBaseDir = `${process.cwd()}${path.sep}`;
  client.guildConfs = Config.guildConfs;
  client.configuration = Config;

  // Load core functions, then everything else
  await loadFunctions(client);
  await client.funcs.loadProviders(client);
  await client.funcs.loadCommands(client);
  await client.funcs.loadCommandInhibitors(client);
  await client.funcs.loadMessageMonitors(client);
  await client.funcs.loadEvents(client);
  client.i18n = client.funcs.loadLocalizations;
  client.i18n.init(client);

  client.once("ready", async () => {
    client.config.prefixMention = new RegExp(`^<@!?${client.user.id}>`);
    await client.funcs.initialize(client);
    client.destroy = () => "You cannot use this within Komada, use process.exit() instead.";
  });

  client.on("error", e => client.funcs.log(e, "error"));
  client.on("warn", w => client.funcs.log(w, "warning"));
  client.on("disconnect", e => client.funcs.log(e, "error"));

  client.on("message", async (msg) => {
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
