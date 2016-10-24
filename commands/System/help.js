exports.run = (client, msg, [cmd]) => {
  if (!cmd) {
    let helpMessage = [];

    for (let [category, subCategories] of client.helpStructure) {
      helpMessage.push(`**${category} Commands**: \`\`\`asciidoc`);
      for(let [subCategory, commands] of subCategories) {
        helpMessage.push(`= ${subCategory} =`);
        for(let [command, description] of commands) {
          helpMessage.push(`${command} :: ${description}`);
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
