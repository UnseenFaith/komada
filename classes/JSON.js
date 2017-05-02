/* eslint-disable no-use-before-define, no-underscore-dangle, no-throw-literal */

const Discord = require("discord.js");
const fs = require("fs-extra-promise");
const now = require("performance-now");
const { sep } = require("path");

const types = ["Array", "Boolean", "Number", "String", "Channel", "Role", "User", "Member"];
const truthy = [true, "t", "yes", "y", 1, "1", "+"];
const falsy = [false, "f", "no", "n", 0, "0", "-"];

class JSONSettings {
  constructor(client) {
    Object.defineProperty(this, "client", { value: client });
    Object.defineProperty(this, "_dataDir", { value: client.config.settingsDir || `${client.clientBaseDir}/bwd/settings` });
    Object.defineProperty(this, "_defaultFile", { value: `${this._dataDir}${sep}default.json` });
    this.guilds = new Discord.Collection();
  }

  fetchSettings(guild) {
    const merged = {};
    Object.keys(this._default).forEach((key) => {
      merged[key] = this._default[key];
    });
    const guildSettings = this.guilds.get(guild instanceof Discord.Guild ? guild.id : guild);
    if (guildSettings) {
      Object.keys(guildSettings).forEach((key) => {
        merged[key] = guildSettings[key];
      });
    }
    return new Proxy(merged, handler(this.client, guild));
  }

  async init() {
    const start = now();
    let defaultSettings = await fs.readJSONAsync(this._defaultFile).catch(() => fs.outputJSONAsync(this._defaultFile, defaultSetting(this.client)));
    if (!defaultSettings) defaultSettings = defaultSetting(this.client);
    Object.defineProperty(this, "_default", { value: defaultSettings });
    this.guilds.set("default", this._default);
    this.client.guilds.forEach(async (guild) => {
      const settings = await fs.readJSONAsync(`${this._dataDir}${sep}${guild.id}.json`).catch(() => {}) || {};
      this.guilds.set(guild.id, settings);
    });
    this.client.emit("log", `Loaded Guild Settings in ${(now() - start).toFixed(2)}ms.`);
  }

  addKey(key, value, { type = value.constructor.name, possibles, min, max, global = false }) {
    const settings = this.guilds.get("default");
    if (key === undefined) throw "You must provide a valid key name to add.";
    if (value === undefined) value = settings[key].data || null;
    type = this.client.funcs.toTitleCase(type);
    if (!types.includes(type)) throw `${type} does not match a valid type. Valid types: ${types.join(", ")}`;
    value = this._parseValue("default", settings, key, value, { type, min, max, possibles });
    settings[key] = { data: value, type, global };
    if (type === "String" || type === "Number") {
      if (type === "String") {
        if (possibles && possibles instanceof Array && possibles.length > 0) settings[key].possibles = possibles;
      }
      min = parseFloat(min);
      max = parseFloat(max);
      if (min && !isNaN(min)) settings[key].min = parseFloat(min);
      if (max && !isNaN(max)) settings[key].max = parseFloat(max);
    }
    for (const setting in this.guilds.values()) {
      setting[key] = settings[key];
    }
    fs.outputJSONAsync(this._defaultFile, settings);
    return settings[key];
  }

  delKey(key) {
    const settings = this.guilds.get("default");
    if (key === undefined) throw "You must provide a valid key name to add.";
    if (!settings[key]) throw `${key} does not exist in the default settings.`;
    else delete this._default[key];
    for (const [guild, guildSettings] in this.guilds.entries()) {
      if (key in guildSettings) {
        delete guildSettings[key];
        fs.outputJSONAsync(`${this._dataDir}${sep}${guild}.json`, settings);
      }
    }
    return this._default;
  }

  has(guild) {
    return this.guilds.has(guild instanceof Discord.Guild ? guild.id : guild);
  }

  hasKey(key) {
    if (!key) throw "You must provide a key to check for.";
    return key in this._default;
  }

  insert(guild) {
    return this.guilds.set(guild instanceof Discord.Guild ? guild.id : guild, {});
  }

  remove(guild) {
    fs.remove(`${this._dataDir}${sep}${guild.id}.json`);
    return this.guilds.delete(guild instanceof Discord.Guild ? guild.id : guild);
  }

