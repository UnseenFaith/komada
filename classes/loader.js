const fs = require("fs-extra-promise");
const { exec } = require("child_process");
const { sep } = require("path");

const ParsedUsage = require("./parsedUsage");

/* eslint-disable no-throw-literal, import/no-dynamic-require, class-methods-use-this */
module.exports = class Loader {
  constructor(client) {
    Object.defineProperty(this, "client", { value: client });
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
    ] = await Promise.all([
      this.loadFunctions(),
      this.loadCommands(),
      this.loadCommandInhibitors(),
      this.loadCommandFinalizers(),
      this.loadEvents(),
      this.loadMessageMonitors(),
      this.loadProviders(),
    ]).catch((err) => {
      console.error(err);
      process.exit();
    });
    const countMsg = (langs) => {
      if (Object.keys(langs).length >= 2) {
        return ` (${langs.reduce((acc, [lang, count]) =>
          `${acc ? `${acc}, ` : ""}~${count} ${lang}`,
          "")})`;
      }
      return "";
    };
    this.client.emit("log", `Loaded ${funcs} functions${countMsg(funcLangs)}.`);
    this.client.emit("log", `Loaded ${commands} commands${countMsg(cmdLangs)}, with ${aliases} aliases.`);
    this.client.emit("log", `Loaded ${inhibitors} command inhibitors${countMsg(inhibLangs)}.`);
    this.client.emit("log", `Loaded ${finalizers} command finalizers${countMsg(finalLangs)}.`);
    this.client.emit("log", `Loaded ${monitors} message monitors${countMsg(monLangs)}.`);
    this.client.emit("log", `Loaded ${providers} providers${countMsg(provLangs)}.`);
    this.client.emit("log", `Loaded ${events} events${countMsg(eventLangs)}.`);
  }

  async loadFunctions() {
    const coreFiles = await fs.readdirAsync(`${this.client.coreBaseDir}functions${sep}`)
      .catch(() => { fs.ensureDirAsync(`${this.client.coreBaseDir}functions${sep}`).catch(err => this.client.emit("error", this.client.funcs.newError(err))); });
    if (coreFiles) {
      await this.loadFiles(coreFiles.filter(file => file.endsWith(".js")), this.client.coreBaseDir, this.loadNewFunction, this.loadFunctions)
        .catch((err) => { throw err; });
    }
    const userFiles1 = await fs.readdirAsync(`${this.client.clientBaseDir}functions${sep}`)
      .catch(() => { fs.ensureDirAsync(`${this.client.clientBaseDir}functions${sep}`).catch(err => this.client.emit("error", this.client.funcs.newError(err))); });
    if (userFiles1) {
      await this.loadFiles(userFiles1.filter(file => file.endsWith(".js")), this.client.clientBaseDir, this.loadNewFunction, this.loadFunctions)
        .catch((err) => { throw err; });
    }
    const userFiles2 = await fs.readdirAsync(`${this.client.outBaseDir}functions${sep}`)
      .catch(() => { fs.ensureDirAsync(`${this.client.outBaseDir}functions${sep}`).catch(err => this.client.emit("error", this.client.funcs.newError(err))); });
    if (userFiles2) {
      await this.loadFiles(userFiles2.filter(file => file.endsWith(".js")), this.client.outBaseDir, this.loadNewFunction, this.loadFunctions)
        .catch((err) => { throw err; });
    }

    const langCountsObj = {};
    Object.values(this.client.funcs).forEach((f) => {
      const lang = f.codeLang;
      langCountsObj[lang] = langCountsObj[lang] || 0;
      langCountsObj[lang]++;
    });
    const langCounts = Object.entries(langCountsObj).sort(this.sortLangs);
    return [(coreFiles ? coreFiles.length : 0) +
      (userFiles1 ? userFiles1.length : 0) +
      (userFiles2 ? userFiles2.length : 0), langCounts];
  }

  loadNewFunction(file, dir) {
    const path = `${dir}functions${sep}${file}`;
    const fn = require(path);
    fn.codeLang = "JS";
    this.getFileLang(path).then((lang) => {
      fn.codeLang = lang;
    });
    this[file.split(".")[0]] = fn;
    delete require.cache[require.resolve(path)];
  }

  async reloadFunction(name) {
    const file = name.endsWith(".js") ? name : `${name}.js`;
    if (name.endsWith(".js")) name = name.slice(0, -3);
    const files = await fs.readdirAsync(`${this.client.clientBaseDir}functions${sep}`);
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
    await this.walkCommandDirectories(`${this.client.outBaseDir}commands${sep}`)
      .catch((err) => { throw err; });

    const langCountsObj = {};
    this.client.commands.forEach((c) => {
      const lang = c.help.codeLang;
      langCountsObj[lang] = langCountsObj[lang] || 0;
      langCountsObj[lang]++;
    });
    const langCounts = Object.entries(langCountsObj).sort(this.sortLangs);
    return [this.client.commands.size, this.client.aliases.size, langCounts];
  }

  async walkCommandDirectories(dir) {
    const files = await fs.readdirAsync(dir)
      .catch(() => { fs.ensureDirAsync(dir).catch(err => this.client.emit("error", this.client.funcs.newError(err))); });
    if (!files) return false;
    await this.loadFiles(files.filter(file => file.endsWith(".js")), dir, this.loadNewCommand, this.loadCommands)
      .catch((err) => { throw err; });
    const subfolders = [];
    const mps1 = files.filter(file => !file.includes(".")).map(async (folder) => {
      const subFiles = await fs.readdirAsync(`${dir}${folder}${sep}`);
      if (!subFiles) return true;
      subFiles.filter(file => !file.includes(".")).forEach(subfolder => subfolders.push({ folder, subfolder }));
      return this.loadFiles(subFiles.filter(file => file.endsWith(".js")).map(file => `${folder}${sep}${file}`), dir, this.loadNewCommand, this.loadCommands)
        .catch((err) => { throw err; });
    });
    await Promise.all(mps1).catch((err) => { throw err; });
    const mps2 = subfolders.map(async (subfolder) => {
      const subSubFiles = await fs.readdirAsync(`${dir}${subfolder.folder}${sep}${subfolder.subfolder}${sep}`);
      if (!subSubFiles) return true;
      return this.loadFiles(subSubFiles.filter(file => file.endsWith(".js")).map(file => `${subfolder.folder}${sep}${subfolder.subfolder}${sep}${file}`), dir, this.loadNewCommand, this.loadCommands)
        .catch((err) => { throw err; });
    });
    return Promise.all(mps2).catch((err) => { throw err; });
  }

  loadNewCommand(command, dir) {
    const path = `${dir}${command}`;
    const cmd = require(path);
    cmd.help.fullCategory = command.split(sep).slice(0, -1);
    cmd.help.subCategory = cmd.help.fullCategory[1] || "General";
    cmd.help.category = cmd.help.fullCategory[0] || "General";
    cmd.help.codeLang = "JS";
    this.getFileLang(path).then((lang) => {
      cmd.help.codeLang = lang;
    });
    cmd.cooldown = new Map();
    this.client.commands.set(cmd.help.name, cmd);
    cmd.conf.aliases = cmd.conf.aliases || [];
    cmd.conf.aliases.forEach(alias => this.client.aliases.set(alias, cmd.help.name));
    cmd.usage = new ParsedUsage(this.client, cmd);
    delete require.cache[require.resolve(path)];
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
    const files = await fs.readdirAsync(dirToCheck);
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
    const coreFiles = await fs.readdirAsync(`${this.client.coreBaseDir}inhibitors${sep}`)
      .catch(() => { fs.ensureDirAsync(`${this.client.coreBaseDir}inhibitors${sep}`).catch(err => this.client.emit("error", this.client.funcs.newError(err))); });
    if (coreFiles) {
      await this.loadFiles(coreFiles.filter(file => file.endsWith(".js")), this.client.coreBaseDir, this.loadNewInhibitor, this.loadCommandInhibitors)
        .catch((err) => { throw err; });
    }
    const userFiles1 = await fs.readdirAsync(`${this.client.clientBaseDir}inhibitors${sep}`)
      .catch(() => { fs.ensureDirAsync(`${this.client.clientBaseDir}inhibitors${sep}`).catch(err => this.client.emit("error", this.client.funcs.newError(err))); });
    if (userFiles1) {
      await this.loadFiles(userFiles1.filter(file => file.endsWith(".js")), this.client.clientBaseDir, this.loadNewInhibitor, this.loadCommandInhibitors)
        .catch((err) => { throw err; });
    }
    const userFiles2 = await fs.readdirAsync(`${this.client.outBaseDir}inhibitors${sep}`)
      .catch(() => { fs.ensureDirAsync(`${this.client.outBaseDir}inhibitors${sep}`).catch(err => this.client.emit("error", this.client.funcs.newError(err))); });
    if (userFiles2) {
      await this.loadFiles(userFiles2.filter(file => file.endsWith(".js")), this.client.outBaseDir, this.loadNewInhibitor, this.loadCommandInhibitors)
        .catch((err) => { throw err; });
    }
    this.sortInhibitors();

    const langCountsObj = {};
    this.client.commandInhibitors.forEach((i) => {
      const lang = i.codeLang;
      langCountsObj[lang] = langCountsObj[lang] || 0;
      langCountsObj[lang]++;
    });
    const langCounts = Object.entries(langCountsObj).sort(this.sortLangs);
    return [this.client.commandInhibitors.size, langCounts];
  }

  loadNewInhibitor(file, dir) {
    const path = `${dir}inhibitors${sep}${file}`;
    const inhib = require(path);
    inhib.codeLang = "JS";
    this.getFileLang(path).then((lang) => {
      inhib.codeLang = lang;
    });
    this.client.commandInhibitors.set(file.split(".")[0], inhib);
    delete require.cache[require.resolve(path)];
  }

  async reloadInhibitor(name) {
    const file = name.endsWith(".js") ? name : `${name}.js`;
    if (name.endsWith(".js")) name = name.slice(0, -3);
    const files = await fs.readdirAsync(`${this.client.clientBaseDir}inhibitors${sep}`);
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
    const coreFiles = await fs.readdirAsync(`${this.client.coreBaseDir}finalizers${sep}`)
      .catch(() => { fs.ensureDirAsync(`${this.client.coreBaseDir}finalizers${sep}`).catch(err => this.client.emit("error", this.client.funcs.newError(err))); });
    if (coreFiles) {
      await this.loadFiles(coreFiles.filter(file => file.endsWith(".js")), this.client.coreBaseDir, this.loadNewFinalizer, this.loadCommandFinalizers)
        .catch((err) => { throw err; });
    }
    const userFiles1 = await fs.readdirAsync(`${this.client.clientBaseDir}finalizers${sep}`)
      .catch(() => { fs.ensureDirAsync(`${this.client.clientBaseDir}finalizers${sep}`).catch(err => this.client.emit("error", this.client.funcs.newError(err))); });
    if (userFiles1) {
      await this.loadFiles(userFiles1.filter(file => file.endsWith(".js")), this.client.clientBaseDir, this.loadNewFinalizer, this.loadCommandFinalizers)
        .catch((err) => { throw err; });
    }
    const userFiles2 = await fs.readdirAsync(`${this.client.outBaseDir}finalizers${sep}`)
      .catch(() => { fs.ensureDirAsync(`${this.client.outBaseDir}finalizers${sep}`).catch(err => this.client.emit("error", this.client.funcs.newError(err))); });
    if (userFiles2) {
      await this.loadFiles(userFiles2.filter(file => file.endsWith(".js")), this.client.outBaseDir, this.loadNewFinalizer, this.loadCommandFinalizers)
        .catch((err) => { throw err; });
    }

    const langCountsObj = {};
    this.client.commandFinalizers.forEach((final) => {
      const lang = final.codeLang;
      langCountsObj[lang] = langCountsObj[lang] || 0;
      langCountsObj[lang]++;
    });
    const langCounts = Object.entries(langCountsObj).sort(this.sortLangs);
    return [this.client.commandFinalizers.size, langCounts];
  }

  loadNewFinalizer(file, dir) {
    const path = `${dir}finalizers${sep}${file}`;
    const final = require(path);
    final.codeLang = "JS";
    this.getFileLang(path).then((lang) => {
      final.codeLang = lang;
    });
    this.client.commandFinalizers.set(file.split(".")[0], final);
    delete require.cache[require.resolve(path)];
  }

  async reloadFinalizer(name) {
    const file = name.endsWith(".js") ? name : `${name}.js`;
    if (name.endsWith(".js")) name = name.slice(0, -3);
    const files = await fs.readdirAsync(`${this.client.clientBaseDir}finalizers${sep}`);
    if (!files.includes(file)) throw `Could not find a reloadable file named ${file}`;
    await this.loadFiles([file], this.client.clientBaseDir, this.loadNewFinalizer, this.reloadFinalizer)
      .catch((err) => { throw err; });
    if (this.client.commandFinalizers.get(name).init) this.client.commandFinalizers.get(name).init(this.client);
    return `Successfully reloaded the finalizer ${name}.`;
  }

  async loadEvents() {
    this.client.eventHandlers.forEach((listener, event) => this.client.removeListener(event, listener));
    this.client.eventHandlers.clear();
    const coreFiles = await fs.readdirAsync(`${this.client.coreBaseDir}events${sep}`)
      .catch(() => { fs.ensureDirAsync(`${this.client.coreBaseDir}events${sep}`).catch(err => this.client.emit("error", this.client.funcs.newError(err))); });
    if (coreFiles) {
      await this.loadFiles(coreFiles.filter(file => file.endsWith(".js")), this.client.coreBaseDir, this.loadNewEvent, this.loadEvents)
        .catch((err) => { throw err; });
    }
    const userFiles1 = await fs.readdirAsync(`${this.client.clientBaseDir}events${sep}`)
      .catch(() => { fs.ensureDirAsync(`${this.client.clientBaseDir}events${sep}`).catch(err => this.client.emit("error", this.client.funcs.newError(err))); });
    if (userFiles1) {
      await this.loadFiles(userFiles1.filter(file => file.endsWith(".js")), this.client.clientBaseDir, this.loadNewEvent, this.loadEvents)
        .catch((err) => { throw err; });
    }
    const userFiles2 = await fs.readdirAsync(`${this.client.outBaseDir}events${sep}`)
      .catch(() => { fs.ensureDirAsync(`${this.client.outBaseDir}events${sep}`).catch(err => this.client.emit("error", this.client.funcs.newError(err))); });
    if (userFiles2) {
      await this.loadFiles(userFiles2.filter(file => file.endsWith(".js")), this.client.outBaseDir, this.loadNewEvent, this.loadEvents)
        .catch((err) => { throw err; });
    }

    const langCountsObj = {};
    this.client.eventHandlers.forEach((i) => {
      const lang = i.codeLang;
      langCountsObj[lang] = langCountsObj[lang] || 0;
      langCountsObj[lang]++;
    });
    const langCounts = Object.entries(langCountsObj).sort(this.sortLangs);
    return [this.client.eventHandlers.size, langCounts];
  }

  loadNewEvent(file, dir) {
    const eventName = file.split(".")[0];
    const path = `${dir}events${sep}${file}`;
    const event = (...args) => require(path).run(this.client, ...args);
    this.client.eventHandlers.set(eventName, event);
    this.client.on(eventName, this.client.eventHandlers.get(eventName));
    delete require.cache[require.resolve(path)];
  }

  async reloadEvent(name) {
    const file = name.endsWith(".js") ? name : `${name}.js`;
    if (name.endsWith(".js")) name = name.slice(0, -3);
    const files = await fs.readdirAsync(`${this.client.clientBaseDir}events${sep}`);
    if (!files.includes(file)) throw `Could not find a reloadable file named ${file}`;
    const listener = this.client.eventHandlers.get(name);
    if (listener) this.client.removeListener(name, listener);
    await this.loadFiles([file], this.client.clientBaseDir, this.loadNewEvent, this.reloadEvent)
      .catch((err) => { throw err; });
    return `Successfully reloaded the event ${name}.`;
  }

  async loadMessageMonitors() {
    this.client.messageMonitors.clear();
    const coreFiles = await fs.readdirAsync(`${this.client.coreBaseDir}monitors${sep}`)
      .catch(() => { fs.ensureDirAsync(`${this.client.coreBaseDir}monitors${sep}`).catch(err => this.client.emit("error", this.client.funcs.newError(err))); });
    if (coreFiles) {
      await this.loadFiles(coreFiles.filter(file => file.endsWith(".js")), this.client.coreBaseDir, this.loadNewMessageMonitor, this.loadMessageMonitors)
        .catch((err) => { throw err; });
    }
    const userFiles1 = await fs.readdirAsync(`${this.client.clientBaseDir}monitors${sep}`)
      .catch(() => { fs.ensureDirAsync(`${this.client.clientBaseDir}monitors${sep}`).catch(err => this.client.emit("error", this.client.funcs.newError(err))); });
    if (userFiles1) {
      await this.loadFiles(userFiles1.filter(file => file.endsWith(".js")), this.client.clientBaseDir, this.loadNewMessageMonitor, this.loadMessageMonitors)
        .catch((err) => { throw err; });
    }
    const userFiles2 = await fs.readdirAsync(`${this.client.outBaseDir}monitors${sep}`)
      .catch(() => { fs.ensureDirAsync(`${this.client.outBaseDir}monitors${sep}`).catch(err => this.client.emit("error", this.client.funcs.newError(err))); });
    if (userFiles2) {
      await this.loadFiles(userFiles2.filter(file => file.endsWith(".js")), this.client.outBaseDir, this.loadNewMessageMonitor, this.loadMessageMonitors)
        .catch((err) => { throw err; });
    }

    const langCountsObj = {};
    this.client.messageMonitors.forEach((m) => {
      const lang = m.codeLang;
      langCountsObj[lang] = langCountsObj[lang] || 0;
      langCountsObj[lang]++;
    });
    const langCounts = Object.entries(langCountsObj).sort(this.sortLangs);
    return [this.client.messageMonitors.size, langCounts];
  }

  loadNewMessageMonitor(file, dir) {
    const path = `${dir}monitors${sep}${file}`;
    const mon = require(path);
    mon.codeLang = "JS";
    this.getFileLang(path).then((lang) => {
      mon.codeLang = lang;
    });
    this.client.messageMonitors.set(file.split(".")[0], mon);
    delete require.cache[require.resolve(path)];
  }

  async reloadMessageMonitor(name) {
    const file = name.endsWith(".js") ? name : `${name}.js`;
    if (name.endsWith(".js")) name = name.slice(0, -3);
    const files = await fs.readdirAsync(`${this.client.clientBaseDir}monitors${sep}`);
    if (!files.includes(file)) throw `Could not find a reloadable file named ${file}`;
    await this.loadFiles([file], this.client.clientBaseDir, this.loadNewMessageMonitor, this.reloadMessageMonitor)
      .catch((err) => { throw err; });
    if (this.client.messageMonitors.get(name).init) this.client.messageMonitors.get(name).init(this.client);
    return `Successfully reloaded the monitor ${name}.`;
  }

  async loadProviders() {
    this.client.providers.clear();
    const coreFiles = await fs.readdirAsync(`${this.client.coreBaseDir}providers${sep}`)
      .catch(() => { fs.ensureDirAsync(`${this.client.coreBaseDir}providers${sep}`).catch(err => this.client.emit("error", this.client.funcs.newError(err))); });
    if (coreFiles) {
      await this.loadFiles(coreFiles.filter(file => file.endsWith(".js")), this.client.coreBaseDir, this.loadNewProvider, this.loadProviders)
        .catch((err) => { throw err; });
    }
    const userFiles1 = await fs.readdirAsync(`${this.client.clientBaseDir}providers${sep}`)
      .catch(() => { fs.ensureDirAsync(`${this.client.clientBaseDir}providers${sep}`).catch(err => this.client.emit("error", this.client.funcs.newError(err))); });
    if (userFiles1) {
      await this.loadFiles(userFiles1.filter(file => file.endsWith(".js")), this.client.clientBaseDir, this.loadNewProvider, this.loadProviders)
        .catch((err) => { throw err; });
    }
    const userFiles2 = await fs.readdirAsync(`${this.client.outBaseDir}providers${sep}`)
      .catch(() => { fs.ensureDirAsync(`${this.client.outBaseDir}providers${sep}`).catch(err => this.client.emit("error", this.client.funcs.newError(err))); });
    if (userFiles2) {
      await this.loadFiles(userFiles2.filter(file => file.endsWith(".js")), this.client.outBaseDir, this.loadNewProvider, this.loadProviders)
        .catch((err) => { throw err; });
    }

    const langCountsObj = [];
    this.client.providers.forEach((p) => {
      const lang = p.codeLang;
      langCountsObj[lang] = langCountsObj[lang] || 0;
      langCountsObj[lang]++;
    });
    const langCounts = Object.entries(langCountsObj).sort(this.sortLangs);
    return [this.client.providers.size, langCounts];
  }

  loadNewProvider(file, dir) {
    const path = `${dir}providers${sep}${file}`;
    const prov = require(path);
    prov.codeLang = "JS";
    this.getFileLang(path).then((lang) => {
      prov.codeLang = lang;
    });
    this.client.providers.set(file.split(".")[0], prov);
    delete require.cache[require.resolve(path)];
  }

  async reloadProvider(name) {
    const file = name.endsWith(".js") ? name : `${name}.js`;
    if (name.endsWith(".js")) name = name.slice(0, -3);
    const files = await fs.readdirAsync(`${this.client.clientBaseDir}providers${sep}`);
    if (!files.includes(file)) throw `Could not find a reloadable file named ${file}`;
    await this.loadFiles([file], this.client.clientBaseDir, this.loadNewProvider, this.reloadProvider)
      .catch((err) => { throw err; });
    if (this.client.providers.get(name).init) this.client.providers.get(name).init(this.client);
    return `Successfully reloaded the provider ${name}.`;
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
    const langs = (await Promise.all(this.client.compiledLangs.map(async (lang) => {
      // Remove the ".js" extension, if there is one, since it's optional.
      const compiledPath = `${path.replace(/\.js$/, "")}.${lang.toLowerCase()}`;
      // If there's an equivalent file that ends with the lang, it's a code
      // file that was compiled into JS.
      try {
        await fs.accessAsync(compiledPath);
        return lang.toUpperCase();
      } catch (e) {
        return false;
      }
    }))).filter(Boolean);
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

  installNPM(missingModule) {
    return new Promise((resolve, reject) => {
      console.log(`Installing: ${missingModule}`);
      exec(`npm i ${missingModule} --save`, (err, stdout, stderr) => {
        if (err) {
          console.log("=====NEW DEPENDENCY INSTALL FAILED HORRIBLY=====");
          return reject(err);
        }
        console.log("=====INSTALLED NEW DEPENDENCY=====");
        console.log(stdout);
        console.error(stderr);
        return resolve();
      });
    });
  }

};
