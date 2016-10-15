const Discord = require("discord.js");
const client = new Discord.Client({ fetchAllMembers: true });
const fs = require("fs");
const moment = require("moment");
const chalk = require("chalk");
const clk = new chalk.constructor({ enabled: true });

// Try local JSON config, if not, expect Process Env (Heroku)
try {
  client.config = require("./config.json");
} catch (e) {
  if (process.env.botToken) {
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
client.log = msg => { console.log(`${clk.bgBlue(`[${moment().format("YYYY-MM-DD HH:mm:ss")}]`)} ${msg}`);};
client.config["init"] = [];
client.funcs = {};
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.commandInhibitors = new Discord.Collection();
client.databaseModules = new Discord.Collection();

// Load core functions, then everything else
client.funcs["loadFunctions"] = () => {
  fs.readdir("./functions/core", (err, files) => {
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
    client.log(`Loaded ${d} functions, with ${o} optional.`);
    client.funcs.loadDatabaseHandlers(client);
    client.funcs.loadCommands2(client);
    client.funcs.loadCommandInhibitors(client);
    client.funcs.loadEvents(client);
  });
};
client.funcs.loadFunctions();

client.on("message", msg => {
  if (!msg.content.startsWith(client.config.prefix)) return;
  let command = msg.content.split(" ")[0].slice(client.config.prefix.length);
  let cmd;
  if (client.commands.has(command)) {
    cmd = client.commands.get(command);
  } else if (client.aliases.has(command)) {
    cmd = client.commands.get(client.aliases.get(command));
  }
  if (cmd) {
    client.funcs.runCommandInhibitors(client, msg, cmd)
    .then(params => {
      cmd.run(client, msg, params);
    })
    .catch(reason => {
      msg.channel.sendMessage(reason);
    });
  }
});

client.login(client.config.botToken);
