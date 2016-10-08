const Discord = require("discord.js");
const bot = new Discord.Client({ fetchAllMembers: true });
const fs = require("fs");
const moment = require("moment");

const log = (msg) => {
  console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] ${msg}`);
};


// Try local JSON config, if not, expect Process Env (Heroku)
try{
  bot.config = require("./config.json");
} catch (e) {
  if(process.env.botToken) {
    bot.config = {
      botToken: process.env.botToken,
      prefix: process.env.prefix,
      ownerid: process.env.ownerid
    };
  } else {
    throw "NO CONFIG FILE FOUND, NO ENV CONF FOUND, EXITING";
  }
}

bot.functions = {};
// Load core functions
fs.readdir("./functions/core", (err, files) => {
  bot.functions.core = {};
  if (err) console.error(err);
  log(`Loading ${files.length} core functions`);
  files.forEach(f=> {
    let name = f.split(".")[0];
    bot.functions.core[name] = require(`./functions/core/${f}`);
  });
});

// Load optional functions
fs.readdir("./functions/optn", (err, files) => {
  bot.functions.optn = {};
  if (err) console.error(err);
  log(`Loading ${files.length} optional functions`);
  files.forEach(f=> {
    let name = f.split(".")[0];
    bot.functions.optn[name] = require(`./functions/optn/${f}`);
  });
});

bot.commands = new Discord.Collection();
bot.aliases = new Discord.Collection();
fs.readdir("./cmds/", (err, files) => {
  if (err) console.error(err);
  log(`Loading ${files.length} commands.`);
  files.forEach(f => {
    let props = require(`./cmds/${f}`);
    bot.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      bot.aliases.set(alias, props.help.name);
    });
  });
});

bot.on("message", msg => {
  if (!msg.content.startsWith(bot.config.prefix)) return;
  let command = msg.content.split(" ")[0].slice(bot.config.prefix.length);
  let params = msg.content.split(" ").slice(1);
  let perms = bot.functions.core.permissions(bot, msg);
  let cmd;
  if (bot.commands.has(command)) {
    cmd = bot.commands.get(command);
  } else if (bot.aliases.has(command)) {
    cmd = bot.commands.get(bot.aliases.get(command));
  }
  if (cmd) {
    if (!cmd.conf.enabled) return msg.channel.sendMessage("This command is currently disabled");
    if (perms < cmd.conf.permLevel) return;
    cmd.run(bot, msg, params, perms);
  }
});

bot.on("ready", () => {
  log(`GuideBot: Ready to serve ${bot.users.size} users, in ${bot.channels.size} channels of ${bot.guilds.size} servers.`);
});

bot.on("error", console.error);
bot.on("warn", console.warn);

bot.login(bot.config.botToken);
