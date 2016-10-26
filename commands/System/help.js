exports.run = (client, msg, [cmd]) => {
  if (!cmd) {
    let helpMessage = [];

    for (let [category, subCategories] of client.helpStructure) {
      helpMessage.push(`**${category} Commands**: \`\`\`asciidoc`);
      for(let [subCategory, commands] of subCategories) {
        helpMessage.push(`= ${subCategory} =`);
        client.funcs.log(`There are ${commands.size} commands in ${subCategory}`);

        let commandNames = Array.from(commands.keys());
        let longest = commandNames.reduce((longest, name) => Math.max(longest, name.length), 0);

        for(let [command, description] of commands) {
          client.funcs.log(`Help command for ${command} :: ${description}`);
          helpMessage.push(`${command}::${" ".repeat(longest - command.length)} ${description}`);
        }
        helpMessage.push(" ");
      }
      helpMessage.push("```\n\u200b");
    }
    msg.channel.sendMessage(helpMessage, { split: { char: "\u200b" } }).catch(e => { console.error(e); });

  } else {
    if (client.commands.has(cmd)) {
      cmd = client.commands.get(cmd);
      msg.channel.sendCode("asciidoc", `= ${cmd.help.name} = \n${cmd.help.description}\nusage :: ${client.funcs.fullUsage(client, cmd)}`);
    }
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: []
};

exports.help = {
  name: "help",
  description: "Display help for a command.",
  usage: "[command:str]",
  usageDelim: ""
};
