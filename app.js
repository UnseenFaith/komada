const Discord = require("discord.js");
const bot = new Discord.Client({ fetchAllMembers: true });
const config = require("./config.json");
const fs = require("fs");
const moment = require("moment");

const log = (msg) => {
  console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] ${msg}`);
};

bot.commands = new Discord.Collection();
bot.aliases = new Discord.Collection();
fs.readdir("./cmd/", (err, files) => {
  if (err) console.error(err);
  log(`Loading a total of ${files.length} commands.`);
  files.forEach(f => {
    let props = require(`./cmd/${f}`);
    log(`Loading Command: ${props.help.name}. :ok_hand:`);
    bot.commands.set(props.help.name, props);
    props.help.aliases.forEach(alias => {
      bot.aliases.set(alias, props.help.name);
    });
  });
});

bot.on("message", msg => {
  if (!msg.content.startsWith(config.prefix)) return;
  var command = msg.content.split(" ")[0].slice(config.prefix.length);
  var params = msg.content.split(" ").slice(1);
  let cmd;
  if (bot.commands.has(command)) {
    cmd = bot.commands.get(command);
  } else if (bot.aliases.has(command)) {
    cmd = bot.commands.get(bot.aliases.get(command));
  }
  if (cmd) {
    if (cmd.help.restrict && !cmd.help.restrict(msg.author.id)) return;
    cmd.run(bot, msg, params);
  }
});

bot.on("ready", () => {
  log(`GuideBot: Ready to serve ${bot.users.size} users, in ${bot.channels.size} channels of ${bot.guilds.size} servers.`);
  log("=> Ready");
});

bot.on("error", console.error);
bot.on("warn", console.warn);

bot.login(config.botToken);

bot.reload = function(command) {
  bot.commands.delete(command);
  bot.aliases.forEach(alais => {
    if (bot.aliases.get(alais) === command) bot.aliases.delete(alais);
  });
  delete require.cache[require.resolve(`./cmd/${command}`)];
  bot.commands.set(command, require(`./cmd/${command}`));
};
