const request = require("superagent");
const vm = require("vm");
const fs = require("fs-extra-promise");
const path = require("path");

const piecesURL = "https://raw.githubusercontent.com/dirigeants/komada-pieces/master/";
const types = ["commands", "functions", "monitors", "inhibitors", "providers"];

exports.run = async (client, msg, [link, piece, folder = "Downloaded"]) => {
  const proposedURL = types.includes(link) ? `${piecesURL}${link}/${piece}.js` : link;
  piece = piece.split("/");
  if (piece.length > 2) {
    throw `<@!${msg.author.id}> | You provided an invalid or no subfolder for a command. Please provide a valid folder name from the Pieces Repo. Example: Misc/test`;
  }

  const res = await requestAndCheck(proposedURL)
		.catch((err) => { throw `<@!${msg.author.id}> | ${err}`; });

  const mod = { exports: {} };
  try {
    vm.runInNewContext(res.text, { module: mod, exports: mod.exports }, { timeout: 500 });
  } catch (err) {
    if (err.message === "Unexpected identifier") {
			// eslint-disable-next-line max-len
      throw `<@!${msg.author.id}> | An error has occured: **${err.message}** | This typically happens when you try to download a file that uses Node 7's new \`Async/await\` feature, or the creator of the piece messed up the code.`;
    } else if (err.message === "require is not defined") {
			// eslint-disable-next-line max-len
      throw `<@!${msg.author.id}> | An error has occured: **${err.message}** | This typically happens when you try to download a file that has a require outside of an \`exports\`. Ask the Developer to fix it or download it as a file and then load it.`;
    }
    console.log(err.message);
    return;
  }

  const name = mod.exports.help.name;
  const description = mod.exports.help.description || "No description provided.";
  const type = mod.exports.help.type || link;
  const modules = mod.exports.conf.requiredModules || "No required modules.. Yay!";

  try {
    runChecks(client, type, name);
  } catch (err) {
    throw `<@!${msg.author.id}> | ${err}`;
  }

  if (mod.exports.conf.selfbot && !client.config.selfbot) throw `I am not a selfbot, so I cannot download nor use ${name}.`;

  const code = ["```asciidoc",
    "=== NAME ===",
    name,
    "",
    "=== DESCRIPTION ===",
    description,
    "",
    "=== REQUIRED MODULES ===",
    modules,
    "```"];
  msg.sendMessage(`Are you sure you want to load the following ${type} into your bot? This will also install all required modules. This prompt will abort after 20 seconds.${code.join("\n")}`);

  const collector = msg.channel.createCollector(mes => mes.author === msg.author, { time: 20000 });

  collector.on("message", (mes) => {
    if (mes.content.toLowerCase() === "no") collector.stop("aborted");
    if (mes.content.toLowerCase() === "yes") collector.stop("success");
  });

  collector.on("end", async (collected, reason) => {
    if (reason === "aborted") {
      throw `📵 Load aborted, ${type} not installed.`;
    } else if (reason === "time") {
      throw `⏲ Load aborted, ${type} not installed. You ran out of time.`;
    } else if (reason === "success") {
      await msg.sendMessage(`📥 \`Loading ${type}\``).catch(err => client.emit("log", err, "error"));
      if (Array.isArray(modules) && modules.length > 0) {
        await client.funcs.installNPM(modules.join(" "))
					.catch((err) => {
  console.error(err);
  process.exit();
});
      }
      load[type](client, msg, type, res, name, mod.exports.help.category || client.funcs.toTitleCase(folder));
    }
  });
};

