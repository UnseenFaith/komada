const request = require("superagent");
const vm = require("vm");
var fs = require("fs");

exports.run = (client, msg, [url]) => {
  request.get(url, (err, res) => {
    if (err) console.log(err);

    const collector = msg.channel.createCollector(m => m.author === msg.author, {
      time: 10000
    });
    msg.channel.sendMessage("Are you sure you want to add the following command to your bot?").then(() => {
      msg.channel.sendCode("js", res.text);
    });
    collector.on("message", m => {
      if (m.content === "no") collector.stop("aborted");
      if (m.content === "yes") collector.stop("success");
    });
    collector.on("end", (collected, reason) => {
      if (reason === "time") return msg.channel.sendMessage("Timed out: Maybe you should review the code before trying to add it?");
      if (reason === "aborted") return msg.channel.sendMessage("Canceled: The script **has not** been added.");
      if (reason === "success") {
        msg.channel.sendMessage("Adding to Commands...")
          .then((m) => {
            var mod = {
              exports: {}
            };
            try {
              vm.runInNewContext(res.text, { module: mod, exports: mod.exports }, {});
            } catch (e) {
              m.edit(`Command not valid: ${e}`);
              return;
            }
            let name = mod.exports.help.name;
            let description = mod.exports.help.description;
            client.log(`New Command: ${name} / ${description}`);
            fs.writeFile(`./cmds/Downloaded/${name}.js`, res.text, (err) => {
              if (err) console.error(err);
              client.funcs.loadNewCommand(client, `Downloaded/${name}.js`)
                .then(() => {
                  m.edit(`Successfully Loaded: ${name}`);
                })
                .catch(e => {
                  m.edit(`Command load failed: ${name}\n\`\`\`${e.stack}\`\`\``);
                });
            });
          })
          .catch(e => {
            console.error(e);
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
