const Discord = require("discord.js");
const client = new Discord.Client({ fetchAllMembers: true });
const fs = require("fs");
const moment = require("moment");
const chalk = require("chalk");
const clk = new chalk.constructor({ enabled: true });

// Try local JSON config, if not, expect Process Env (Heroku)
try{
  client.config = require("./config.json");
} catch (e) {
  if(process.env.botToken) {
    client.config = {
      botToken: process.env.botToken,
      prefix: process.env.prefix,
      ownerid: process.env.ownerid
    };
  } else {
    throw "NO CONFIG FILE FOUND, NO ENV CONF FOUND, EXITING";
  }
}

// Extend client
client.log = msg => {console.log(`${clk.bgBlue(`[${moment().format("YYYY-MM-DD HH:mm:ss")}]`)} ${msg}`);};
client.functions = {};
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.commandInhibitors = new Discord.Collection();
client.databaseModules = new Discord.Collection();

// Load core functions, then everything else
fs.readdir("./functions/core", (err, files) => {
  client.functions.core = {};
  if (err) console.error(err);
  files.forEach(f=> {
    let name = f.split(".")[0];
    client.functions.core[name] = require(`./functions/core/${f}`);
  });
  client.log(`Loaded ${files.length} core functions`);
  client.functions.core.loadDatabaseHandlers(client);
  client.functions.core.loadOptionalFunctions(client);
  client.functions.core.loadCommands(client);
  client.functions.core.loadCommandInhibitors(client);
  client.functions.core.loadEvents(client);
});

client.on("message", msg => {
  if (!msg.content.startsWith(client.config.prefix)) return;
  let command = msg.content.split(" ")[0].slice(client.config.prefix.length);
  let params = msg.content.split(" ").slice(1);
  let cmd;
  if (client.commands.has(command)) {
    cmd = client.commands.get(command);
  } else if (client.aliases.has(command)) {
    cmd = client.commands.get(client.aliases.get(command));
  }
  if (cmd) {
    client.functions.core.runCommandInhibitors(client, msg, cmd)
    .then(() => {
      cmd.run(client, msg, params);
    })
    .catch(reason => {
      msg.channel.sendMessage(reason);
    });
  }
});

client.login(client.config.botToken);
