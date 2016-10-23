const request = require("superagent");
const vm = require("vm");
var fs = require("fs-extra");

exports.run = (client, msg, [url]) => {
  request.get(url, (err, res) => {
    if (err) console.log(err);

    // Load Command Data
    var mod = {
      exports: {}
    };
    try {
      vm.runInNewContext(res.text, { module: mod, exports: mod.exports }, {timeout: 500});
    } catch (e) {
      msg.reply(`URL command not valid: ${e}`);
      return;
    }

    let name = mod.exports.help.name;
    let description = mod.exports.help.description;

    if (client.commands.has(name)) {
      msg.reply(`The command \`${name}\` already exists in the bot!`);
      return;
    }

    msg.channel.sendMessage(`Are you sure you want to load the following command into your bot?
\`\`\`asciidoc
=== NAME ===
${name}

=== DESCRIPTION ===
${description}
\`\`\``);

    const collector = msg.channel.createCollector(m => m.author === msg.author, {
      time: 5000
    });

    collector.on("message", m => {
      if (m.content.toLowerCase() === "no") collector.stop("aborted");
      if (m.content.toLowerCase() === "yes") collector.stop("success");
    });

    collector.on("end", (collected, reason) => {
      if (reason === "time") return msg.channel.sendMessage(":timer: 5s timeout. Can you read a bit faster?");
      if (reason === "aborted") return msg.channel.sendMessage(":no_mobile_phones: Load Aborted. Command not installed.");
      if (reason === "success") {
        msg.channel.sendMessage(":inbox_tray: `Loading Command...`").then(m => {
          let category = mod.exports.help.category ? mod.exports.help.category : "Downloaded";
          let dir = require("path").resolve(`${client.clientBaseDir}/commands/${category}/`);
          client.funcs.log(dir);
          m.edit(`:inbox_tray: \`Loading Command into ${dir}/${name}.js...\``);

          fs.ensureDir(dir, err => {
            if (err) {
              fs.mkDirSync(dir);
            }
            fs.writeFile(`${dir}/${name}.js`, res.text, (err) => {
              if(err) console.error(err);
              let relativePath = require("path").relative(client.clientBasePath, dir);
              client.funcs.loadNewCommand(client, `${relativePath}/${name}.js`)
                .then(() => {
                  m.edit(`:inbox_tray: Successfully Loaded: ${name}`);
                })
                .catch(e => {
                  m.edit(`:no_mobile_phones: Command load failed: ${name}\n\`\`\`${e.stack}\`\`\``);
                  fs.unlink(`${dir}/${name}.js`);
                });
            });
          });
        });
      }
    });
  });
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: 5,
  botPerms: [],
  requiredFuncs: []
};

exports.help = {
  name: "download",
  description: "Downloads a command and installs it to Komada",
  usage: "<url:url>",
  usageDelim: ""
};
