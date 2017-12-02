const fs = require("fs-nextra");
const { sep, resolve, join } = require("path");
const Discord = require("discord.js");
const ParsedUsage = require("./parsedUsage");
const { performance: { now } } = require("perf_hooks");

class Loader {

  constructor(client) {
    Object.defineProperty(this, "client", { value: client });
    const makeDirsObject = dir => ({
      functions: resolve(dir, "functions"),
      commands: resolve(dir, "commands"),
      inhibitors: resolve(dir, "inhibitors"),
      finalizers: resolve(dir, "finalizers"),
      events: resolve(dir, "events"),
      monitors: resolve(dir, "monitors"),
      providers: resolve(dir, "providers"),
      extendables: resolve(dir, "extendables"),
    });

    /**
     * An object containing string paths to piece folders for the core of Komada
     * @type {Object}
     */
    Object.defineProperty(this, "coreDirs", { value: makeDirsObject(this.client.coreBaseDir) });

    /**
     * An object containing string paths to piece folders for the user side of Komada
     * @type {Object}
     */
    Object.defineProperty(this, "clientDirs", { value: makeDirsObject(this.client.clientBaseDir) });
  }

  async loadAll() {
    await Promise.all([
      this._loadEvents(),
      this._loadFunctions(),
      this._loadCommands(),
      this._loadInhibitors(),
      this._loadFinalizers(),
      this._loadMonitors(),
      this._loadProviders(),
      this._loadExtendables(),
    ]).catch((error) => {
      console.error(error);
      process.exit();
    });
  }

  async _traverse(dir, fileArray = []) {
    try {
      const res = await fs.readdir(dir);
      const files = res.filter(thing => thing.endsWith(".js"));
      const dirs = res.filter(thing => !thing.includes("."));
      if (files) files.forEach(file => fileArray.push([dir, file]));
      if (dirs) await Promise.all(dirs.map(dir2 => this._traverse(resolve(dir, dir2), fileArray)));
      return fileArray;
    } catch (err) {
      await fs.ensureDir(dir).catch(console.error);
      return null;
    }
  }

  /** FUNCTIONS */

  async _loadFunctions() {
    const [coreFiles, userFiles] = await Promise.all([
      this._traverse(this.coreDirs.functions),
      this._traverse(this.clientDirs.functions),
    ]);
    if (coreFiles) {
      coreFiles.forEach(this._loadFunction.bind(this));
    }
    if (userFiles) {
      userFiles.forEach(this._loadFunction.bind(this));
    }
    this.client.emit("log", `Loaded ${this._size} functions.`);
  }

  _loadFunction([dir, file]) {
    this[file.split(".")[0]] = this.constructor._require(join(dir, file));
  }

  /** EVENTS */

  async _loadEvents() {
    this.client.eventHandlers.forEach((listener, event) => this.client.removeListener(event, listener));
    const [coreFiles, userFiles] = await Promise.all([
      this._traverse(this.coreDirs.events),
      this._traverse(this.clientDirs.events),
    ]);
    if (coreFiles) coreFiles.forEach(this._loadEvent.bind(this));
    if (userFiles) userFiles.forEach(this._loadEvent.bind(this));
    this.client.emit("log", `Loaded ${this.client.eventHandlers.size} events.`);
  }

  _loadEvent([dir, file]) {
    const name = file.split(".")[0];
    this.client.eventHandlers.set(name, (...args) => this.constructor._require(join(dir, file)).run(this.client, ...args));
    this.client.on(name, this.client.eventHandlers.get(name));
  }

  /** COMMANDS */
  async _loadCommands() {
    this.client.commands.clear();
    this.client.aliases.clear();
    const [coreFiles, userFiles] = await Promise.all([
      this._traverse(this.coreDirs.commands),
      this._traverse(this.clientDirs.commands),
    ]);
    if (coreFiles) coreFiles.forEach(this._loadCommand.bind(this));
    if (userFiles) userFiles.forEach(this._loadCommand.bind(this));
    this.client.emit("log", `Loaded ${this.client.commands.size} commands with ${this.client.aliases.size} aliases.`);
  }

