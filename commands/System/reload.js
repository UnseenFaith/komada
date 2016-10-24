exports.run = (client, msg, [commandname]) => {
  if (commandname === "all") {
    client.funcs.log("Reloading all commands");
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
    client.funcs.getFileListing(client, client.coreBaseDir, "commands")
      .then(files => {
        let newCommands = files.filter(f=>f.name == command);
        newCommands.forEach(file => {
          msg.channel.sendMessage(`Loading New Command: ${commandname}`)
          .then(m => {
            client.funcs.loadSingleCommand(client, command, false, `${file.path}${require("path").sep}${file.base}`).then(cmd => {
              m.edit(`Successfully Loaded: ${cmd.help.name}`);
            })
            .catch(e => {
              m.edit(`Command load failed for ${command}: \n\`\`\`${e.stack}\`\`\``);
            });
          });
        });
      });
  } else {
    msg.channel.sendMessage(`Reloading: ${command}`)
      .then(m => {
        client.funcs.loadSingleCommand(client, command, true)
          .then(cmd => {
            m.edit(`Successfully reloaded: ${cmd.help.name}`);
          })
          .catch(e => {
            m.edit(`Command reload failed for ${command}: \n\`\`\`${e}\`\`\``);
          });
      });
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["r", "enable", "load"],
  permLevel: 4,
  botPerms: [],
  requiredFuncs: []
};

exports.help = {
  name: "reload",
  description: "Reloads the command file, if it's been updated or modified.",
  usage: "<all:literal|commandname:str>"
};
