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
/**
 * The loader class that handles loading all of the pieces into Komada.
 * @private
 */
class Loader {

/**
 * Constructs the class so that pieces can be loaded.
 * @param {KomadaClient} client The komada client
 */
  constructor(client) {
    /**
     * The komada client
     * @type {KomadaClient}
     */
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
    this.coreDirs = makeDirsObject(this.client.coreBaseDir);

    /**
     * An object containing string paths to piece folders for the user side of Komada
     * @type {Object}
     */
    this.clientDirs = makeDirsObject(this.client.clientBaseDir);
  }

  /**
   * Loads all of the pieces into Komada
   */
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

  /**
   * Loads all of functions from both the core and client directories
   * @return {Promise<number>} The number of functions loaded into Komada
   */
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

  /**
   * Loads a new function into Komada
   * @param {string} file The file we're loading into komada.
   * @param {string} dir The directory from which we're loading the functions from
   */
  loadNewFunction(file, dir) {
    this[file.split(".")[0]] = require(join(dir, file));
  }

  /**
   * Reloads a function
   * @param {string}  name A string representing the function name
   * @return {Promise<string>}
   */
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

  /**
   * Loads all commands into Komada
   * @return {Promise<Array>} An array containing the number of commands and aliases loading into Komada
   */
  async loadCommands() {
    this.client.commands.clear();
    this.client.aliases.clear();
    await this.walkCommandDirectories(this.coreDirs.commands)
      .catch((err) => { throw err; });
    await this.walkCommandDirectories(this.clientDirs.commands)
      .catch((err) => { throw err; });
    return [this.client.commands.size, this.client.aliases.size];
  }

  /**
   * Walks the command directories
   * @param {string}  dir The directory we are walking for commands.
   * @return {Promise}
   */
  async walkCommandDirectories(dir) {
    const files = await fs.readdir(dir)
      .catch(() => { fs.ensureDir(dir).catch(err => this.client.emit("error", err)); });
    if (!files) return false;
    await this.loadFiles(files.filter(file => file.endsWith(".js")
      && (coreProtected.commands.includes(file.split(".")[0]) || !this.client.config.disabled.commands.includes(file.split(".")[0])))
      .map(file => [file])
      , dir, this.loadNewCommand, this.loadCommands)
      .catch((err) => { throw err; });
    const subfolders = [];
    const mps1 = files.filter(file => !file.includes(".")).map(async (folder) => {
      const subFiles = await fs.readdir(resolve(dir, folder));
      if (!subFiles) return true;
      subFiles.filter(file => !file.includes(".")).forEach(subfolder => subfolders.push({ folder, subfolder }));
      return this.loadFiles(subFiles.filter(file => file.endsWith(".js")
        && (coreProtected.commands.includes(file.split(".")[0]) || !this.client.config.disabled.commands.includes(file.split(".")[0])))
        .map(file => [folder, file]), dir, this.loadNewCommand, this.loadCommands)
        .catch((err) => { throw err; });
    });
    await Promise.all(mps1).catch((err) => { throw err; });
    const mps2 = subfolders.map(async (subfolder) => {
      const subSubFiles = await fs.readdir(resolve(dir, subfolder.folder, subfolder.subfolder));
      if (!subSubFiles) return true;
      return this.loadFiles(subSubFiles.filter(file => file.endsWith(".js")
        && (coreProtected.commands.includes(file.split(".")[0]) || !this.client.config.disabled.commands.includes(file.split(".")[0])))
        .map(file => [subfolder.folder, subfolder.subfolder, file]), dir, this.loadNewCommand, this.loadCommands)
        .catch((err) => { throw err; });
    });
    return Promise.all(mps2).catch((err) => { throw err; });
  }

  /**
   * Loads a new command
   * @param {Array} file An array of file information for the command we're loading.
   * @param {string} dir The directory we're loading this new command from.
   */
  loadNewCommand(file, dir) {
    const cmd = require(join(dir, ...file));
    cmd.help.fullCategory = file.slice(0, -1);
    cmd.help.subCategory = cmd.help.fullCategory[1] || "General";
    cmd.help.category = cmd.help.fullCategory[0] || "General";
    cmd.cooldown = new Map();
    this.client.commands.set(cmd.help.name, cmd);
    cmd.conf.aliases = cmd.conf.aliases || [];
    cmd.conf.aliases.forEach(alias => this.client.aliases.set(alias, cmd.help.name));
    cmd.usage = new ParsedUsage(this.client, cmd);
  }

  /**
   * Reloads the given command name.
   * @param {string}  name The name of the command we are reloading
   * @return {Promise<string>}
   */
  async reloadCommand(name) {
    if (name.endsWith(".js")) name = name.slice(0, -3);
    name = join(...name.split("/"));
    const fullCommand = this.client.commands.get(name) || this.client.commands.get(this.client.aliases.get(name));
    const dir = this.clientDirs.commands;
    const file = fullCommand ? [...fullCommand.help.fullCategory, `${fullCommand.help.name}.js`] : `${name}.js`.split(sep);
    const fileToCheck = file[file.length - 1];
    const dirToCheck = resolve(dir, ...file.slice(0, -1));
    const files = await fs.readdir(dirToCheck).catch(() => { throw "A user directory path could not be found. Only user commands may be reloaded."; });
    if (!files.includes(fileToCheck)) throw `Could not find a reloadable file named ${file.join(sep)}`;
    this.client.aliases.forEach((cmd, alias) => {
      if (cmd === name) this.client.aliases.delete(alias);
    });
    await this.loadFiles([file], dir, this.loadNewCommand, this.reloadCommand)
      .catch((err) => { throw err; });
    const newCommand = this.client.commands.get(fileToCheck.slice(0, -3));
    if (newCommand.init) newCommand.init(this.client);
    return `Successfully reloaded the command ${name}.`;
  }

