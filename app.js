const Discord = require("discord.js");
const chalk = require("chalk");
const loadFunctions = require("./functions/loadFunctions.js");

const clk = new chalk.constructor({ enabled: true });

exports.start = (config) => {
  const client = new Discord.Client(config.clientOptions);

  client.config = config;

  // Extend client
  client.config.init = [];
  client.funcs = {};
  client.helpStructure = new Map();
  client.commands = new Discord.Collection();
  client.aliases = new Discord.Collection();
  client.commandInhibitors = new Discord.Collection();
  client.commandMonitors = new Discord.Collection();
  client.dataProviders = new Discord.Collection();

  client.coreBaseDir = `${__dirname}/`;
  client.clientBaseDir = `${process.cwd()}/`;

  // Load core functions, then everything else
  loadFunctions(client).then(() => {
    client.funcs.loadDataProviders(client);
    client.funcs.loadCommands(client);
    client.funcs.loadCommandInhibitors(client);
    client.funcs.loadCommandMonitors(client);
    client.funcs.loadEvents(client);
    client.i18n = client.funcs.loadLocalizations;
    client.i18n.init(client);
  });

  client.once("ready", () => {
    client.config.prefixMention = new RegExp(`^<@!?${client.user.id}>`);
  });

  client.on("message", (msg) => {
    if (msg.author.bot) return;
    const conf = client.funcs.confs.get(msg.guild);
    msg.guildConf = conf;
    client.i18n.use(conf.lang);
    client.funcs.runCommandMonitors(client, msg).catch(reason => msg.channel.sendMessage(reason).catch(console.error));
    if (!msg.content.startsWith(conf.prefix) && !client.config.prefixMention.test(msg.content)) return;
    let prefixLength = conf.prefix.length;
    if (client.config.prefixMention.test(msg.content)) prefixLength = client.config.prefixMention.exec(msg.content)[0].length + 1;
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
    client.funcs.runCommandInhibitors(client, msg, cmd)
    .then((params) => {
      client.funcs.log(commandLog);
      cmd.run(client, msg, params);
    })
    .catch((reason) => {
      if (reason) {
        if (reason.stack) client.funcs.log(reason.stack, "error");
        msg.channel.sendCode("", reason).catch(console.error);
      }
    });
  });

  client.login(client.config.botToken);
  return client;
};

process.on("unhandledRejection", (err) => {
  console.error(`Uncaught Promise Error: \n${err.stack}`);
});
