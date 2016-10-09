const Discord = require("discord.js");
exports.run = (bot, msg, params = []) => {
  msg.channel.sendMessage(`The following repository, called \`GuideBot\`, is on the surface just the code for @GuideBot#2992 ... But secretly, it's a command handler example with explanations that will help you in implementing and using it. No secret module being used, no magic trick - just code that is easy enough to understand and use. It even has a built-in "reload" and "help" command and a few basic other commands you can look at to understand what's going on! It will also be expanded in the future so watch that repo, boys and girls.
<https://github.com/eslachance/guidebot>

**Statistics**
\`\`\`
STATISTICS
• Mem Usage    : ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
• Swap Size    : ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB
• Uptime       : ${bot.uptime}
• Users        : ${bot.users.size}
• Servers      : ${bot.guilds.size}
• Channels     : ${bot.channels.size}
• Discord.js   : v${Discord.version}
\`\`\``);
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["details", "what"],
  permLevel: 0,
  botPerms: []
};

exports.help = {
  name: "info",
  description: "Provides some information about this bot.",
  usage: "info"
};
