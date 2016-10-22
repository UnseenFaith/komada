const Discord = require("discord.js");
const fs = require("fs");
const chalk = require("chalk");
const clk = new chalk.constructor({ enabled: true });

module.exports = (config) => {

  const client = new Discord.Client(config.discordOptions);

  client.config = config;

  // Extend client
  client.config["init"] = [];
  client.funcs = {};
  client.commands = new Discord.Collection();
  client.aliases = new Discord.Collection();
  client.commandInhibitors = new Discord.Collection();
  client.databaseModules = new Discord.Collection();

  client.coreBaseDir = __dirname + "/";
  client.clientBaseDir = process.cwd() + "/";

  // Load core functions, then everything else
  client.funcs["loadFunctions"] = () => {
    fs.readdir(__dirname + "/functions/core", (err, files) => {
      if (err) console.error(err);
      files = files.filter(f => { return f.slice(-3) === ".js"; });
      let [d,o] = [0,0];
      files.forEach(f=> {
        let file = f.split(".");
        if (file[1] !== "opt") {
          client.funcs[file[0]] = require(`./functions/core/${f}`);
          d++;
        } else if (client.config.functions.includes(file[0])) {
          client.funcs[file[0]] = require(`./functions/core/${f}`);
          o++;
        }
      });
      client.funcs.log(`Loaded ${d} functions, with ${o} optional.`);
      client.funcs.loadDatabaseHandlers(client);
      client.funcs.loadCommands(client);
      client.funcs.loadCommandInhibitors(client);
      client.funcs.loadEvents(client);
    });
  };
  client.funcs.loadFunctions();

  client.once("ready", () => {
    client.config.prefixMention = new RegExp(`^<@!?${client.user.id}>`);
  });

  client.on("message", msg => {
    if (!msg.content.startsWith(client.config.prefix) && !client.config.prefixMention.test(msg.content)) return;
    let prefixLength = client.config.prefix.length;
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
