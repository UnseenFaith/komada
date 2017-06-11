const fs = require("fs-nextra");
const { promisify } = require("util");
const exec = promisify(require("child_process").exec);

const { sep } = require("path");
const Discord = require("discord.js");
const ParsedUsage = require("./parsedUsage");

const coreProtected = {
  commands: [],
  events: ["disconnect", "error", "guildCreate", "guildDelete", "message", "messageBulkDelete", "messageDelete", "messageUpdate", "warn"],
  functions: ["checkPerms", "clean", "confs", "getPrefix", "handleError", "newError", " regExpEsc", "toTitleCase"],
  inhibitors: ["runIn", "disable", "permissions", "requiredFuncs", "missingBotPermissions", "disable"],
  finalizers: [],
  monitors: [],
  providers: [],
  extendables: ["get_attachable", "get_conf", "get_embedable", "get_postable", "get_reactable", "get_readable", "get_usableCommands", "hasAtleastPermissionLevel", "send", "sendCode", "sendEmbed", "sendFile", "sendFiles", "sendMessage"],
};

/* eslint-disable no-throw-literal, import/no-dynamic-require, class-methods-use-this */
module.exports = class Loader {
  constructor(client) {
    Object.defineProperty(this, "client", { value: client });
  }

  async loadAll() {
    const [funcs, [commands, aliases], inhibitors, finalizers, events, monitors, providers, extendables] = await Promise.all([
      this.loadFunctions(),
      this.loadCommands(),
      this.loadCommandInhibitors(),
      this.loadCommandFinalizers(),
      this.loadEvents(),
      this.loadMessageMonitors(),
      this.loadProviders(),
      this.loadExtendables(),
    ]).catch((err) => {
      console.error(err);
      process.exit();
    });
    this.client.emit("log", [
      `Loaded ${funcs} functions.`,
      `Loaded ${commands} commands, with ${aliases} aliases.`,
      `Loaded ${inhibitors} command inhibitors.`,
      `Loaded ${finalizers} command finalizers.`,
      `Loaded ${monitors} message monitors.`,
      `Loaded ${providers} providers.`,
      `Loaded ${events} events.`,
      `Loaded ${extendables} extendables.`,
    ].join("\n"));
  }

  async loadFunctions() {
    const coreFiles = await fs.readdir(`${this.client.coreBaseDir}functions${sep}`)
      .catch(() => { fs.ensureDir(`${this.client.coreBaseDir}functions${sep}`).catch(err => this.client.emit("error", this.client.funcs.newError(err))); });
    if (coreFiles) {
      await this.loadFiles(coreFiles.filter(file => file.endsWith(".js")
        && (coreProtected.functions.includes(file.split(".")[0]) || !this.client.config.disabled.functions.includes(file.split(".")[0])))
        , this.client.coreBaseDir, this.loadNewFunction, this.loadFunctions)
        .catch((err) => { throw err; });
    }
    const userFiles = await fs.readdir(`${this.client.clientBaseDir}functions${sep}`)
      .catch(() => { fs.ensureDir(`${this.client.clientBaseDir}functions${sep}`).catch(err => this.client.emit("error", this.client.funcs.newError(err))); });
    if (userFiles) {
      await this.loadFiles(userFiles.filter(file => file.endsWith(".js")), this.client.clientBaseDir, this.loadNewFunction, this.loadFunctions)
        .catch((err) => { throw err; });
    }
    return (coreFiles ? coreFiles.length : 0) + (userFiles ? userFiles.length : 0);
  }

  loadNewFunction(file, dir) {
    this[file.split(".")[0]] = require(`${dir}functions${sep}${file}`);
    delete require.cache[require.resolve(`${dir}functions${sep}${file}`)];
  }

  async reloadFunction(name) {
    const file = name.endsWith(".js") ? name : `${name}.js`;
    if (name.endsWith(".js")) name = name.slice(0, -3);
    const files = await fs.readdir(`${this.client.clientBaseDir}functions${sep}`);
    if (!files.includes(file)) throw `Could not find a reloadable file named ${file}`;
    if (this[name]) delete this[name];
    await this.loadFiles([file], this.client.clientBaseDir, this.loadNewFunction, this.reloadFunction)
      .catch((err) => { throw err; });
    if (this.client.funcs[name].init) this.client.funcs[name].init(this.client);
    return `Successfully reloaded the function ${name}.`;
  }

  async loadCommands() {
    this.client.commands.clear();
    this.client.aliases.clear();
    await this.walkCommandDirectories(`${this.client.coreBaseDir}commands${sep}`)
      .catch((err) => { throw err; });
    await this.walkCommandDirectories(`${this.client.clientBaseDir}commands${sep}`)
      .catch((err) => { throw err; });
    return [this.client.commands.size, this.client.aliases.size];
  }

  async walkCommandDirectories(dir) {
    const files = await fs.readdir(dir)
      .catch(() => { fs.ensureDir(dir).catch(err => this.client.emit("error", this.client.funcs.newError(err))); });
    if (!files) return false;
    await this.loadFiles(files.filter(file => file.endsWith(".js")
      && (coreProtected.commands.includes(file.split(".")[0]) || !this.client.config.disabled.commands.includes(file.split(".")[0])))
      , dir, this.loadNewCommand, this.loadCommands)
      .catch((err) => { throw err; });
    const subfolders = [];
    const mps1 = files.filter(file => !file.includes(".")).map(async (folder) => {
      const subFiles = await fs.readdir(`${dir}${folder}${sep}`);
      if (!subFiles) return true;
      subFiles.filter(file => !file.includes(".")).forEach(subfolder => subfolders.push({ folder, subfolder }));
      return this.loadFiles(subFiles.filter(file => file.endsWith(".js")
        && (coreProtected.commands.includes(file.split(".")[0]) || !this.client.config.disabled.commands.includes(file.split(".")[0])))
        .map(file => `${folder}${sep}${file}`), dir, this.loadNewCommand, this.loadCommands)
        .catch((err) => { throw err; });
    });
    await Promise.all(mps1).catch((err) => { throw err; });
    const mps2 = subfolders.map(async (subfolder) => {
      const subSubFiles = await fs.readdir(`${dir}${subfolder.folder}${sep}${subfolder.subfolder}${sep}`);
      if (!subSubFiles) return true;
      return this.loadFiles(subSubFiles.filter(file => file.endsWith(".js")
        && (coreProtected.commands.includes(file.split(".")[0]) || !this.client.config.disabled.commands.includes(file.split(".")[0])))
        .map(file => `${subfolder.folder}${sep}${subfolder.subfolder}${sep}${file}`), dir, this.loadNewCommand, this.loadCommands)
        .catch((err) => { throw err; });
    });
    return Promise.all(mps2).catch((err) => { throw err; });
  }

  loadNewCommand(command, dir) {
    const cmd = require(`${dir}${command}`);
    cmd.help.fullCategory = command.split(sep).slice(0, -1);
    cmd.help.subCategory = cmd.help.fullCategory[1] || "General";
    cmd.help.category = cmd.help.fullCategory[0] || "General";
    cmd.cooldown = new Map();
    this.client.commands.set(cmd.help.name, cmd);
    cmd.conf.aliases = cmd.conf.aliases || [];
    cmd.conf.aliases.forEach(alias => this.client.aliases.set(alias, cmd.help.name));
    cmd.usage = new ParsedUsage(this.client, cmd);
    delete require.cache[require.resolve(`${dir}${command}`)];
  }

  async reloadCommand(name) {
    if (name.endsWith(".js")) name = name.slice(0, -3);
    name = name.split("/").join(sep);
    const fullCommand = this.client.commands.get(name) || this.client.commands.get(this.client.aliases.get(name));
    const dir = `${this.client.clientBaseDir}commands${sep}`;
    let file;
    let fileToCheck;
    let dirToCheck;
    if (fullCommand) {
      file = `${fullCommand.help.fullCategory.length !== 0 ? `${fullCommand.help.fullCategory.join(sep)}${sep}` : ""}${fullCommand.help.name}.js`;
      fileToCheck = file.split(sep)[file.split(sep).length - 1];
      dirToCheck = `${dir}${fullCommand.help.fullCategory ? `${fullCommand.help.fullCategory.join(sep)}${sep}` : ""}`;
    } else {
      file = `${name}.js`;
      fileToCheck = file.split(sep)[file.split(sep).length - 1];
      dirToCheck = `${dir}${file.split(sep).slice(0, -1).join(sep)}`;
    }
    const files = await fs.readdir(dirToCheck);
    if (!files.includes(fileToCheck)) throw `Could not find a reloadable file named ${file}`;
    this.client.aliases.forEach((cmd, alias) => {
      if (cmd === name) this.client.aliases.delete(alias);
    });
    await this.loadFiles([file], dir, this.loadNewCommand, this.reloadCommand)
      .catch((err) => { throw err; });
    if (this.client.commands.get(name.split(sep)[name.split(sep).length - 1]).init) this.client.commands.get(name.split(sep)[name.split(sep).length - 1]).init(this.client);
    return `Successfully reloaded the command ${name}.`;
  }

  async loadCommandInhibitors() {
    this.client.commandInhibitors.clear();
    const coreFiles = await fs.readdir(`${this.client.coreBaseDir}inhibitors${sep}`)
      .catch(() => { fs.ensureDir(`${this.client.coreBaseDir}inhibitors${sep}`).catch(err => this.client.emit("error", this.client.funcs.newError(err))); });
    if (coreFiles) {
      await this.loadFiles(coreFiles.filter(file => file.endsWith(".js")
        && (coreProtected.inhibitors.includes(file.split(".")[0]) || !this.client.config.disabled.inhibitors.includes(file.split(".")[0])))
        , this.client.coreBaseDir, this.loadNewInhibitor, this.loadCommandInhibitors)
        .catch((err) => { throw err; });
    }
    const userFiles = await fs.readdir(`${this.client.clientBaseDir}inhibitors${sep}`)
      .catch(() => { fs.ensureDir(`${this.client.clientBaseDir}inhibitors${sep}`).catch(err => this.client.emit("error", this.client.funcs.newError(err))); });
    if (userFiles) {
      await this.loadFiles(userFiles.filter(file => file.endsWith(".js")), this.client.clientBaseDir, this.loadNewInhibitor, this.loadCommandInhibitors)
        .catch((err) => { throw err; });
    }
    this.sortInhibitors();
    return this.client.commandInhibitors.size;
  }

  loadNewInhibitor(file, dir) {
    this.client.commandInhibitors.set(file.split(".")[0], require(`${dir}inhibitors${sep}${file}`));
    delete require.cache[require.resolve(`${dir}inhibitors${sep}${file}`)];
  }

  async reloadInhibitor(name) {
    const file = name.endsWith(".js") ? name : `${name}.js`;
    if (name.endsWith(".js")) name = name.slice(0, -3);
    const files = await fs.readdir(`${this.client.clientBaseDir}inhibitors${sep}`);
    if (!files.includes(file)) throw `Could not find a reloadable file named ${file}`;
    await this.loadFiles([file], this.client.clientBaseDir, this.loadNewInhibitor, this.reloadInhibitor)
      .catch((err) => { throw err; });
    this.sortInhibitors();
    if (this.client.commandInhibitors.get(name).init) this.client.commandInhibitors.get(name).init(this.client);
    return `Successfully reloaded the inhibitor ${name}.`;
  }

  sortInhibitors() {
    this.client.commandInhibitors = this.client.commandInhibitors.sort((low, high) => low.conf.priority < high.conf.priority);
  }

  async loadCommandFinalizers() {
    this.client.commandFinalizers.clear();
    const coreFiles = await fs.readdir(`${this.client.coreBaseDir}finalizers${sep}`)
      .catch(() => { fs.ensureDir(`${this.client.coreBaseDir}finalizers${sep}`).catch(err => this.client.emit("error", this.client.funcs.newError(err))); });
    if (coreFiles) {
      await this.loadFiles(coreFiles.filter(file => file.endsWith(".js")
        && (coreProtected.finalizers.includes(file.split(".")[0]) || !this.client.config.disabled.finalizers.includes(file.split(".")[0])))
        , this.client.coreBaseDir, this.loadNewFinalizer, this.loadCommandFinalizers)
        .catch((err) => { throw err; });
    }
    const userFiles = await fs.readdir(`${this.client.clientBaseDir}finalizers${sep}`)
      .catch(() => { fs.ensureDir(`${this.client.clientBaseDir}finalizers${sep}`).catch(err => this.client.emit("error", this.client.funcs.newError(err))); });
    if (userFiles) {
      await this.loadFiles(userFiles.filter(file => file.endsWith(".js")), this.client.clientBaseDir, this.loadNewFinalizer, this.loadCommandFinalizers)
        .catch((err) => { throw err; });
    }
    return this.client.commandFinalizers.size;
  }

  loadNewFinalizer(file, dir) {
    this.client.commandFinalizers.set(file.split(".")[0], require(`${dir}finalizers${sep}${file}`));
    delete require.cache[require.resolve(`${dir}finalizers${sep}${file}`)];
  }

  async reloadFinalizer(name) {
    const file = name.endsWith(".js") ? name : `${name}.js`;
    if (name.endsWith(".js")) name = name.slice(0, -3);
    const files = await fs.readdir(`${this.client.clientBaseDir}finalizers${sep}`);
    if (!files.includes(file)) throw `Could not find a reloadable file named ${file}`;
    await this.loadFiles([file], this.client.clientBaseDir, this.loadNewFinalizer, this.reloadFinalizer)
      .catch((err) => { throw err; });
    if (this.client.commandFinalizers.get(name).init) this.client.commandFinalizers.get(name).init(this.client);
    return `Successfully reloaded the finalizer ${name}.`;
  }

  async loadEvents() {
    this.client.eventHandlers.forEach((listener, event) => this.client.removeListener(event, listener));
    this.client.eventHandlers.clear();
    const coreFiles = await fs.readdir(`${this.client.coreBaseDir}events${sep}`)
      .catch(() => { fs.ensureDir(`${this.client.coreBaseDir}events${sep}`).catch(err => this.client.emit("error", this.client.funcs.newError(err))); });
    if (coreFiles) {
      await this.loadFiles(coreFiles.filter(file => file.endsWith(".js")
        && (coreProtected.events.includes(file.split(".")[0]) || !this.client.config.disabled.events.includes(file.split(".")[0])))
        , this.client.coreBaseDir, this.loadNewEvent, this.loadEvents)
        .catch((err) => { throw err; });
    }
    const userFiles = await fs.readdir(`${this.client.clientBaseDir}events${sep}`)
      .catch(() => { fs.ensureDir(`${this.client.clientBaseDir}events${sep}`).catch(err => this.client.emit("error", this.client.funcs.newError(err))); });
    if (userFiles) {
      await this.loadFiles(userFiles.filter(file => file.endsWith(".js")), this.client.clientBaseDir, this.loadNewEvent, this.loadEvents)
        .catch((err) => { throw err; });
    }
    return this.client.eventHandlers.size;
  }

  loadNewEvent(file, dir) {
    const eventName = file.split(".")[0];
    this.client.eventHandlers.set(eventName, (...args) => require(`${dir}events${sep}${file}`).run(this.client, ...args));
    this.client.on(eventName, this.client.eventHandlers.get(eventName));
    delete require.cache[require.resolve(`${dir}events${sep}${file}`)];
  }

  async reloadEvent(name) {
    const file = name.endsWith(".js") ? name : `${name}.js`;
    if (name.endsWith(".js")) name = name.slice(0, -3);
    const files = await fs.readdir(`${this.client.clientBaseDir}events${sep}`);
    if (!files.includes(file)) throw `Could not find a reloadable file named ${file}`;
    const listener = this.client.eventHandlers.get(name);
    if (listener) this.client.removeListener(name, listener);
    await this.loadFiles([file], this.client.clientBaseDir, this.loadNewEvent, this.reloadEvent)
      .catch((err) => { throw err; });
    return `Successfully reloaded the event ${name}.`;
  }

  async loadMessageMonitors() {
    this.client.messageMonitors.clear();
    const coreFiles = await fs.readdir(`${this.client.coreBaseDir}monitors${sep}`)
      .catch(() => { fs.ensureDir(`${this.client.coreBaseDir}monitors${sep}`).catch(err => this.client.emit("error", this.client.funcs.newError(err))); });
    if (coreFiles) {
      await this.loadFiles(coreFiles.filter(file => file.endsWith(".js")
        && (coreProtected.monitors.includes(file.split(".")[0]) || !this.client.config.disabled.monitors.includes(file.split(".")[0])))
        , this.client.coreBaseDir, this.loadNewMessageMonitor, this.loadMessageMonitors)
        .catch((err) => { throw err; });
    }
    const userFiles = await fs.readdir(`${this.client.clientBaseDir}monitors${sep}`)
      .catch(() => { fs.ensureDir(`${this.client.clientBaseDir}monitors${sep}`).catch(err => this.client.emit("error", this.client.funcs.newError(err))); });
    if (userFiles) {
      await this.loadFiles(userFiles.filter(file => file.endsWith(".js")), this.client.clientBaseDir, this.loadNewMessageMonitor, this.loadMessageMonitors)
        .catch((err) => { throw err; });
    }
    return this.client.messageMonitors.size;
  }

  loadNewMessageMonitor(file, dir) {
    this.client.messageMonitors.set(file.split(".")[0], require(`${dir}monitors${sep}${file}`));
    delete require.cache[require.resolve(`${dir}monitors${sep}${file}`)];
  }

  async reloadMessageMonitor(name) {
    const file = name.endsWith(".js") ? name : `${name}.js`;
    if (name.endsWith(".js")) name = name.slice(0, -3);
    const files = await fs.readdir(`${this.client.clientBaseDir}monitors${sep}`);
    if (!files.includes(file)) throw `Could not find a reloadable file named ${file}`;
    await this.loadFiles([file], this.client.clientBaseDir, this.loadNewMessageMonitor, this.reloadMessageMonitor)
      .catch((err) => { throw err; });
    if (this.client.messageMonitors.get(name).init) this.client.messageMonitors.get(name).init(this.client);
    return `Successfully reloaded the monitor ${name}.`;
  }

  async loadProviders() {
    this.client.providers.clear();
    const coreFiles = await fs.readdir(`${this.client.coreBaseDir}providers${sep}`)
      .catch(() => { fs.ensureDir(`${this.client.coreBaseDir}providers${sep}`).catch(err => this.client.emit("error", this.client.funcs.newError(err))); });
    if (coreFiles) {
      await this.loadFiles(coreFiles.filter(file => file.endsWith(".js")
        && (coreProtected.providers.includes(file.split(".")[0]) || !this.client.config.disabled.providers.includes(file.split(".")[0])))
        , this.client.coreBaseDir, this.loadNewProvider, this.loadProviders)
        .catch((err) => { throw err; });
    }
    const userFiles = await fs.readdir(`${this.client.clientBaseDir}providers${sep}`)
      .catch(() => { fs.ensureDir(`${this.client.clientBaseDir}providers${sep}`).catch(err => this.client.emit("error", this.client.funcs.newError(err))); });
    if (userFiles) {
      await this.loadFiles(userFiles.filter(file => file.endsWith(".js")), this.client.clientBaseDir, this.loadNewProvider, this.loadProviders)
        .catch((err) => { throw err; });
    }
    return this.client.providers.size;
  }

  loadNewProvider(file, dir) {
    this.client.providers.set(file.split(".")[0], require(`${dir}providers${sep}${file}`));
    delete require.cache[require.resolve(`${dir}providers${sep}${file}`)];
  }

  async reloadProvider(name) {
    const file = name.endsWith(".js") ? name : `${name}.js`;
    if (name.endsWith(".js")) name = name.slice(0, -3);
    const files = await fs.readdir(`${this.client.clientBaseDir}providers${sep}`);
    if (!files.includes(file)) throw `Could not find a reloadable file named ${file}`;
    await this.loadFiles([file], this.client.clientBaseDir, this.loadNewProvider, this.reloadProvider)
      .catch((err) => { throw err; });
    if (this.client.providers.get(name).init) this.client.providers.get(name).init(this.client);
    return `Successfully reloaded the provider ${name}.`;
  }

  async loadExtendables() {
    const coreFiles = await fs.readdir(`${this.client.coreBaseDir}extendables${sep}`)
      .catch(() => { fs.ensureDir(`${this.client.coreBaseDir}extendables${sep}`).catch(err => this.client.emit("error", this.client.funcs.newError(err))); });
    if (coreFiles) {
      await this.loadFiles(coreFiles.filter(file => file.endsWith(".js")
        && (coreProtected.extendables.includes(file.split(".")[0]) || !this.client.config.disabled.extendables.includes(file.split(".")[0])))
        , this.client.coreBaseDir, this.loadNewExtendable, this.loadExtendables)
        .catch((err) => { throw err; });
    }
    const userFiles = await fs.readdir(`${this.client.clientBaseDir}extendables${sep}`)
      .catch(() => { fs.ensureDir(`${this.client.clientBaseDir}extendables${sep}`).catch(err => this.client.emit("error", this.client.funcs.newError(err))); });
    if (userFiles) {
      await this.loadFiles(userFiles.filter(file => file.endsWith(".js")), this.client.clientBaseDir, this.loadNewExtendable, this.loadExtendables)
        .catch((err) => { throw err; });
    }
    return (coreFiles ? coreFiles.length : 0) + (userFiles ? userFiles.length : 0);
  }

  loadNewExtendable(file, dir) {
    const extendable = require(`${dir}extendables${sep}${file}`);
    let myExtend;
    switch (extendable.conf.type.toLowerCase()) {
      case "set":
      case "setter":
        myExtend = { set: extendable.extend };
        break;
      case "get":
      case "getter":
        myExtend = { get: extendable.extend };
        break;
      case "method":
      default:
        myExtend = { value: extendable.extend };
        break;
    }
    extendable.conf.appliesTo.forEach((structure) => {
      Object.defineProperty(Discord[structure].prototype, extendable.conf.method, myExtend);
    });
    delete require.cache[require.resolve(`${dir}extendables${sep}${file}`)];
  }


  async loadFiles(files, dir, loadNew, startOver) {
    try {
      files.forEach(file => loadNew.call(this, file, dir));
    } catch (error) {
      if (error.code === "MODULE_NOT_FOUND") {
        const missingModule = /'([^']+)'/g.exec(error.toString());
        if (/\/|\\/.test(missingModule)) throw `\`\`\`${error.stack || error}\`\`\``;
        await this.installNPM(missingModule[1]).catch((err) => {
          console.error(err);
          process.exit();
        });
        startOver.call(this, files[0]);
      } else {
        throw `\`\`\`${error.stack || error}\`\`\``;
      }
    }
  }

  async installNPM(missingModule) {
    console.log(`Installing: ${missingModule}`);
    const { stdout, stderr } = await exec(`npm i ${missingModule}`).catch((err) => {
      console.error("=====NEW DEPENDANCY INSTALL FAILED HORRIBLY=====");
      throw err;
    });

    console.log("=====INSTALLED NEW DEPENDANCY=====");
    console.log(stdout);
    console.error(stderr);
  }

};
