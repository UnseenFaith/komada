exports.run = (client, msg, [cmd]) => {
  if (!cmd) {
    buildHelp(client, msg)
    .then(help => {
      let helpMessage = [];
      for (let key in help) {
        helpMessage.push(`**${key} Commands**: \`\`\`asciidoc`);
        for (let key2 in help[key]) {
          helpMessage.push(`= ${key2} =`);
          helpMessage.push(help[key][key2].join("\n") + "\n");
        }
        helpMessage.push("```\n\u200b");
      }
      msg.channel.sendMessage(helpMessage, { split: { char: "\u200b" } }).catch(e => { console.error(e); });
    });

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

const buildHelp = (client, msg) => {
  return new Promise(resolve => {
    let help = {};
    let mps = [];

    let commandNames = Array.from(client.commands.keys());
    let longest = commandNames.reduce((longest, str) => {
      return Math.max(longest, str.length);
    }, 0);

    client.commands.forEach(command => {
      mps.push(new Promise(res => {
        client.funcs.runCommandInhibitors(client, msg, command, true)
       .then(() => {
         let cat = command.help.category;
         let subcat = command.help.subCategory;
         if (!help.hasOwnProperty(cat)) help[cat] = {};
         if (!help[cat].hasOwnProperty(subcat)) help[cat][subcat] = [];
         help[cat][subcat].push(`${msg.guildConf.prefix}${command.help.name}::${" ".repeat(longest - command.help.name.length)} ${command.help.description}`);
         res();
       })
       .catch(() => {
         res();
       });
      }));
    });
    Promise.all(mps).then(() => {
      resolve(help);
    });
  });
};
