const request = require("superagent");
const vm = require("vm");
const exec = require("child_process").exec;
const fs = require("fs-extra");
const path = require("path");

exports.run = (client, msg, [url, folder = "Downloaded"]) => {
  request.get(url, (err, res) => {
    if (err) console.log(err);

    // Load Command Data
    const mod = {
      exports: {},
    };

    const code =
      `(function(require) {
      ${res.text};
    })`;

    try {
      vm.runInNewContext(code, { module: mod, exports: mod.exports }, { timeout: 500 })(require);
    } catch (e) {
      if (e.message.startsWith("Cannot find module ")) {
        msg.channel.sendMessage("Couldn't find module... Attempting to download.").then((m) => {
          const moduleName = e.message.substring(19).replace(/'/g, "");
          client.funcs.installNPM(moduleName).then(() => {
            m.edit(`Downloaded **${moduleName}!** I will make an attempt to load the command now.`);
            if (client.tempmodules === undefined) client.tempmodules = [];
            client.tempmodules.push(moduleName);
            client.commands.get("download").run(client, msg, [url, folder]);
          }).catch((e) => {
            console.log(e);
          });
        });
      } else if (e.message.startsWith("ENOENT: no such file or directory, open ")) {
        msg.channel.sendMessage("Couldn't find module... Attempting to download.");
        const string = e.message.substring(e.message.indexOf("node_modules"), e.message.lastIndexOf("\\"));
        const moduleName = string.substring(string.indexOf("\\") + 1, string.length);
        client.funcs.installNPM(moduleName).then((m) => {
          m.edit(`Downloaded **${moduleName}!** I will make an attempt to load the command now.`);
          if (client.tempmodules === undefined) client.tempmodules = [];
          client.tempmodules.push(moduleName);
          client.commands.get("download").run(client, msg, [url, folder]);
        }).catch((e) => {
          console.log(e);
        });
        return;
      } else {
        msg.reply(`URL command not valid: ${e}`);
        return;
      }
      return;
    }

    const name = mod.exports.help.name;
    const description = mod.exports.help.description;

    if (client.commands.has(name)) {
      msg.reply(`The command \`${name}\` already exists in the bot!`);
      delete client.tempmodules;
      return;
    }

    if (mod.exports.conf.selfbot && !client.config.selfbot) {
      msg.channel.sendMessage(`The command \`${name}\` is only usable in selfbots! I'll uninstall the modules for you.`).then((m) => {
        exec(`npm uninstall ${client.tempmodules.join(" ")}`, (e, stdout, stderr) => {
          if (e) {
            msg.channel.sendMessage("Failed uninstalling the modules.. Sorry about that.");
            console.log(e);
          } else {
            console.log(stdout);
            console.log(stderr);
            m.edit(`Succesfully uninstalled : **${client.tempmodules.join(", ")}**`);
            client.tempmodules.forEach((module) => {
              delete require.cache[require.resolve(module)];
            });
            delete client.tempmodules;
          }
        });
      });
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
      time: 8000,
    });

    collector.on("message", (m) => {
      if (m.content.toLowerCase() === "no") collector.stop("aborted");
      if (m.content.toLowerCase() === "yes") collector.stop("success");
    });

    collector.on("end", (collected, reason) => {
      if (reason === "aborted" || reason === "time") {
        if (client.tempmodules !== undefined) {
          msg.channel.sendMessage(":no_mobile_phones: Load Aborted. Command not installed. Lemme remove those useless modules for you :smile:").then((m) => {
            exec(`npm uninstall ${client.tempmodules.join(" ")}`, (e, stdout, stderr) => {
              if (e) {
                msg.channel.sendMessage("Failed uninstalling the modules.. Sorry about that, the modules you need to uninstall are in `client.tempmodules`");
                console.log(e);
              } else {
                console.log(stdout);
                console.log(stderr);
                m.edit(`Succesfully uninstalled : **${client.tempmodules.join(", ")}**`);
                client.tempmodules.forEach((module) => {
                  delete require.cache[require.resolve(module)];
                });
                delete client.tempmodules;
              }
            });
          });
        } else {
          msg.channel.sendMessage(":no_mobile_phones: Load Aborted. Command not installed.");
          return;
        }
      }
      if (reason === "success") {
        msg.channel.sendMessage(":inbox_tray: `Loading Command...`").then((m) => {
          const category = mod.exports.help.category ? mod.exports.help.category : client.funcs.toTitleCase(folder);
          const dir = path.resolve(`${client.clientBaseDir}/commands/${category}/`);
          m.edit(`:inbox_tray: \`Loading Command into ${dir}/${name}.js...\``);

          fs.ensureDir(dir, (err) => {
            if (err) console.error(err);
            fs.writeFile(`${dir}/${name}.js`, res.text, (err) => {
              if (err) console.error(err);
              client.funcs.loadSingleCommand(client, name, false, `${dir}/${name}.js`)
                .then((cmd) => {
                  m.edit(`:inbox_tray: Successfully Loaded: ${cmd.help.name}`);
                  delete client.tempmodules;
                })
                .catch((e) => {
                  m.edit(`:no_mobile_phones: Command load failed: ${name}\n\`\`\`${e.stack}\`\`\``);
                  fs.unlink(`${dir}/${name}.js`);
                  delete client.tempmodules;
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
  requiredFuncs: [],
};

exports.help = {
  name: "download",
  description: "Downloads a command and installs it to Komada",
  usage: "<url:url> [folder:str]",
  usageDelim: " ",
};
