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
    Object.defineProperty(this, "_dataDir", { value: client.config.settingsDir || `${client.clientBaseDir}/bwd/`});
    Object.defineProperty(this, "_defaultFile", { value: `${this._dataDir}${sep}default.json` });
    this.guildSettings = new Discord.Collection();
  }

  fetchSettings(guild) {
    const merged = {};
    for (const key in this._default) {
      merged[key] = this._default[key];
    }
    const guildSettings = this.guildSettings.get(guild);
    if (guildSettings) {
      for (const key in guildSettings) {
        merged[key] = guildSettings[key];;
      }
    }
    return new Proxy(merged, handler(this.client, guild));
  }

  async init() {
    const start = now();
    let defaultSettings = await fs.readJSONAsync(this._defaultFile).catch(() => fs.outputJSONAsync(this._defaultFile, defaultSetting(this.client)));
    if (!defaultSettings) defaultSettings = defaultSetting(this.client);
    Object.defineProperty(this, "_default", { value: defaultSettings });
    this.guildSettings.set("default", this._default);
    this.client.guilds.forEach(async (guild) => {
      const settings = await fs.readJSONAsync(`${this._dataDir}${sep}${guild.id}.json`).catch(() => {}) || {};
      this.guildSettings.set(guild.id, settings);
   });
   this.client.emit("log", `Loaded Guild Settings in ${(now() - start).toFixed(2)}ms.`);
  }

  addKey(key, value, { type = value.constructor.name, possibles, min, max, global = false }) {
    const settings = this.guildSettings.get("default");
    if (key === undefined) throw `You must provide a valid key name to add.`;
    if (value === undefined) value = settings[key] || null;
    type = this.client.funcs.toTitleCase(type);
    if (!types.includes(type)) throw `${type} does not match a valid type. Valid types: ${types.join(", ")}`;
    if ((type === "String" || type === "Number") && (min || max || !["number", "string"].includes(typeof min) || !["number", "string"].includes(typeof max))) throw `Minimum and maximum must be either numbers or strings.`;
    if (type === "String" && (possibles && !(possibles instanceof Array))) throw "The list of possibles must be a valid array.";
    value = this._parseValue("default", settings, key, value, { type, min, max, possibles });
    settings[key] = { data: value, type, global };
    if (type === "String" || type === "Number") {
      if (type === "String") {
        if (possibles && possibles.length > 0) settings[key].possibles = possibles;
      }
      min = parseFloat(min);
      max = parseFloat(max);
      if (min && !isNaN(min)) settings[key].min = parseFloat(min);
      if (max && !isNaN(max)) settings[key].max = parseFloat(max);
    }
    for (const [guild, setting] of this.guildSettings) {
      setting[key] = settings[key];
    }
    fs.outputJSONAsync(this._defaultFile, settings);
    return settings[key];
  }

  delKey(key) {
    const settings = this.guildSettings.get("default");
    if (key === undefined) throw `You must provide a valid key name to add.`;
    if (!settings[key]) throw `${key} does not exist in the default settings.`;
    else delete this._default[key];
    for (const [guild, settings] in this.guildSettings) {
      if (key in settings) {
        delete settings[key];
        fs.outputJSONAsync(`${this._dataDir}${sep}${guild.id}.json`, settings);
      }
    }
    return this._default;
  }

  has(guild) {
    return this.guildSettings.has(guild instanceof Discord.Guild ? guild.id : guild);
  }

  hasKey(key) {
    if (!key) throw "You must provide a key to check for.";
    return key in this._default;
  }

  remove(guild) {
    fs.remove(`${this._dataDir}${sep}${guild.id}.json`);
    return this.guildSettings.delete(guild instanceof Discord.Guild ? guild.id : guild);
  }

  set(guild, key, value, force = false) {
    guild = guild instanceof Discord.Guild ? guild.id : guild;
    if (!guild && !this.client.guilds.has(guild) && guild !== "default") throw "You must provide a valid guild or \"default\" as the setting to change.";
    if (key === undefined) throw "You must provide a key to change data for.";
    if (value === undefined) "You must provide a value to set.";
    const settings = guild.id ? this.guildSettings.get(guild.id) : this.guildSettings.get(guild);
    if (!settings) throw `There were no settings found for ${guild}`;
    if (settings[key] === undefined) {
      if (!(key in this._default)) throw `That key not exist in the default settings.`;
      else settings[key] = this._default[key];
    }
    if (guild !== "default" && force) throw `If you would like to force an update on all guilds, use the default settings.`;
    if (guild !== "default" && settings[key].global) throw `You cannot change the value of a global key.`;
    value = this._parseValue(guild, settings, key, value);
    if (force) {
      for (const [guild, setting] of this.guildSettings) {
        setting[key].data = value;
        fs.outputJSONAsync(`${this._dataDir}${sep}${key}.json`, setting);
      }
      return `${key} updated with data ${value} for ${this.guildSettings.size - 1} guilds.`;
    }
    settings[key].data = value;
    fs.outputJSONAsync(`${this._dataDir}${sep}${guild.id ? guild.id : guild}.json`, settings);
    return settings[key];
  }

  _parseValue(guild, settings, key, value, { type, min, max, possibles } = {}) {
    const setting = settings[key] || {};
    type = setting.type || type;
    switch (type) {
      case "Array":
        const arr = setting.data || [];
        if (value instanceof Array) {
          value.forEach((val) => {
            if (!arr.includes(val)) arr.push(val); else arr.splice(arr.indexOf(val), 1);
          });
        } else {
          if (!arr.includes(value)) arr.push(value); else arr.splice(arr.indexOf(value), 1);
        }
        return arr;
      case "Boolean":
        if (truthy.includes(value)) return true;
        else if (falsy.includes(value)) return false;
        else throw `The value provided was not a valid boolean resolvable. Valid truthy: ${truthy.join(", ")}; Valid falsy: ${falsy.join(", ")}`;
        break;
      case "Number":
        min = min || setting.min || null;
        max = max || setting.max || null;
        value = parseFloat(value);
        if (isNaN(value)) throw `The number value passed was NaN for ${key}`;
        if (min && value < min) throw `The number value passed was smaller then the minimum value of ${min}`;
        if (max && value > max) throw `The number value passed was bigger then the maximum value of ${max}`;
        return value;
      case "String":
        min = min || setting.min || null;
        max = max || setting.max || null;
        possibles = possibles || setting.possibles || null;
        if (value instanceof Array) value = value.join(" ");
        else if (typeof value !== "string") throw `The value passed was not a string for ${key}`;
        if (possibles && possibles.length > 0 && possibles.includes(value)) throw `The value passed was not a valid possible. Valid possibles: ${possibles.join(", ")}`;
        if (min && value.length < min) throw `The length of the string was smaller then the minimum value of ${min}`;
        if (max && value.length > max) throw `The length of the string was bigger then the maximum value of ${max}`;
        return value;
      case "Channel":
        if (!(value instanceof Discord.Channel)) {
          const channel = this.client.channels.get(value);
          if (!channel) throw `${channel} does not exist in the collection of channels.`;
          else value = channel.id;
        } else {
           value = value.id;
        }
        return value;
      case "Role":
        if (!(value instanceof Discord.Role) && guild !== "default") {
          const role = guild.roles.get(value) || guild.roles.find("name", value);
          if (!role) throw `${role} does not exist in the guild roles.`;
          else value = role.id;
        } else {
          value = value.id;
        }
        return value;
      case "User":
      case "Member":
    }
  }

}

module.exports = JSONSettings;

const defaultSetting = (client) => {
  return {
    prefix: { type: client.config.prefix.constructor.name, data: client.config.prefix },
    disabledCommands: { type: "Array", data: [] },
    modRole: { type: "String", data: "Mods" },
    adminRole: { type: "String", data: "Devs" },
  }
}

// Define any custom property lookup we want here
const handler = (client, guild) => {
  return {
    get: (setting, key) => {
      if (key === "length" || key === "size") return Object.keys(setting).length;
      if (setting[key] === undefined) return undefined;
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
          undefined;
      }
    },
    set: (setting, key, value) => {
      throw "Use the set function for settings to set values that you want the settings to point to."
    }
  }
}
