const Discord = require("discord.js");
const chalk = require("chalk");
const clk = new chalk.constructor({ enabled: true });

exports.start = (config) => {

  const client = new Discord.Client(config.clientOptions);

  client.config = config;

  // Extend client
  client.config["init"] = [];
  client.funcs = {};
  client.helpStructure = new Map();
  client.commands = new Discord.Collection();
  client.aliases = new Discord.Collection();
  client.commandInhibitors = new Discord.Collection();
  client.dataProviders = new Discord.Collection();

  client.coreBaseDir = __dirname + "/";
  client.clientBaseDir = process.cwd() + "/";

  // Load core functions, then everything else
  require("./functions/loadFunctions.js")(client).then(() => {
    client.funcs.loadDataProviders(client);
    client.funcs.loadCommands(client);
    client.funcs.loadCommandInhibitors(client);
    client.funcs.loadEvents(client);
  });

  client.once("ready", () => {
    client.config.prefixMention = new RegExp(`^<@!?${client.user.id}>`);
    client.funcs.confs.init(client);
  });

  client.once("confsRead", () => {
    client.commands.forEach(command => {
      if(command.init) {
        command.init(client);
      }
    });
  });

  client.on("message", msg => {
    let conf = client.funcs.confs.get(msg.guild);
    msg.guildConf = conf;
    if (!msg.content.startsWith(conf.prefix) && !client.config.prefixMention.test(msg.content)) return;
    let prefixLength = conf.prefix.length;
    if(client.config.prefixMention.test(msg.content)) prefixLength = client.config.prefixMention.exec(msg.content)[0].length +1;
    let command = msg.content.slice(prefixLength).split(" ")[0].toLowerCase();
    let suffix = msg.content.slice(prefixLength).split(" ").slice(1).join(" ");
    let commandLog;
    switch (msg.channel.type) {
      case "text":
        commandLog = `${clk.black.bgYellow(`${msg.author.username}<@${msg.author.id}>`)} : ${clk.bold(command)}('${suffix ? suffix : ""}') => ${clk.bgGreen(`${msg.guild.name}[${msg.guild.id}]`)}`;
        break;
      case "dm":
        commandLog = `${clk.black.bgYellow(`${msg.author.username}<@${msg.author.id}>`)} : ${clk.bold(command)}('${suffix ? suffix : ""}') => ${clk.bgMagenta("[Direct Messages]")}`;
        break;
      case "group": //works for selfbots only
        commandLog = `${clk.black.bgYellow(`${msg.author.username}<@${msg.author.id}>`)} : ${clk.bold(command)}('${suffix ? suffix : ""}') => ${clk.bgCyan(`${msg.channel.owner.username}[${msg.channel.owner.id}] in [GroupDM]`)}`;
        break;
    }
    let cmd;
    if (client.commands.has(command)) {
      cmd = client.commands.get(command);
    } else if (client.aliases.has(command)) {
      cmd = client.commands.get(client.aliases.get(command));
    }
    if(!cmd) return;
    client.funcs.runCommandInhibitors(client, msg, cmd)
    .then(params => {
      client.funcs.log(commandLog);
      cmd.run(client, msg, params);
    })
    .catch(reason => {
      msg.channel.sendMessage(reason);
    });
  });

  client.login(client.config.botToken);
  return client;
};

process.on("unhandledRejection", err => {
  console.error("Uncaught Promise Error: \n" + err.stack);
});