  /**
   * Loads command inhibitors into Komada
   * @return {Promise<number>} The number of inhibitors loaded.
   */
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

  /**
   * Loads a new inhibitor
   * @param {string} file The file we are loading
   * @param {string} dir The location from where we are loading
   */
  loadNewInhibitor(file, dir) {
    this.client.commandInhibitors.set(file.split(".")[0], require(join(dir, file)));
  }

  /**
   * Reloads an inhibitor
   * @param {string}  name The inhibitor we are reloading.
   * @return {Promise<string>}
   */
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

  /**
   * Loads command finalizes into Komada
   * @return {Promise<number>} The number of finalizers loaded
   */
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

  /**
   * Loads new finalizers
   * @param {string} file The file we are loading
   * @param {string} dir  The dir we are loading from
   */
  loadNewFinalizer(file, dir) {
    this.client.commandFinalizers.set(file.split(".")[0], require(join(dir, file)));
  }

  /**
   * Reloads a finalizer
   * @param {string}  name The name of the finalize we are reloading
   * @return {Promise<string>}
   */
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

  /**
   * Loads events into Komada
   * @return {Promise<number>} The number of events loaded.
   */
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

  /**
   * Loads a new event into Komada
   * @param {string} file The file we are loading
   * @param {string} dir The directory we are loading from
   */
  loadNewEvent(file, dir) {
    const eventName = file.split(".")[0];
    this.client.eventHandlers.set(eventName, (...args) => require(join(dir, file)).run(this.client, ...args));
    this.client.on(eventName, this.client.eventHandlers.get(eventName));
  }

  /**
   * Reloads a new event
   * @param {string}  name The nme of the event we are reloading
   * @return {Promise<string>}
   */
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

  /**
   * The message monitors beling loaded into Komada
   * @return {Promise<number>} The number of monitors loaded into Komada
   */
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

  /**
   * Loads a new monitor into Komada
   * @param {string} file The file we are loading
   * @param {string} dir The directory we are loading from
   */
  loadNewMessageMonitor(file, dir) {
    this.client.messageMonitors.set(file.split(".")[0], require(join(dir, file)));
  }

  /**
   * Reloads a Message monitor
   * @param {string}  name The name of the monitor we are reloading
   * @return {Promise<string>}
   */
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

  /**
   * Loads providers into Komada
   * @return {Promise<number>} The number of providers loaded into Komada
   */
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

  /**
   * Loads a new provider into Komada
   * @param {string} file The file we are loading
   * @param {stirng} dir The directory we are loading from.
   */
  loadNewProvider(file, dir) {
    this.client.providers.set(file.split(".")[0], require(join(dir, file)));
  }

  /**
   * Reloads a provider
   * @param {string}  name The name of the provider we are reloading
   * @return {Promise<string>}
   */
  async reloadProvider(name) {
    const file = name.endsWith(".js") ? name : `${name}.js`;
    if (name.endsWith(".js")) name = name.slice(0, -3);
    const provider = this.client.providers.get(name);
    if (provider && provider.shutdown) await provider.shutdown();
    const files = await fs.readdir(this.clientDirs.providers);
    if (!files.includes(file)) throw `Could not find a reloadable file named ${file}`;
    await this.loadFiles([file], this.clientDirs.providers, this.loadNewProvider, this.reloadProvider)
      .catch((err) => { throw err; });
    if (this.client.providers.get(name).init) this.client.providers.get(name).init(this.client);
    return `Successfully reloaded the provider ${name}.`;
  }

  /**
   * Loads an extendble into Komada
   * @return {Promise<number>} The number of extendables loaded into Komada
   */
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

  /**
   * Loads a new extendable into Komada
   * @param {string} file The file we are loading
   * @param {string} dir The directory we are loading from.
   */
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
      Object.defineProperty(!extendable.conf.komada ? Discord[structure].prototype : require("komada")[structure].prototype, extendable.conf.method, myExtend);  // eslint-disable-line
    });
  }


  /**
   * Loads an array of files into Komada
   * @param {Array}  files The files we are loading
   * @param {string}  dir The directory we are loading the files from
   * @param {Function}  loadNew The loadNew function
   * @param {Function}  startOver The loadAll function
   */
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
    } finally {
      files.forEach(file => delete require.cache[join(dir, ...file)]);
    }
  }

  /**
   * Installs an NPM module if it can't be found.
   * @param {string}  missingModule The name of the missing module
   */
  async installNPM(missingModule) {
    console.log(`Installing: ${missingModule}`);
    const { stdout, stderr } = await exec(`npm i ${missingModule}`, { cwd: this.client.clientBaseDir }).catch((err) => {
      console.error("=====NEW DEPENDANCY INSTALL FAILED HORRIBLY=====");
      throw err;
    });

    console.log("=====INSTALLED NEW DEPENDANCY=====");
    console.log(stdout);
    console.error(stderr);
  }

}

module.exports = Loader;
