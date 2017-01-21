const Discord = require("discord.js");
const chalk = require("chalk");
const loadFunctions = require("./functions/loadFunctions.js");
const Config = require("./classes/Config.js");

const clk = new chalk.constructor({ enabled: true });

exports.start = async (config) => {
  const client = new Discord.Client(config.clientOptions);

  client.config = config;

  // Extend client
  client.config.init = [];
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

  client.coreBaseDir = `${__dirname}/`;
  client.clientBaseDir = `${process.cwd()}/`;
  client.guildConfs = Config.guildConfs;
  client.configuration = Config;

  // Load core functions, then everything else
  await loadFunctions(client);
  client.funcs.loadProviders(client);
  client.funcs.loadCommands(client);
  client.funcs.loadCommandInhibitors(client);
  client.funcs.loadMessageMonitors(client);
  client.funcs.loadEvents(client);
  client.i18n = client.funcs.loadLocalizations;
  client.i18n.init(client);

  client.once("ready", () => {
    client.config.prefixMention = new RegExp(`^<@!?${client.user.id}>`);
    Config.initialize(client);
    for (const func in client.funcs) {
      if (client.funcs[func].init) client.funcs[func].init(client);
    }
  });

  client.on("error", e => client.funcs.log(e, "error"));
  client.on("warn", w => client.funcs.log(w, "warning"));
  // client.on("disconnect", e => client.funcs.log(e, "error"));

  client.on("message", async (msg) => {
    if (msg.author.bot) return;
    const conf = Config.get(msg.guild);
    msg.guildConf = conf;
    client.i18n.use(conf.lang);
    await client.funcs.runMessageMonitors(client, msg);
    let thisPrefix;
    if (conf.prefix instanceof Array) {
      conf.prefix.forEach((prefix) => {
        if (msg.content.startsWith(prefix)) thisPrefix = prefix;
        else thisPrefix = prefix[0];
      });
    } else {
      thisPrefix = conf.prefix;
    }
    if (!msg.content.startsWith(thisPrefix) && client.config.prefixMention && !client.config.prefixMention.test(msg.content)) return;
    let prefixLength = thisPrefix.length;
    if (client.config.prefixMention && client.config.prefixMention.test(msg.content)) prefixLength = client.config.prefixMention.exec(msg.content)[0].length + 1;
    const command = msg.content.slice(prefixLength).split(" ")[0].toLowerCase();
    const suffix = msg.content.slice(prefixLength).split(" ").slice(1).join(" ");
    let commandLog;
    switch (msg.channel.type) {
      case "dm":
        commandLog = `${clk.black.bgYellow(`${msg.author.username}<@${msg.author.id}>`)} : ${clk.bold(command)}('${suffix}') => ${clk.bgMagenta("[Direct Messages]")}`;
        break;
      case "group": // works for selfbots only
        commandLog = `${clk.black.bgYellow(`${msg.author.username}<@${msg.author.id}>`)} : ${clk.bold(command)}('${suffix}') => ${clk.bgCyan(`${msg.channel.owner.username}[${msg.channel.owner.id}] in [GroupDM]`)}`;
        break;
      default: // text channels
        commandLog = `${clk.black.bgYellow(`${msg.author.username}<@${msg.author.id}>`)} : ${clk.bold(command)}('${suffix}') => ${clk.bgGreen(`${msg.guild.name}[${msg.guild.id}]`)}`;
    }
    let cmd;
    if (client.commands.has(command)) {
      cmd = client.commands.get(command);
    } else if (client.aliases.has(command)) {
      cmd = client.commands.get(client.aliases.get(command));
    }
    if (!cmd) return;
    const params = await client.funcs.runCommandInhibitors(client, msg, cmd)
    .catch((reason) => {
      if (reason) {
        if (reason.stack) client.funcs.log(reason.stack, "error");
        msg.channel.sendCode("", reason).catch(console.error);
      }
    });
    client.funcs.log(commandLog);
    if (params) cmd.run(client, msg, params);
  });

  client.login(client.config.botToken);
  return client;
};

process.on("unhandledRejection", (err) => {
  if (!err) return;
  console.error(`Uncaught Promise Error: \n${err.stack}`);
});
