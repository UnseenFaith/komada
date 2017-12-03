const fs = require("fs-nextra");
const { sep, resolve, join } = require("path");
const Discord = require("discord.js");
const ParsedUsage = require("./parsedUsage");

const disabled = {
  command: [],
  finalizer: [],
  inhibitor: [],
  monitor: [],
};

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

    Object.defineProperty(this, "_disabled", { value: null, writable: true });
  }

  async loadAll() {
    this._disabled = await fs.readJSON(resolve(this.client.clientBaseDir, "bwd", "disabled.json"))
      .catch(() => fs.outputJSONAtomic(resolve(this.client.clientBaseDir, "bwd", "disabled.json"), disabled)
        .then(() => disabled));
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
      throw err;
    }
  }

  /** FUNCTIONS */

  async _loadFunctions() {
    const [coreFiles, userFiles] = await Promise.all([
      this._traverse(this.coreDirs.functions),
      this._traverse(this.clientDirs.functions),
    ]);
    if (coreFiles) coreFiles.forEach(this._loadFunction.bind(this));
    if (userFiles) userFiles.forEach(this._loadFunction.bind(this));
    this.client.emit("log", `Loaded ${Object.keys(this).length} functions.`);
  }

  _loadFunction([dir, file]) {
    const func = this.constructor._require(join(dir, file));
    this[file.split(".")[0]] = func;
    return func;
  }

  async _reloadFunction(name) {
    const file = name.endsWith(".js") ? name : `${name}.js`;
    const files = await this._traverse(this.clientDirs.functions);
    const func = files.filter(([, f]) => f === file)[0];
    if (func.length === 0) throw `Could not find a reloadable file named ${file.slice(0, -3)}`;
    if (this[file.slice(-3)]) delete this[file.slice(0, -3)];
    const fun = this._loadFunction(func);
    if (fun.init) fun.init(this.client);
    return `Successfully reloaded the function ${file.slice(0, -3)}.`;
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

  async _reloadEvent(name) {
    const file = name.endsWith(".js") ? name : `${name}.js`;
    const files = await this._traverse(this.clientDirs.events);
    const evt = files.filter(([, f]) => f === file)[0];
    if (evt.length === 0) throw `Could not find a reloadable file named ${file.slice(0, -3)}`;
    const listener = this.client.eventHandlers.get(file.slice(0, -3));
    if (listener) this.client.removeListener(name, listener);
    this._loadFunction(evt);
    return `Successfully reloaded the event ${file.slice(0, -3)}.`;
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
    const subcat = fullCat.length <= 1 ? "General" : fullCat.splice(-1)[0];
    const cat = fullCat.join("/");
    command.help.category = cat || "General";
    command.help.subCategory = subcat || "General";
    command.cooldown = new Map();
    this.client.commands.set(command.help.name, command);
    command.conf.aliases = command.conf.aliases || [];
    command.conf.aliases.forEach(alias => this.client.aliases.set(alias, command.help.name));
    command.usage = new ParsedUsage(this.client, command);
    command.conf.enabled = this._disabled.command.includes(command.help.name) ? false : command.conf.enabled;
    return command;
  }

  async _reloadCommand(name) {
    const file = name.endsWith(".js") ? name : `${name}.js`;
    const fullCommand = this.client.commands.get(file.slice(0, -3)) || this.client.commands.get(this.client.aliases.get(file.slice(0, -3)));
    const dirToCheck = fullCommand ? resolve(this.clientDirs.commands, ...fullCommand.help.fullCategory) : resolve(this.clientDirs.commands);
    const files = await this._traverse(dirToCheck);
    const cmd = files.filter(([, f]) => f === file)[0];
    if (cmd.length === 0) throw `Could not find a reloadable file named ${file.slice(0, 3)}`;
    fullCommand.conf.aliases.forEach(alias => this.client.aliases.delete(alias));
    const command = this._loadFunction(cmd);
    if (command.init) command.init(this.client);
    return `Successfully reloaded the command ${file.slice(0, 3)}.`;
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
    const inhib = this.constructor._require(join(dir, file));
    inhib.conf.enabled = this._disabled.inhibitor.includes(file.split(".")[0]) ? false : inhib.conf.enabled;
    this.client.commandInhibitors.set(file.split(".")[0], inhib);
    return inhib;
  }

  async _reloadInhibitor(name) {
    const file = name.endsWith(".js") ? name : `${name}.js`;
    const files = await this._traverse(this.clientDirs.inhibitors);
    const inhibitor = files.filter(([, f]) => f === file)[0];
    if (inhibitor.length === 0) throw `Could not find a reloadable file named ${file.slice(0, -3)}`;
    const inhibit = this.client.commandInhibitors.get(file.slice(0, -3));
    if (inhibit) this.client.commandInhibitors.delete(file.slice(0, -3));
    const inhib = this._loadInhibitor(inhibitor);
    if (inhib.init) inhib.init(this.client);
    return `Successfully reloaded the inhibitor ${file.slice(0, -3)}.`;
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
    const final = this.constructor._require(join(dir, file));
    final.conf.enabled = this._disabled.finalizer.includes(file.split(".")[0]) ? false : final.conf.enabled;
    this.client.commandFinalizers.set(file.split(".")[0], final);
    return final;
  }

  async _reloadFinalizer(name) {
    const file = name.endsWith(".js") ? name : `${name}.js`;
    const files = await this._traverse(this.clientDirs.finalizers);
    const final = files.filter(([, f]) => f === file)[0];
    if (final.length === 0) throw `Could not find a reloadable file named ${file.slice(0, 3)}`;
    const finale = this.client.commandFinalizers.get(file.slice(0, -3));
    if (finale) this.client.commandFinalizers.delete(file.slice(0, -3));
    const finalizer = this._loadFinalizer(final);
    if (finalizer.init) finalizer.init(this.client);
    return `Successfully reloaded the finalizer ${file.slice(0, -3)}.`;
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
    const monit = this.constructor._require(join(dir, file));
    monit.conf.enabled = this._disabled.monitor.includes(file.split(".")[0]) ? false : monit.conf.enabled;
    this.client.messageMonitors.set(file.split(".")[0], monit);
    return monit;
  }

  async _reloadMonitor(name) {
    const file = name.endsWith(".js") ? name : `${name}.js`;
    const files = await this._traverse(this.clientDirs.monitors);
    const mon = files.filter(([, f]) => f === file)[0];
    if (mon.length === 0) throw `Could not find a reloadable file named ${file.slice(0, 3)}`;
    const monit = this.client.messageMonitors.get(file.slice(0, -3));
    if (monit) this.client.messageMonitors.delete(file.slice(0, -3));
    const monitor = this._loadMonitor(mon);
    if (monitor.init) monitor.init(this.client);
    return `Successfully reloaded the monitor ${file.slice(0, -3)}.`;
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
    this.client.emit("log", `Loaded ${this.client.providers.size} providers.`);
  }

  _loadProvider([dir, file]) {
    const provider = this.constructor._require(join(dir, file));
    this.client.providers.set(file.split(".")[0], provider);
    return provider;
  }

  async _reloadProvider(name) {
    const file = name.endsWith(".js") ? name : `${name}.js`;
    const files = await this._traverse(this.clientDirs.inhibitors);
    const pro = files.filter(([, f]) => f === file)[0];
    if (pro.length === 0) throw `Could not find a reloadable file named ${file.slice(0, 3)}`;
    const provide = this.client.providers.get(file.slice(0, -3));
    if (provide) this.client.providers.delete(file.slice(0, -3));
    const provider = this._loadProvider(pro);
    if (provider.init) provider.init(this.client);
    return `Successfully reloaded the provider ${file.slice(0, -3)}.`;
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
