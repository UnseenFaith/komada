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
    props.conf.aliases.forEach(alias => {
      bot.aliases.set(alias, props.help.name);
    });
  });
});

bot.on("message", msg => {
  if (!msg.content.startsWith(config.prefix)) return;
  let command = msg.content.split(" ")[0].slice(config.prefix.length);
  let params = msg.content.split(" ").slice(1);
  let perms = bot.elevation(msg);
  let cmd;
  if (bot.commands.has(command)) {
    cmd = bot.commands.get(command);
  } else if (bot.aliases.has(command)) {
    cmd = bot.commands.get(bot.aliases.get(command));
  }
  if (cmd) {
    if (perms < cmd.conf.permLevel) return;
    cmd.run(bot, msg, params, perms);
  }
});

bot.on("ready", () => {
  log(`GuideBot: Ready to serve ${bot.users.size} users, in ${bot.channels.size} channels of ${bot.guilds.size} servers.`);
});

bot.on("error", console.error);
bot.on("warn", console.warn);

bot.login(config.botToken);

bot.reload = function(command) {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./cmd/${command}`)];
      let cmd = require(`./cmd/${command}`);
      bot.commands.delete(command);
      bot.aliases.forEach((cmd, alias) => {
        if (cmd === command) bot.aliases.delete(alias);
      });

      bot.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        bot.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

bot.elevation = function(msg) {
  /* This function should resolve to an ELEVATION level which
     is then sent to the command handler for verification*/
  let permlvl = 0;
  let mod_role = msg.guild.roles.find("name", "Mods");
  if(mod_role && msg.member.roles.has(mod_role.id)) permlvl = 2;
  let admin_role = msg.guild.roles.find("name", "Devs");
  if(admin_role && msg.member.roles.has(admin_role.id)) permlvl = 3;
  if(msg.author.id === config.ownerid) permlvl = 4;
  console.log(`Permission level for ${msg.author.username}: ${permlvl}`);
  return permlvl;
};
