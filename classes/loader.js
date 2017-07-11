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
    this.coreDirs = makeDirsObject(this.client.coreBaseDir);
    this.clientDirs = makeDirsObject(this.client.clientBaseDir);
    this.outDirs = makeDirsObject(this.client.outBaseDir);
  }

  async loadAll() {
    const [
      [funcs, funcLangs],
      [commands, aliases, cmdLangs],
      [inhibitors, inhibLangs],
      [finalizers, finalLangs],
      [events, eventLangs],
      [monitors, monLangs],
      [providers, provLangs],
      [extendables, extLangs],
    ] = await Promise.all([
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
    const countMsg = (langs) => {
      if (Object.keys(langs).length >= 2) {
        const str = langs.reduce(
          (acc, [lang, count]) => {
            acc = acc ? `${acc}, ` : "";
            return `${acc}${count} ${lang}`;
          },
          "",
        );
        return ` (${str})`;
      }
      return "";
    };
    this.client.emit("log", [
      `Loaded ${funcs} functions${countMsg(funcLangs)}.`,
      `Loaded ${commands} commands${countMsg(cmdLangs)}, with ${aliases} aliases.`,
      `Loaded ${inhibitors} command inhibitors${countMsg(inhibLangs)}.`,
      `Loaded ${finalizers} command finalizers${countMsg(finalLangs)}.`,
      `Loaded ${monitors} message monitors${countMsg(monLangs)}.`,
      `Loaded ${providers} providers${countMsg(provLangs)}.`,
      `Loaded ${events} events${countMsg(eventLangs)}.`,
      `Loaded ${extendables} extendables${countMsg(extLangs)}.`,
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
    const userFiles1 = await fs.readdir(this.clientDirs.functions)
      .catch(() => { fs.ensureDir(this.clientDirs.functions).catch(err => this.client.emit("error", err)); });
    if (userFiles1) {
      await this.loadFiles(userFiles1.filter(file => file.endsWith(".js")), this.clientDirs.functions, this.loadNewFunction, this.loadFunctions)
        .catch((err) => { throw err; });
    }
    const userFiles2 = await fs.readdir(this.outDirs.functions)
      .catch(() => { fs.ensureDir(this.outDirs.functions).catch(err => this.client.emit("error", err)); });
    if (userFiles2) {
      await this.loadFiles(userFiles2.filter(file => file.endsWith(".js")), this.outDirs.functions, this.loadNewFunction, this.loadFunctions)
        .catch((err) => { throw err; });
    }

    const langCountsObj = {};
    await Promise.all(Object.values(this.client.funcs).map(async (f) => {
      const lang = await f.codeLang;
      if (!lang) return;
      langCountsObj[lang] = langCountsObj[lang] || 0;
      langCountsObj[lang]++;
    }));
    const langCounts = Object.entries(langCountsObj).sort(this.sortLangs);
    return [(coreFiles ? coreFiles.length : 0) +
      (userFiles1 ? userFiles1.length : 0) +
      (userFiles2 ? userFiles2.length : 0), langCounts];
  }

  loadNewFunction(file, dir) {
    const path = join(dir, file);
    const fn = require(path);
    fn.codeLang = this.getFileLang(path); // returns a promise
    this[file.split(".")[0]] = fn;
    delete require.cache[path];
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
    await this.walkCommandDirectories(this.outDirs.commands)
      .catch((err) => { throw err; });

    const langCountsObj = {};
    await Promise.all(this.client.commands.map(async (c) => {
      const lang = await c.help.codeLang;
      if (!lang) return;
      langCountsObj[lang] = langCountsObj[lang] || 0;
      langCountsObj[lang]++;
    }));
    const langCounts = Object.entries(langCountsObj).sort(this.sortLangs);
    return [this.client.commands.size, this.client.aliases.size, langCounts];
  }

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

  loadNewCommand(file, dir) {
    const path = join(dir, ...file);
    const cmd = require(path);
    cmd.help.fullCategory = file.slice(0, -1);
    cmd.help.subCategory = cmd.help.fullCategory[1] || "General";
    cmd.help.category = cmd.help.fullCategory[0] || "General";
    cmd.help.codeLang = this.getFileLang(path); // returns a promise
    cmd.cooldown = new Map();
    this.client.commands.set(cmd.help.name, cmd);
    cmd.conf.aliases = cmd.conf.aliases || [];
    cmd.conf.aliases.forEach(alias => this.client.aliases.set(alias, cmd.help.name));
    cmd.usage = new ParsedUsage(this.client, cmd);
    delete require.cache[path];
  }

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
    const userFiles1 = await fs.readdir(this.clientDirs.inhibitors)
      .catch(() => { fs.ensureDir(this.clientDirs.inhibitors).catch(err => this.client.emit("error", err)); });
    if (userFiles1) {
      await this.loadFiles(userFiles1.filter(file => file.endsWith(".js")), this.clientDirs.inhibitors, this.loadNewInhibitor, this.loadCommandInhibitors)
        .catch((err) => { throw err; });
    }
    const userFiles2 = await fs.readdir(this.outDirs.inhibitors)
      .catch(() => { fs.ensureDir(this.outDirs.inhibitors).catch(err => this.client.emit("error", err)); });
    if (userFiles2) {
      await this.loadFiles(userFiles2.filter(file => file.endsWith(".js")), this.outDirs.inhibitors, this.loadNewInhibitor, this.loadCommandInhibitors)
        .catch((err) => { throw err; });
    }
    this.sortInhibitors();

    const langCountsObj = {};
    await Promise.all(this.client.commandInhibitors.map(async (i) => {
      const lang = await i.codeLang;
      if (!lang) return;
      langCountsObj[lang] = langCountsObj[lang] || 0;
      langCountsObj[lang]++;
    }));
    const langCounts = Object.entries(langCountsObj).sort(this.sortLangs);
    return [this.client.commandInhibitors.size, langCounts];
  }

  loadNewInhibitor(file, dir) {
    const path = join(dir, file);
    const inhib = require(path);
    inhib.codeLang = this.getFileLang(path); // returns a promise
    this.client.commandInhibitors.set(file.split(".")[0], inhib);
    delete require.cache[path];
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
    const userFiles1 = await fs.readdir(this.clientDirs.finalizers)
      .catch(() => { fs.ensureDir(this.clientDirs.finalizers).catch(err => this.client.emit("error", err)); });
    if (userFiles1) {
      await this.loadFiles(userFiles1.filter(file => file.endsWith(".js")), this.clientDirs.finalizers, this.loadNewFinalizer, this.loadCommandFinalizers)
        .catch((err) => { throw err; });
    }
    const userFiles2 = await fs.readdir(this.outDirs.finalizers)
      .catch(() => { fs.ensureDir(this.outDirs.finalizers).catch(err => this.client.emit("error", err)); });
    if (userFiles2) {
      await this.loadFiles(userFiles2.filter(file => file.endsWith(".js")), this.outDirs.finalizers, this.loadNewFinalizer, this.loadCommandFinalizers)
        .catch((err) => { throw err; });
    }

    const langCountsObj = {};
    await Promise.all(this.client.commandFinalizers.map(async (final) => {
      const lang = await final.codeLang;
      if (!lang) return;
      langCountsObj[lang] = langCountsObj[lang] || 0;
      langCountsObj[lang]++;
    }));
    const langCounts = Object.entries(langCountsObj).sort(this.sortLangs);
    return [this.client.commandFinalizers.size, langCounts];
  }

  loadNewFinalizer(file, dir) {
    const path = join(dir, file);
    const final = require(path);
    final.codeLang = this.getFileLang(path); // returns a promise
    this.client.commandFinalizers.set(file.split(".")[0], final);
    delete require.cache[path];
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
    const userFiles1 = await fs.readdir(this.clientDirs.events)
      .catch(() => { fs.ensureDir(this.clientDirs.events).catch(err => this.client.emit("error", err)); });
    if (userFiles1) {
      await this.loadFiles(userFiles1.filter(file => file.endsWith(".js")), this.clientDirs.events, this.loadNewEvent, this.loadEvents)
        .catch((err) => { throw err; });
    }
    const userFiles2 = await fs.readdir(this.outDirs.events)
      .catch(() => { fs.ensureDir(this.outDirs.events).catch(err => this.client.emit("error", err)); });
    if (userFiles2) {
      await this.loadFiles(userFiles2.filter(file => file.endsWith(".js")), this.outDirs.events, this.loadNewEvent, this.loadEvents)
        .catch((err) => { throw err; });
    }

    const langCountsObj = {};
    await Promise.all(this.client.eventHandlers.map(async (i) => {
      const lang = i.codeLang;
      if (!lang) return;
      langCountsObj[lang] = langCountsObj[lang] || 0;
      langCountsObj[lang]++;
    }));
    const langCounts = Object.entries(langCountsObj).sort(this.sortLangs);
    return [this.client.eventHandlers.size, langCounts];
  }

  loadNewEvent(file, dir) {
    const eventName = file.split(".")[0];
    const path = join(dir, file);
    this.client.eventHandlers.set(eventName, (...args) => require(path).run(this.client, ...args));
    this.client.on(eventName, this.client.eventHandlers.get(eventName));
    delete require.cache[path];
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
    const userFiles1 = await fs.readdir(this.clientDirs.monitors)
      .catch(() => { fs.ensureDir(this.clientDirs.monitors).catch(err => this.client.emit("error", err)); });
    if (userFiles1) {
      await this.loadFiles(userFiles1.filter(file => file.endsWith(".js")), this.clientDirs.monitors, this.loadNewMessageMonitor, this.loadMessageMonitors)
        .catch((err) => { throw err; });
    }
    const userFiles2 = await fs.readdir(this.outDirs.monitors)
      .catch(() => { fs.ensureDir(this.outDirs.monitors).catch(err => this.client.emit("error", err)); });
    if (userFiles2) {
      await this.loadFiles(userFiles2.filter(file => file.endsWith(".js")), this.outDirs.monitors, this.loadNewMessageMonitor, this.loadMessageMonitors)
        .catch((err) => { throw err; });
    }

    const langCountsObj = {};
    await Promise.all(this.client.messageMonitors.map(async (m) => {
      const lang = await m.codeLang;
      if (!lang) return;
      langCountsObj[lang] = langCountsObj[lang] || 0;
      langCountsObj[lang]++;
    }));
    const langCounts = Object.entries(langCountsObj).sort(this.sortLangs);
    return [this.client.messageMonitors.size, langCounts];
  }

  loadNewMessageMonitor(file, dir) {
    const path = join(dir, file);
    const mon = require(path);
    mon.codeLang = this.getFileLang(path); // returns a promise
    this.client.messageMonitors.set(file.split(".")[0], mon);
    delete require.cache[path];
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
    const userFiles1 = await fs.readdir(this.clientDirs.providers)
      .catch(() => { fs.ensureDir(this.clientDirs.providers).catch(err => this.client.emit("error", err)); });
    if (userFiles1) {
      await this.loadFiles(userFiles1.filter(file => file.endsWith(".js")), this.clientDirs.providers, this.loadNewProvider, this.loadProviders)
        .catch((err) => { throw err; });
    }
    const userFiles2 = await fs.readdir(this.outDirs.providers)
      .catch(() => { fs.ensureDir(this.outDirs.providers).catch(err => this.client.emit("error", err)); });
    if (userFiles2) {
      await this.loadFiles(userFiles2.filter(file => file.endsWith(".js")), this.outDirs.providers, this.loadNewProvider, this.loadProviders)
        .catch((err) => { throw err; });
    }

    const langCountsObj = [];
    await Promise.all(this.client.providers.map(async (p) => {
      const lang = await p.codeLang;
      if (!lang) return;
      langCountsObj[lang] = langCountsObj[lang] || 0;
      langCountsObj[lang]++;
    }));
    const langCounts = Object.entries(langCountsObj).sort(this.sortLangs);
    return [this.client.providers.size, langCounts];
  }

  loadNewProvider(file, dir) {
    const path = join(dir, file);
    const prov = require(path);
    prov.codeLang = this.getFileLang(path); // returns a promise
    this.client.providers.set(file.split(".")[0], prov);
    delete require.cache[path];
  }

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

  async loadExtendables() {
    this.extendableLanguages = [];

    const coreFiles = await fs.readdir(this.coreDirs.extendables)
      .catch(() => { fs.ensureDir(this.coreDirs.extendables).catch(err => this.client.emit("error", err)); });
    if (coreFiles) {
      await this.loadFiles(coreFiles.filter(file => file.endsWith(".js")
        && (coreProtected.extendables.includes(file.split(".")[0]) || !this.client.config.disabled.extendables.includes(file.split(".")[0])))
        , this.coreDirs.extendables, this.loadNewExtendable, this.loadExtendables)
        .catch((err) => { throw err; });
    }
    const userFiles1 = await fs.readdir(this.clientDirs.extendables)
      .catch(() => { fs.ensureDir(this.clientDirs.extendables).catch(err => this.client.emit("error", err)); });
    if (userFiles1) {
      await this.loadFiles(userFiles1.filter(file => file.endsWith(".js")), this.clientDirs.extendables, this.loadNewExtendable, this.loadExtendables)
        .catch((err) => { throw err; });
    }
    const userFiles2 = await fs.readdir(this.clientDirs.extendables)
      .catch(() => { fs.ensureDir(this.clientDirs.extendables).catch(err => this.client.emit("error", err)); });
    if (userFiles2) {
      await this.loadFiles(userFiles2.filter(file => file.endsWith(".js")), this.clientDirs.extendables, this.loadNewExtendable, this.loadExtendables)
        .catch((err) => { throw err; });
    }

    const langCountsObj = [];
    await Promise.all(this.extendableLanguages.map(async (lang) => {
      lang = await lang;
      if (!lang) return;
      langCountsObj[lang] = langCountsObj[lang] || 0;
      langCountsObj[lang]++;
    }));
    const langCounts = Object.entries(langCountsObj).sort(this.sortLangs);
    delete this.extendableLanguages;
    return [(coreFiles ? coreFiles.length : 0) +
      (userFiles1 ? userFiles1.length : 0) +
      (userFiles2 ? userFiles2.length : 0), langCounts];
  }

  loadNewExtendable(file, dir) {
    const path = join(dir, file);
    const extendable = require(path);
    if (this.extendableLanguages) {
      // This array is made up of promises
      this.extendableLanguages.push(this.getFileLang(path));
    }
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
    delete require.cache[path];
  }

  sortLangs([lang1], [lang2]) {
    // JS should appear first
    if (lang1 === "JS") return -1;
    if (lang2 === "JS") return 1;
    // Otherwise sort based on the default comparison order
    if (lang1 === lang2) return 0;
    if ([lang1, lang2].sort()[0] === lang1) return -1;
    return 1;
  }

  async getFileLang(path) {
    const langs2 = (await Promise.all(this.client.compiledLangs.map(async (lang) => {
      // Remove the ".js" extension, if there is one, since it's optional.
      const compiledPath = `${path.replace(/\.js$/, "")}.${lang.toLowerCase()}`;
      // If there's an equivalent file that ends with the lang, it's a code
      // file that was compiled into JS.
      try {
        await fs.access(compiledPath);
        return lang.toUpperCase();
      } catch (e) {
        return false;
      }
    })));
    const langs = langs2.filter(Boolean);
    return langs.length > 0 ? langs[langs.length - 1] : "JS";
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
    const { stdout, stderr } = await exec(`npm i ${missingModule}`, { cwd: this.client.clientBaseDir }).catch((err) => {
      console.error("=====NEW DEPENDANCY INSTALL FAILED HORRIBLY=====");
      throw err;
    });

    console.log("=====INSTALLED NEW DEPENDANCY=====");
    console.log(stdout);
    console.error(stderr);
  }

};
