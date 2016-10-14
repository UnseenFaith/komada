const fs = require("fs");

exports.run = (client, msg, [commandname]) => {
  if (commandname === "all") {
    client.log("Reloading all commands");
    client.funcs.loadCommands(client);
    return;
  }
  let command;
  if (client.commands.has(commandname)) {
    command = commandname;
  } else if (client.aliases.has(commandname)) {
    command = client.aliases.get(commandname);
  }
  if (!command) {
    if (commandname.includes(".js")) commandname = commandname.replace(".js", "");
    fs.stat(`./cmds/${commandname}.js`, (err, stats) => {
      if (err) return msg.channel.sendMessage(`I cannot find the command: ${commandname}`);
      if (stats.isFile()) {
        msg.channel.sendMessage(`Loading New Command: ${commandname}`)
          .then(m => {
            client.funcs.reload(client, commandname)
              .then(() => {
                m.edit(`Successfully Loaded: ${commandname}`);
              })
              .catch(e => {
                m.edit(`Command load failed: ${commandname}\n\`\`\`${e.stack}\`\`\``);
              });
          });
      }
    });
  } else {
    msg.channel.sendMessage(`Reloading: ${command}`)
      .then(m => {
        client.funcs.reload(client, command)
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
  aliases: ["r", "enable"],
  permLevel: 4,
  botPerms: [],
  requiredFuncs: []
};

exports.help = {
  name: "reload",
  description: "Reloads the command file, if it's been updated or modified.",
  usage: "<all:literal|commandname:str>"
};
