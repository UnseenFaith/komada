const request = require("superagent");
const vm = require("vm");
const fs = require("fs-extra-promise");
const path = require("path");
const url = require("url");

exports.run = (client, msg, [link, piece, folder = "Downloaded"]) => {
  const proposedURL = url.parse(link);
  const piecesURL = "https://raw.githubusercontent.com/dirigeants/komada-pieces/master/";
  let newURL;
  if (!proposedURL.protocol && !proposedURL.hostname) {
    if (!piece) return msg.channel.sendMessage(`<@!${msg.author.id}> | You provided an invalid url, and no piece name to look up in the Pieces repository.`);
    if (link === "command") {
      piece = piece.split("/");
      if (piece.length < 0 || piece.length > 2) return msg.channel.sendMessage(`<@!${msg.author.id}> | You provided an invalid or no subfolder for a command. Please provide a valid folder name from the Pieces Repo. Example: Misc/test`);
      newURL = `${piecesURL}${link}/${piece.join("/")}.js`;
    } else {
      newURL = `${piecesURL}${link}/${piece}.js`;
    }
  } else {
    newURL = proposedURL;
  }
  request.get(newURL, (error, res) => {
    if (error) {
      if (error.message === "Unexpected token <") return msg.channel.sendMessage(`<@!${msg.author.id}> | An error has occured: **${error.message}** | This typically happens when you try to download a file from a link that isn't raw github information. Try a raw link instead!`);
      if (error.message === "Not Found") return msg.channel.sendMessage(`<@!${msg.author.id}> | An error has occured: **${error.message}** | This typically happens when you try to download a piece that doesn't exist. Try verifying it exists.`);
      return msg.channel.sendMessage(`<@!${msg.author.id}> | An error has occured: **${error}** | We're not sure what happened here... Report this to our Developers to get it checked out!`);
    }
    const mod = {
      exports: {},
    };
    try {
      vm.runInNewContext(res.text, { module: mod, exports: mod.exports }, { timeout: 500 });
    } catch (err) {
      if (err.message === "Unexpected identifier") {
        return msg.channel.sendMessage(`<@!${msg.author.id}> | An error has occured: **${err.message}** | This typically happens when you try to download a file that uses Node 7's new \`Async/await\` feature, or the creator of the piece messed up the code.`);
      } else if (err.message === "require is not defined") {
        return msg.channel.sendMessage(`<@!${msg.author.id}> | An error has occured: **${err.message}** | This typically happens when you try to download a file that has a require outside of an \`exports\`. Ask the Developer to fix it or download it as a file and then load it.`);
      }
      return console.log(err.message);
    }

    const name = mod.exports.help.name;
    const description = mod.exports.help.description || "No description provided.";
    const type = link;
    const modules = mod.exports.conf.requiredModules || "No required modules.. Yay!";

    if (!name) return msg.channel.sendMessage(`<@!${msg.author.id}> | I have stopped the load of this piece because it does not have a name value, and I cannot determine the file name without it. Please ask the Developer of this piece to add it.`);
    if (!type) return msg.channel.sendMessage(`<@!${msg.author.id}> | I have stopped the load of this piece because it does not have a type value, and I cannot determine the type without it. Please ask the Developer of the piece to add it.`);
    if (!["commands", "functions", "inhibitors", "monitors", "providers"].includes(type)) return msg.channel.sendMessage(`<@!${msg.author.id}> | I have stopped the loading of this piece because its type value doesn't match those we accept. Please ask the Developer of the piece to fix it.`);

    switch (type) {
      case "commands":
        if (client.commands.has(name)) return msg.channel.sendMessage(`<@!${msg.author.id}> | That command already exists in your bot. Aborting the load.`);
        break;
      case "functions":
        if (client.funcs[name]) return msg.channel.sendMessage(`<@!${msg.author.id}> | That function already exists in your bot. Aborting the load.`);
        break;
      case "inhibitors":
        if (client.commandInhibitors.has(name)) return msg.channel.sendMessage(`<@!${msg.author.id}> | That command inhibitor already exists in your bot. Aborting the load.`);
        break;
      case "monitors":
        if (client.messageMonitors.has(name)) return msg.channel.sendMessage(`<@!${msg.author.id}> | That message monitor already exists in your bot. Aborting the load.`);
        break;
      case "providers":
        if (client.providers.has(name)) return msg.channel.sendMessage(`<@!${msg.author.id} | That provider already exists in your bot. Aborting the load.`);
        break;
      default:
        return "This will never trigger";
    }

    if (mod.exports.conf.selfbot && !client.config.selfbot) return msg.reply(`I am not a selfbot, so I cannot download nor use ${name}.`);
    msg.channel.sendMessage(`Are you sure you want to load the following ${type} into your bot? This will also install all required modules. This prompt will abort after 20 seconds.
\`\`\`asciidoc
=== NAME ===
${name}

=== DESCRIPTION ===
${description}

=== REQUIRED MODULES ===
${modules}
\`\`\``);

    const collector = msg.channel.createCollector(m => m.author === msg.author, { time: 20000 });
    collector.on("message", (m) => {
      if (m.content.toLowerCase() === "no") collector.stop("aborted");
      if (m.content.toLowerCase() === "yes") collector.stop("success");
    });

    collector.on("end", async (collected, reason) => {
      if (reason === "aborted") {
        return msg.channel.sendMessage(`:no_mobile_phones: Load aborted, ${type} not installed.`);
      } else if (reason === "time") {
        return msg.channel.sendMessage(`:timer: Load aborted, ${type} not installed. You ran out of time.`);
      } else if (reason === "success") {
        const m = await msg.channel.sendMessage(`:inbox_tray: \`Loading ${type}\``).catch(err => client.funcs.log(err, "error"));
        if (Array.isArray(modules) && modules.length > 0) {
          await client.funcs.installNPM(modules.join(" "))
          .catch((err) => {
            console.error(err);
            process.exit();
          });
          const category = mod.exports.help.category ? mod.exports.help.category : client.funcs.toTitleCase(folder);
          let message;
          switch (type) {
            case "commands": {
              const dir = path.resolve(`${client.clientBaseDir}/commands/${category}/`);
              m.edit(`:inbox_tray: \`Loading ${type} into ${dir}/${name}.js...\``);
              await fs.ensureDirAsync(dir).catch(err => client.funcs.log(err, "error"));
              fs.writeFileSync(`${dir}${path.sep}${name}.js`, res.text);
              message = await client.funcs.reload.command(client, client.clientBaseDir, name)
                        .catch((response) => {
                          m.edit(`:no_mobile_phones: Command load failed ${name}\n\`\`\`${response}\`\`\``);
                          return fs.unlinkSync(`${dir}/${name}.js`);
                        });
              if (message) m.edit(`:inbox_tray: ${message}`);
              break;
            }
            case "functions": {
              const dir = path.resolve(`${client.clientBaseDir}/functions/`);
              m.edit(`:inbox_tray: \`Loading ${type} into ${dir}/${name}.js...\``);
              await fs.writeFileAsync(`${dir}${path.sep}${name}.js`, res.text).catch(err => client.funcs.log(err, "error"));
              message = await client.funcs.reload.function(client, client.clientBaseDir, name)
                        .catch((response) => {
                          m.edit(`:no_mobile_phones: Function load failed ${name}\n\`\`\`${response}\`\`\``);
                          return fs.unlinkSync(`${dir}/${name}.js`);
                        });
              if (message) m.edit(`:inbox_tray: ${message}`);
              break;
            }
            case "inhibitors": {
              const dir = path.resolve(`${client.clientBaseDir}/inhibitors/`);
              m.edit(`:inbox_tray: \`Loading ${type} into ${dir}/${name}.js...\``);
              await fs.writeFileAsync(`${dir}/${name}.js`, res.text).catch(err => client.funcs.log(err, "error"));
              message = await client.funcs.reload.inhibitor(client, client.clientBaseDir, name)
                        .catch((response) => {
                          m.edit(`:no_mobile_phones: Inhibitor load failed ${name}\n\`\`\`${response}\`\`\``);
                          return fs.unlinkSync(`${dir}/${name}.js`);
                        });
              if (message) m.edit(`:inbox_tray: ${message}`);
              break;
            }
            case "monitors": {
              const dir = path.resolve(`${client.clientBaseDir}/monitors/`);
              m.edit(`:inbox_tray: \`Loading ${type} into ${dir}/${name}.js...\``);
              await fs.writeFileAsync(`${dir}/${name}.js`, res.text).catch(err => client.funcs.log(err, "error"));
              message = await client.funcs.reload.monitor(client, client.clientBaseDir, name)
                        .catch((response) => {
                          m.edit(`:no_mobile_phones: Monitor load failed ${name}\n\`\`\`${response}\`\`\``);
                          return fs.unlinkSync(`${dir}/${name}.js`);
                        });
              if (message) m.edit(`:inbox_tray: ${message}`);
              break;
            }
            case "providers": {
              const dir = path.resolve(`${client.clientBaseDir}/providers/`);
              m.edit(`:inbox_tray: \`Loading ${type} into ${dir}/${name}.js...\``);
              await fs.writeFileAsync(`${dir}/${name}.js`, res.text).catch(err => client.funcs.log(err, "error"));
              message = await client.funcs.reload.provider(client, client.clientBaseDir, name)
                        .catch((response) => {
                          m.edit(`:no_mobile_phones: Provider load failed ${name}\n\`\`\`${response}\`\`\``);
                          return fs.unlinkSync(`${dir}/${name}.js`);
                        });
              m.edit(`:inbox_tray: ${message}`);
              break;
            }
            default:
              return "Will never trigger";
          }
        } else {
          const category = mod.exports.help.category ? mod.exports.help.category : client.funcs.toTitleCase(folder);
          let message;
          switch (type) {
            case "commands": {
              const dir = path.resolve(`${client.clientBaseDir}/commands/${category}`);
              m.edit(`:inbox_tray: \`Loading ${type} into ${dir}/${name}.js...\``);
              await fs.ensureDirAsync(dir).catch(err => client.funcs.log(err, "error"));
              await fs.writeFileAsync(`${dir}${path.sep}${name}.js`, res.text);
              message = await client.funcs.reload.command(client, client.clientBaseDir, name)
                        .catch((response) => {
                          m.edit(`:no_mobile_phones: Command load failed ${name}\n\`\`\`${response}\`\`\``);
                          fs.unlinkSync(`${dir}/${name}.js`);
                        });
              if (message) m.edit(`:inbox_tray: ${message}`);
              break;
            }
            case "functions": {
              const dir = path.resolve(`${client.clientBaseDir}/functions/`);
              m.edit(`:inbox_tray: \`Loading ${type} into ${dir}/${name}.js...\``);
              await fs.writeFileAsync(`${dir}/${name}.js`, res.text).catch(err => client.funcs.log(err, "error"));
              message = await client.funcs.reload.function(client, client.clientBaseDir, name)
                        .catch((response) => {
                          m.edit(`:no_mobile_phones: Function load failed ${name}\n\`\`\`${response}\`\`\``);
                          return fs.unlinkSync(`${dir}/${name}.js`);
                        });
              m.edit(`:inbox_tray: ${message}`);
              break;
            }
            case "inhibitors": {
              const dir = path.resolve(`${client.clientBaseDir}/inhibitors/`);
              m.edit(`:inbox_tray: \`Loading ${type} into ${dir}/${name}.js...\``);
              await fs.writeFileAsync(`${dir}/${name}.js`, res.text).catch(err => client.funcs.log(err, "error"));
              message = await client.funcs.reload.inhibitor(client, client.clientBaseDir, name)
                        .catch((response) => {
                          m.edit(`:no_mobile_phones: Inhibitor load failed ${name}\n\`\`\`${response}\`\`\``);
                          return fs.unlinkSync(`${dir}/${name}.js`);
                        });
              m.edit(`:inbox_tray: ${message}`);
              break;
            }
            case "monitors": {
              const dir = path.resolve(`${client.clientBaseDir}/monitors/`);
              m.edit(`:inbox_tray: \`Loading ${type} into ${dir}/${name}.js...\``);
              await fs.writeFileAsync(`${dir}/${name}.js`, res.text).catch(err => client.funcs.log(err, "error"));
              message = await client.funcs.reload.monitor(client, client.clientBaseDir, name)
                        .catch((response) => {
                          m.edit(`:no_mobile_phones: Monitor load failed ${name}\n\`\`\`${response}\`\`\``);
                          return fs.unlinkSync(`${dir}/${name}.js`);
                        });
              m.edit(`:inbox_tray: ${message}`);
              break;
            }
            case "providers": {
              const dir = path.resolve(`${client.clientBaseDir}/providers/`);
              m.edit(`:inbox_tray: \`Loading ${type} into ${dir}/${name}.js...\``);
              await fs.writeFileAsync(`${dir}/${name}.js`, res.text).catch(err => client.funcs.log(err, "error"));
              message = await client.funcs.reload.provider(client, client.clientBaseDir, name)
                        .catch((response) => {
                          m.edit(`:no_mobile_phones: Provider load failed ${name}\n\`\`\`${response}\`\`\``);
                          return fs.unlinkSync(`${dir}/${name}.js`);
                        });
              m.edit(`:inbox_tray: ${message}`);
              break;
            }
            default:
              return "Will never trigger";
          }
        }
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
  description: "Downloads a piece, either from a link or our Pieces Repository, and installs it.",
  usage: "<commands|functions|monitors|inhibitors|providers|url:url> [location:str] [folder:str]",
  usageDelim: " ",
};
