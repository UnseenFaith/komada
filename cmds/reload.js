const fs = require("fs");

exports.run = (bot, msg, params) => {
  let command;
  if (bot.commands.has(params[0])) {
    command = params[0];
  } else if (bot.aliases.has(params[0])) {
    command = bot.aliases.get(params[0]);
  }
  if (!command) {
    fs.exists(`./cmds/${params[0]}.js`, exists => {
      if (exists) {
        msg.channel.sendMessage(`Loading New Command: ${params[0]}`)
    .then(m => {
      bot.reload(params[0])
      .then(() => {
        m.edit(`Successfully Loaded: ${params[0]}`);
      })
      .catch(e => {
        m.edit(`Command load failed: ${params[0]}\n\`\`\`${e.stack}\`\`\``);
      });
    });
      } else {
        msg.channel.sendMessage(`I cannot find the command: ${params[0]}`);
      }
    });
  } else {
    msg.channel.sendMessage(`Reloading: ${command}`)
    .then(m => {
      bot.reload(command)
      .then(() => {
        m.edit(`Successfully reloaded: ${command}`);
      })
      .catch(e => {
        m.edit(`Command reload failed: ${command}\n\`\`\`${e.stack}\`\`\``);
      });
    });
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["r"],
  permLevel: 4
};

exports.help = {
  name: "reload",
  description: "Reloads the command file, if it's been updated or modified.",
  usage: "reload <commandname>"
};
