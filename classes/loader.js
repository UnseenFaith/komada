const fs = require("fs-nextra");
const { promisify } = require("util");
const exec = promisify(require("child_process").exec);
const { sep, resolve, join } = require("path");
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
    this.coreDirs = {
      functions: resolve(this.client.coreBaseDir, "functions"),
      commands: resolve(this.client.coreBaseDir, "commands"),
      inhibitors: resolve(this.client.coreBaseDir, "inhibitors"),
      finalizers: resolve(this.client.coreBaseDir, "finalizers"),
      events: resolve(this.client.coreBaseDir, "events"),
      monitors: resolve(this.client.coreBaseDir, "monitors"),
      providers: resolve(this.client.coreBaseDir, "providers"),
      extendables: resolve(this.client.coreBaseDir, "extendables"),
    };
    this.clientDirs = {
      functions: resolve(this.client.clientBaseDir, "functions"),
      commands: resolve(this.client.clientBaseDir, "commands"),
      inhibitors: resolve(this.client.clientBaseDir, "inhibitors"),
      finalizers: resolve(this.client.clientBaseDir, "finalizers"),
      events: resolve(this.client.clientBaseDir, "events"),
      monitors: resolve(this.client.clientBaseDir, "monitors"),
      providers: resolve(this.client.clientBaseDir, "providers"),
      extendables: resolve(this.client.clientBaseDir, "extendables"),
    };
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
    const coreFiles = await fs.readdir(this.coreDirs.functions)
      .catch(() => { fs.ensureDir(this.coreDirs.functions).catch(err => this.client.emit("error", err)); });
    if (coreFiles) {
      await this.loadFiles(coreFiles.filter(file => file.endsWith(".js")
        && (coreProtected.functions.includes(file.split(".")[0]) || !this.client.config.disabled.functions.includes(file.split(".")[0])))
        , this.coreDirs.functions, this.loadNewFunction, this.loadFunctions)
        .catch((err) => { throw err; });
    }
    const userFiles = await fs.readdir(this.clientDirs.functions)
      .catch(() => { fs.ensureDir(this.clientDirs.functions).catch(err => this.client.emit("error", err)); });
    if (userFiles) {
      await this.loadFiles(userFiles.filter(file => file.endsWith(".js")), this.clientDirs.functions, this.loadNewFunction, this.loadFunctions)
        .catch((err) => { throw err; });
    }
    return (coreFiles ? coreFiles.length : 0) + (userFiles ? userFiles.length : 0);
  }

  loadNewFunction(file, dir) {
    this[file.split(".")[0]] = require(join(dir, file));
    delete require.cache[join(dir, file)];
  }

  async reloadFunction(name) {
    const file = name.endsWith(".js") ? name : `${name}.js`;
    if (name.endsWith(".js")) name = name.slice(0, -3);
    const files = await fs.readdir(this.clientDirs.functions);
    if (!files.includes(file)) throw `Could not find a reloadable file named ${file}`;
    if (this[name]) delete this[name];
    await this.loadFiles([file], this.clientDirs.functions, this.loadNewFunction, this.reloadFunction)
      .catch((err) => { throw err; });
    if (this.client.funcs[name].init) this.client.funcs[name].init(this.client);
    return `Successfully reloaded the function ${name}.`;
  }

  async loadCommands() {
    this.client.commands.clear();
    this.client.aliases.clear();
    await this.walkCommandDirectories(this.coreDirs.commands)
      .catch((err) => { throw err; });
    await this.walkCommandDirectories(this.clientDirs.commands)
      .catch((err) => { throw err; });
    return [this.client.commands.size, this.client.aliases.size];
  }

  async walkCommandDirectories(dir) {
    const files = await fs.readdir(dir)
      .catch(() => { fs.ensureDir(dir).catch(err => this.client.emit("error", err)); });
    if (!files) return false;
    await this.loadFiles(files.filter(file => file.endsWith(".js")
      && (coreProtected.commands.includes(file.split(".")[0]) || !this.client.config.disabled.commands.includes(file.split(".")[0])))
      , dir, this.loadNewCommand, this.loadCommands)
      .catch((err) => { throw err; });
    const subfolders = [];
    const mps1 = files.filter(file => !file.includes(".")).map(async (folder) => {
      const subFiles = await fs.readdir(resolve(dir, folder));
      if (!subFiles) return true;
      subFiles.filter(file => !file.includes(".")).forEach(subfolder => subfolders.push({ folder, subfolder }));
      return this.loadFiles(subFiles.filter(file => file.endsWith(".js")
        && (coreProtected.commands.includes(file.split(".")[0]) || !this.client.config.disabled.commands.includes(file.split(".")[0])))
        .map(file => join(folder, file)), dir, this.loadNewCommand, this.loadCommands)
        .catch((err) => { throw err; });
    });
    await Promise.all(mps1).catch((err) => { throw err; });
    const mps2 = subfolders.map(async (subfolder) => {
      const subSubFiles = await fs.readdir(resolve(dir, subfolder.folder, subfolder.subfolder));
      if (!subSubFiles) return true;
      return this.loadFiles(subSubFiles.filter(file => file.endsWith(".js")
        && (coreProtected.commands.includes(file.split(".")[0]) || !this.client.config.disabled.commands.includes(file.split(".")[0])))
        .map(file => join(subfolder.folder, subfolder.subfolder, file)), dir, this.loadNewCommand, this.loadCommands)
        .catch((err) => { throw err; });
    });
    return Promise.all(mps2).catch((err) => { throw err; });
  }

  loadNewCommand(file, dir) {
    const cmd = require(join(dir, file));
    cmd.help.fullCategory = file.split(sep).slice(0, -1);
    cmd.help.subCategory = cmd.help.fullCategory[1] || "General";
    cmd.help.category = cmd.help.fullCategory[0] || "General";
    cmd.cooldown = new Map();
    this.client.commands.set(cmd.help.name, cmd);
    cmd.conf.aliases = cmd.conf.aliases || [];
    cmd.conf.aliases.forEach(alias => this.client.aliases.set(alias, cmd.help.name));
    cmd.usage = new ParsedUsage(this.client, cmd);
    delete require.cache[join(dir, file)];
  }

  async reloadCommand(name) {
    if (name.endsWith(".js")) name = name.slice(0, -3);
    name = name.split("/").join(sep);
    const fullCommand = this.client.commands.get(name) || this.client.commands.get(this.client.aliases.get(name));
    const dir = this.clientDirs.commands;
    let file;
    let fileToCheck;
    let dirToCheck;
    if (fullCommand) {
      file = `${fullCommand.help.fullCategory.length !== 0 ? `${fullCommand.help.fullCategory.join(sep)}${sep}` : ""}${fullCommand.help.name}.js`;
      fileToCheck = file.split(sep)[file.split(sep).length - 1];
      dirToCheck = resolve(dir, fullCommand.help.fullCategory ? `${fullCommand.help.fullCategory.join(sep)}${sep}` : "");
    } else {
      file = `${name}.js`;
      fileToCheck = file.split(sep)[file.split(sep).length - 1];
      dirToCheck = resolve(dir, ...file.split(sep).slice(0, -1));
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
    const coreFiles = await fs.readdir(this.coreDirs.inhibitors)
      .catch(() => { fs.ensureDir(this.coreDirs.inhibitors).catch(err => this.client.emit("error", err)); });
    if (coreFiles) {
      await this.loadFiles(coreFiles.filter(file => file.endsWith(".js")
        && (coreProtected.inhibitors.includes(file.split(".")[0]) || !this.client.config.disabled.inhibitors.includes(file.split(".")[0])))
        , this.coreDirs.inhibitors, this.loadNewInhibitor, this.loadCommandInhibitors)
        .catch((err) => { throw err; });
    }
    const userFiles = await fs.readdir(this.clientDirs.inhibitors)
      .catch(() => { fs.ensureDir(this.clientDirs.inhibitors).catch(err => this.client.emit("error", err)); });
    if (userFiles) {
      await this.loadFiles(userFiles.filter(file => file.endsWith(".js")), this.clientDirs.inhibitors, this.loadNewInhibitor, this.loadCommandInhibitors)
        .catch((err) => { throw err; });
    }
    this.sortInhibitors();
    return this.client.commandInhibitors.size;
  }

  loadNewInhibitor(file, dir) {
    this.client.commandInhibitors.set(file.split(".")[0], require(join(dir, file)));
    delete require.cache[join(dir, file)];
  }

  async reloadInhibitor(name) {
    const file = name.endsWith(".js") ? name : `${name}.js`;
    if (name.endsWith(".js")) name = name.slice(0, -3);
    const files = await fs.readdir(this.clientDirs.inhibitors);
    if (!files.includes(file)) throw `Could not find a reloadable file named ${file}`;
    await this.loadFiles([file], this.clientDirs.inhibitors, this.loadNewInhibitor, this.reloadInhibitor)
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
    const coreFiles = await fs.readdir(this.coreDirs.finalizers)
      .catch(() => { fs.ensureDir(this.coreDirs.finalizers).catch(err => this.client.emit("error", err)); });
    if (coreFiles) {
      await this.loadFiles(coreFiles.filter(file => file.endsWith(".js")
        && (coreProtected.finalizers.includes(file.split(".")[0]) || !this.client.config.disabled.finalizers.includes(file.split(".")[0])))
        , this.coreDirs.finalizers, this.loadNewFinalizer, this.loadCommandFinalizers)
        .catch((err) => { throw err; });
    }
    const userFiles = await fs.readdir(this.clientDirs.finalizers)
      .catch(() => { fs.ensureDir(this.clientDirs.finalizers).catch(err => this.client.emit("error", err)); });
    if (userFiles) {
      await this.loadFiles(userFiles.filter(file => file.endsWith(".js")), this.clientDirs.finalizers, this.loadNewFinalizer, this.loadCommandFinalizers)
        .catch((err) => { throw err; });
    }
    return this.client.commandFinalizers.size;
  }

  loadNewFinalizer(file, dir) {
    this.client.commandFinalizers.set(file.split(".")[0], require(join(dir, file)));
    delete require.cache[join(dir, file)];
  }

  async reloadFinalizer(name) {
    const file = name.endsWith(".js") ? name : `${name}.js`;
    if (name.endsWith(".js")) name = name.slice(0, -3);
    const files = await fs.readdir(this.clientDirs.finalizers);
    if (!files.includes(file)) throw `Could not find a reloadable file named ${file}`;
    await this.loadFiles([file], this.clientDirs.finalizers, this.loadNewFinalizer, this.reloadFinalizer)
      .catch((err) => { throw err; });
    if (this.client.commandFinalizers.get(name).init) this.client.commandFinalizers.get(name).init(this.client);
    return `Successfully reloaded the finalizer ${name}.`;
  }

  async loadEvents() {
    this.client.eventHandlers.forEach((listener, event) => this.client.removeListener(event, listener));
    this.client.eventHandlers.clear();
    const coreFiles = await fs.readdir(this.coreDirs.events)
      .catch(() => { fs.ensureDir(this.coreDirs.events).catch(err => this.client.emit("error", err)); });
    if (coreFiles) {
      await this.loadFiles(coreFiles.filter(file => file.endsWith(".js")
        && (coreProtected.events.includes(file.split(".")[0]) || !this.client.config.disabled.events.includes(file.split(".")[0])))
        , this.coreDirs.events, this.loadNewEvent, this.loadEvents)
        .catch((err) => { throw err; });
    }
    const userFiles = await fs.readdir(this.clientDirs.events)
      .catch(() => { fs.ensureDir(this.clientDirs.events).catch(err => this.client.emit("error", err)); });
    if (userFiles) {
      await this.loadFiles(userFiles.filter(file => file.endsWith(".js")), this.clientDirs.events, this.loadNewEvent, this.loadEvents)
        .catch((err) => { throw err; });
    }
    return this.client.eventHandlers.size;
  }

  loadNewEvent(file, dir) {
    const eventName = file.split(".")[0];
    this.client.eventHandlers.set(eventName, (...args) => require(join(dir, file)).run(this.client, ...args));
    this.client.on(eventName, this.client.eventHandlers.get(eventName));
    delete require.cache[join(dir, file)];
  }

  async reloadEvent(name) {
    const file = name.endsWith(".js") ? name : `${name}.js`;
    if (name.endsWith(".js")) name = name.slice(0, -3);
    const files = await fs.readdir(this.clientDirs.events);
    if (!files.includes(file)) throw `Could not find a reloadable file named ${file}`;
    const listener = this.client.eventHandlers.get(name);
    if (listener) this.client.removeListener(name, listener);
    await this.loadFiles([file], this.clientDirs.events, this.loadNewEvent, this.reloadEvent)
      .catch((err) => { throw err; });
    return `Successfully reloaded the event ${name}.`;
  }

  async loadMessageMonitors() {
    this.client.messageMonitors.clear();
    const coreFiles = await fs.readdir(this.coreDirs.monitors)
      .catch(() => { fs.ensureDir(this.coreDirs.monitors).catch(err => this.client.emit("error", err)); });
    if (coreFiles) {
      await this.loadFiles(coreFiles.filter(file => file.endsWith(".js")
        && (coreProtected.monitors.includes(file.split(".")[0]) || !this.client.config.disabled.monitors.includes(file.split(".")[0])))
        , this.coreDirs.monitors, this.loadNewMessageMonitor, this.loadMessageMonitors)
        .catch((err) => { throw err; });
    }
    const userFiles = await fs.readdir(this.clientDirs.monitors)
      .catch(() => { fs.ensureDir(this.clientDirs.monitors).catch(err => this.client.emit("error", err)); });
    if (userFiles) {
      await this.loadFiles(userFiles.filter(file => file.endsWith(".js")), this.clientDirs.monitors, this.loadNewMessageMonitor, this.loadMessageMonitors)
        .catch((err) => { throw err; });
    }
    return this.client.messageMonitors.size;
  }

  loadNewMessageMonitor(file, dir) {
    this.client.messageMonitors.set(file.split(".")[0], require(join(dir, file)));
    delete require.cache[join(dir, file)];
  }

  async reloadMessageMonitor(name) {
    const file = name.endsWith(".js") ? name : `${name}.js`;
    if (name.endsWith(".js")) name = name.slice(0, -3);
    const files = await fs.readdir(this.clientDirs.monitors);
    if (!files.includes(file)) throw `Could not find a reloadable file named ${file}`;
    await this.loadFiles([file], this.clientDirs.monitors, this.loadNewMessageMonitor, this.reloadMessageMonitor)
      .catch((err) => { throw err; });
    if (this.client.messageMonitors.get(name).init) this.client.messageMonitors.get(name).init(this.client);
    return `Successfully reloaded the monitor ${name}.`;
  }

  async loadProviders() {
    this.client.providers.clear();
    const coreFiles = await fs.readdir(this.coreDirs.providers)
      .catch(() => { fs.ensureDir(this.coreDirs.providers).catch(err => this.client.emit("error", err)); });
    if (coreFiles) {
      await this.loadFiles(coreFiles.filter(file => file.endsWith(".js")
        && (coreProtected.providers.includes(file.split(".")[0]) || !this.client.config.disabled.providers.includes(file.split(".")[0])))
        , this.coreDirs.providers, this.loadNewProvider, this.loadProviders)
        .catch((err) => { throw err; });
    }
    const userFiles = await fs.readdir(this.clientDirs.providers)
      .catch(() => { fs.ensureDir(this.clientDirs.providers).catch(err => this.client.emit("error", err)); });
    if (userFiles) {
      await this.loadFiles(userFiles.filter(file => file.endsWith(".js")), this.clientDirs.providers, this.loadNewProvider, this.loadProviders)
        .catch((err) => { throw err; });
    }
    return this.client.providers.size;
  }

  loadNewProvider(file, dir) {
    this.client.providers.set(file.split(".")[0], require(join(dir, file)));
    delete require.cache[join(dir, file)];
  }

  async reloadProvider(name) {
    const file = name.endsWith(".js") ? name : `${name}.js`;
    if (name.endsWith(".js")) name = name.slice(0, -3);
    const files = await fs.readdir(this.clientDirs.providers);
    if (!files.includes(file)) throw `Could not find a reloadable file named ${file}`;
    await this.loadFiles([file], this.clientDirs.providers, this.loadNewProvider, this.reloadProvider)
      .catch((err) => { throw err; });
    if (this.client.providers.get(name).init) this.client.providers.get(name).init(this.client);
    return `Successfully reloaded the provider ${name}.`;
  }

  async loadExtendables() {
    const coreFiles = await fs.readdir(this.coreDirs.extendables)
      .catch(() => { fs.ensureDir(this.coreDirs.extendables).catch(err => this.client.emit("error", err)); });
    if (coreFiles) {
      await this.loadFiles(coreFiles.filter(file => file.endsWith(".js")
        && (coreProtected.extendables.includes(file.split(".")[0]) || !this.client.config.disabled.extendables.includes(file.split(".")[0])))
        , this.coreDirs.extendables, this.loadNewExtendable, this.loadExtendables)
        .catch((err) => { throw err; });
    }
    const userFiles = await fs.readdir(this.clientDirs.extendables)
      .catch(() => { fs.ensureDir(this.clientDirs.extendables).catch(err => this.client.emit("error", err)); });
    if (userFiles) {
      await this.loadFiles(userFiles.filter(file => file.endsWith(".js")), this.clientDirs.extendables, this.loadNewExtendable, this.loadExtendables)
        .catch((err) => { throw err; });
    }
    return (coreFiles ? coreFiles.length : 0) + (userFiles ? userFiles.length : 0);
  }

  loadNewExtendable(file, dir) {
    const extendable = require(join(dir, file));
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
    delete require.cache[join(dir, file)];
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