  _loadCommand([dir, file]) {
    const command = this.constructor._require(join(dir, file));
    const dirArray = dir.split(sep);
    const fullCat = dirArray.splice(dirArray.indexOf("commands") + 1);
    command.help.fullCategory = fullCat.slice();
    const subcat = fullCat.splice(fullCat.length - 1)[0];
    const cat = fullCat.join("/");
    command.help.category = subcat && !cat ? subcat || "General" : cat || "General";
    command.help.subCategory = subcat || "General";
    command.cooldown = new Map();
    this.client.commands.set(command.help.name, command);
    command.conf.aliases = command.conf.aliases || [];
    command.conf.aliases.forEach(alias => this.client.aliases.set(alias, command.help.name));
    command.usage = new ParsedUsage(this.client, command);
  }

  /** INHIBITORS */

  async _loadInhibitors() {
    this.client.commandInhibitors.clear();
    const [coreFiles, userFiles] = await Promise.all([
      this._traverse(this.coreDirs.inhibitors),
      this._traverse(this.clientDirs.inhibitors),
    ]);
    if (coreFiles) coreFiles.forEach(this._loadInhibitor.bind(this));
    if (userFiles) userFiles.forEach(this._loadInhibitor.bind(this));
    this.client.emit("log", `Loaded ${this.client.commandInhibitors.size} inhibitors.`);
  }

  _loadInhibitor([dir, file]) {
    this.client.commandInhibitors.set(file.split(".")[0], this.constructor._require(join(dir, file)));
  }

  /** FINALIZERS */
  async _loadFinalizers() {
    this.client.commandFinalizers.clear();
    const [coreFiles, userFiles] = await Promise.all([
      this._traverse(this.coreDirs.finalizers),
      this._traverse(this.clientDirs.finalizers),
    ]);
    if (coreFiles) coreFiles.forEach(this._loadFinalizer.bind(this));
    if (userFiles) userFiles.forEach(this._loadFinalizer.bind(this));
    this.client.emit("log", `Loaded ${this.client.commandFinalizers.size} finalizers.`);
  }

  _loadFinalizer([dir, file]) {
    this.client.commandFinalizers.set(file.split(".")[0], this.constructor._require(join(dir, file)));
  }

  /** MONITORS */
  async _loadMonitors() {
    this.client.messageMonitors.clear();
    const [coreFiles, userFiles] = await Promise.all([
      this._traverse(this.coreDirs.monitors),
      this._traverse(this.clientDirs.monitors),
    ]);
    if (coreFiles) coreFiles.forEach(this._loadMonitor.bind(this));
    if (userFiles) userFiles.forEach(this._loadMonitor.bind(this));
    this.client.emit("log", `Loaded ${this.client.messageMonitors.size} monitors.`);
  }

  _loadMonitor([dir, file]) {
    this.client.messageMonitors.set(file.split(".")[0], this.constructor._require(join(dir, file)));
  }

  /** PROVIDERS */
  async _loadProviders() {
    this.client.providers.clear();
    const [coreFiles, userFiles] = await Promise.all([
      this._traverse(this.coreDirs.providers),
      this._traverse(this.clientDirs.providers),
    ]);
    if (coreFiles) coreFiles.forEach(this._loadProvider.bind(this));
    if (userFiles) userFiles.forEach(this._loadProvider.bind(this));
    this.client.emit("log", `Loaded ${this.client.providers.size} monitors.`);
  }

  _loadProvider([dir, file]) {
    this.client.providers.set(file.split(".")[0], this.constructor._require(join(dir, file)));
  }

  /** EXTENDABLES */
  async _loadExtendables() {
    const [coreFiles, userFiles] = await Promise.all([
      this._traverse(this.coreDirs.extendables),
      this._traverse(this.clientDirs.extendables),
    ]);
    if (coreFiles) coreFiles.forEach(this._loadExtendable.bind(this));
    if (userFiles) userFiles.forEach(this._loadExtendable.bind(this));
    this.client.emit("log", `Loaded ${(coreFiles ? coreFiles.length : 0) + (userFiles ? userFiles.length : 0)} extendables.`);
  }

  _loadExtendable([dir, file]) {
    const extendable = this.constructor._require(join(dir, file));
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
      Object.defineProperty(!extendable.conf.komada ? Discord[structure].prototype : require("komada")[structure].prototype, extendable.conf.method, myExtend);  // eslint-disable-line
    });
  }

  static _require(path) {
    try {
      const module = require(path); // eslint-disable-line
      return module;
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      delete require.cache[path];
    }
  }


}

module.exports = Loader;