exports.conf = {
  enabled: true,
  runIn: ["text"],
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

const requestAndCheck = newURL => new Promise((resolve, reject) => {
  request.get(newURL, (error, res) => {
    if (!error) return resolve(res);
    if (error.message === "Unexpected token <") {
      return reject(`An error has occured: **${error.message}** | This typically happens when you try to download a file from a link that isn't raw github information. Try a raw link instead!`);
    }
    if (error.message === "Not Found") {
      return reject(`An error has occured: **${error.message}** | This typically happens when you try to download a piece that doesn't exist. Try verifying it exists.`);
    }
    return reject(`An error has occured: **${error}** | We're not sure what happened here... Report this to our Developers to get it checked out!`);
  });
});

const runChecks = (client, type, name) => {
  if (!name) {
    throw "I have stopped the load of this piece because it does not have a name value, and I cannot determine the file name without it. Please ask the Developer of this piece to add it.";
  }
  if (!type) {
    throw "I have stopped the load of this piece because it does not have a type value, and I cannot determine the type without it. Please ask the Developer of the piece to add it.";
  }
  if (!types.includes(type)) {
    throw "I have stopped the loading of this piece because its type value doesn't match those we accept. Please ask the Developer of the piece to fix it.";
  }
  switch (type) {
    case "commands":
      if (client.commands.has(name)) throw "That command already exists in your bot. Aborting the load.";
      break;
    case "functions":
      if (client.funcs[name]) throw "That function already exists in your bot. Aborting the load.";
      break;
    case "inhibitors":
      if (client.commandInhibitors.has(name)) throw "That command inhibitor already exists in your bot. Aborting the load.";
      break;
    case "monitors":
      if (client.messageMonitors.has(name)) throw "That message monitor already exists in your bot. Aborting the load.";
      break;
    case "providers":
      if (client.providers.has(name)) throw "That provider already exists in your bot. Aborting the load.";
      break;
  }
};

const load = {
  commands: async (client, msg, type, res, name, category) => {
    const dir = path.resolve(`${client.clientBaseDir}/commands/${category}/`);
    msg.sendMessage(`📥 \`Loading ${type} into ${dir}/${name}.js...\``);
    await fs.ensureDirAsync(dir).catch(err => client.emit("log", err, "error"));
    await fs.writeFileAsync(`${dir}${path.sep}${name}.js`, res.text);
    const message = await client.funcs.reloadCommand(`${category}${path.sep}${name}`)
			.catch((response) => {
  msg.sendMessage(`📵 Command load failed ${name}\n\`\`\`${response}\`\`\``);
  return fs.unlinkSync(`${dir}/${name}.js`);
});
    if (message) msg.sendMessage(`📥 ${message}`);
  },
  functions: async (client, msg, type, res, name) => {
    const dir = path.resolve(`${client.clientBaseDir}/functions/`);
    msg.sendMessage(`📥 \`Loading ${type} into ${dir}/${name}.js...\``);
    await fs.writeFileAsync(`${dir}${path.sep}${name}.js`, res.text).catch(err => client.emit("log", err, "error"));
    const message = await client.funcs.reloadFunction(name)
			.catch((response) => {
  msg.sendMessage(`📵 Function load failed ${name}\n\`\`\`${response}\`\`\``);
  return fs.unlinkSync(`${dir}/${name}.js`);
});
    if (message) msg.sendMessage(`📥 ${message}`);
  },
  inhibitors: async (client, msg, type, res, name) => {
    const dir = path.resolve(`${client.clientBaseDir}/inhibitors/`);
    msg.sendMessage(`📥 \`Loading ${type} into ${dir}/${name}.js...\``);
    await fs.writeFileAsync(`${dir}/${name}.js`, res.text).catch(err => client.emit("log", err, "error"));
    const message = await client.funcs.reloadInhibitor(name)
			.catch((response) => {
  msg.sendMessage(`📵 Inhibitor load failed ${name}\n\`\`\`${response}\`\`\``);
  return fs.unlinkSync(`${dir}/${name}.js`);
});
    if (message) msg.sendMessage(`📥 ${message}`);
  },
  monitors: async (client, msg, type, res, name) => {
    const dir = path.resolve(`${client.clientBaseDir}/monitors/`);
    msg.sendMessage(`📥 \`Loading ${type} into ${dir}/${name}.js...\``);
    await fs.writeFileAsync(`${dir}/${name}.js`, res.text).catch(err => client.emit("log", err, "error"));
    const message = await client.funcs.reloadMessageMonitor(name)
			.catch((response) => {
  msg.sendMessage(`📵 Monitor load failed ${name}\n\`\`\`${response}\`\`\``);
  return fs.unlinkSync(`${dir}/${name}.js`);
});
    if (message) msg.sendMessage(`📥 ${message}`);
  },
  providers: async (client, msg, type, res, name) => {
    const dir = path.resolve(`${client.clientBaseDir}/providers/`);
    msg.sendMessage(`📥 \`Loading ${type} into ${dir}/${name}.js...\``);
    await fs.writeFileAsync(`${dir}/${name}.js`, res.text).catch(err => client.emit("log", err, "error"));
    const message = await client.funcs.reloadProvider(name)
			.catch((response) => {
  msg.sendMessage(`📵 Provider load failed ${name}\n\`\`\`${response}\`\`\``);
  return fs.unlinkSync(`${dir}/${name}.js`);
});
    msg.sendMessage(`📥 ${message}`);
  },
};