  set(guild, key, value, force = false) {
    const settings = guild.id ? this.guilds.get(guild.id) : this.guilds.get(guild);
    if (!settings) throw `There were no settings found for ${guild}`;
    if (key === undefined) throw "You must provide a key to change data for.";
    if (value === undefined) throw "You must provide a value to set.";
    if (settings[key] === undefined) {
      if (!(key in this._default)) throw "That key not exist in the default settings.";
      else settings[key] = this._default[key];
    }
    if (guild !== "default" && force) throw "If you would like to force an update on all guilds, use the default settings.";
    if (guild !== "default" && settings[key].global) throw "You cannot change the value of a global key.";
    value = this._parseValue(guild, settings, key, value);
    if (force) {
      for (const [guildID, guildSettings] in this.guilds.entries()) {
        guildSettings[key].data = value;
        fs.outputJSONAsync(`${this._dataDir}${sep}${guildID}.json`, guildSettings);
      }
      return `${key} updated with data ${value} for ${this.guilds.size - 1} guilds.`;
    }
    settings[key].data = value;
    fs.outputJSONAsync(`${this._dataDir}${sep}${guild.id ? guild.id : guild}.json`, settings);
    return settings[key];
  }

  _parseValue(guild, settings, key, value, { type, min, max, possibles } = {}) {
    const setting = settings[key] || {};
    type = setting.type || type;
    switch (type) {
      case "Array": {
        const arr = setting.data || [];
        if (value instanceof Array) {
          value.forEach((val) => {
            if (!arr.includes(val)) arr.push(val); else arr.splice(arr.indexOf(val), 1);
          });
        } else if (!arr.includes(value)) arr.push(value); else arr.splice(arr.indexOf(value), 1);
        value = arr;
        break;
      }
      case "Boolean":
        if (truthy.includes(value)) return true;
        else if (falsy.includes(value)) return false;
        throw `The value provided was not a valid boolean resolvable. Valid truthy: ${truthy.join(", ")}; Valid falsy: ${falsy.join(", ")}`;
      case "Number":
        min = min || setting.min || null;
        max = max || setting.max || null;
        value = parseFloat(value);
        if (isNaN(value)) throw `The number value passed was NaN for ${key}`;
        if (min && value < min) throw `The number value passed was smaller then the minimum value of ${min}`;
        if (max && value > max) throw `The number value passed was bigger then the maximum value of ${max}`;
        break;
      case "String":
        min = min || setting.min || null;
        max = max || setting.max || null;
        possibles = possibles || setting.possibles || null;
        if (value instanceof Array) value = value.join(" ");
        else if (typeof value !== "string") throw `The value passed was not a string for ${key}`;
        if (possibles && possibles.length > 0 && possibles.includes(value)) throw `The value passed was not a valid possible. Valid possibles: ${possibles.join(", ")}`;
        if (min && value.length < min) throw `The length of the string was smaller then the minimum value of ${min}`;
        if (max && value.length > max) throw `The length of the string was bigger then the maximum value of ${max}`;
        break;
      case "Channel":
        if (!(value instanceof Discord.Channel)) {
          const channel = this.client.channels.get(value);
          if (!channel) throw `${channel} does not exist in the collection of channels.`;
          else value = channel.id;
        } else {
          value = value.id;
        }
        break;
      case "Role":
        if (!(value instanceof Discord.Role) && guild !== "default") {
          const role = guild.roles.get(value) || guild.roles.find("name", value);
          if (!role) throw `${role} does not exist in the guild roles.`;
          else value = role.id;
        } else {
          value = value.id;
        }
        break;
      case "User":
      case "Member":
      // no default
    }
    return value;
  }

}

module.exports = JSONSettings;

const defaultSetting = client => ({
  prefix: { type: client.config.prefix.constructor.name, data: client.config.prefix },
  disabledCommands: { type: "Array", data: [] },
  modRole: { type: "Role", data: "Mods" },
  adminRole: { type: "Role", data: "Devs" },
});

// Define any custom property lookup we want here
const handler = (client, guild) => ({
  get: (setting, key) => {
    if (key === "length" || key === "size") return Object.keys(setting).length;
    if (setting[key] === undefined) return undefined; //eslint-disable-line
    switch (setting[key].type) {
      case "Array":
      case "Boolean":
      case "Number":
      case "String":
        return setting[key].data;
      case "Channel":
        return client.channels.get(setting[key].data);
      case "Role":
        return guild.roles.get(setting[key].data) || guild.roles.find("name", setting[key].data);
      default:
        return null;
    }
  },
  set: () => {
    throw "Use the set function for settings to set values that you want the settings to point to.";
  },
});
