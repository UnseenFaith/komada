/* eslint-disable no-restricted-syntax, no-underscore-dangle, no-unused-vars */
const fs = require("fs-extra-promise");
const path = require("path");
const ArrayConfig = require("./Configuration Types/Array.js");
const BooleanConfig = require("./Configuration Types/Boolean.js");
const NumberConfig = require("./Configuration Types/Number.js");
const StringConfig = require("./Configuration Types/String.js");

const guildConfs = new Map();
let dataDir = "";
const defaultFile = "default.json";
let defaultConf = {};

/**
 * The starting point for creating a Guild configuration
 */
class Config {
  /**
   * @param {Client} client The Discord.js client.
   * @param {GuildID} guildID The guild for which the configuration is being made.
   * @param {Config} [config] The local config to add to the configuration.
   */
  constructor(client, guildID, config = {}) {
    /**
     * The client that created this configuration
     * @type {Client}
     * @readonly
     */
    Object.defineProperty(this, "_client", { value: client });
    /**
     * The guild to create the configuration for.
     * @type {GuildID}
     * @readonly
     */
    Object.defineProperty(this, "_id", { value: guildID });
    /**
     * The location where we will be storing this data.
     * @type {String}
     * @readonly
     */
    Object.defineProperty(this, "_dataDir", { value: dataDir });
    if (typeof config === "object") {
      for (const prop in config) {
        if (config[prop].type === "String") {
          this[prop] = new StringConfig(this, config[prop].data);
        } else if (config[prop].type === "Boolean") {
          this[prop] = new BooleanConfig(this, config[prop].data);
        } else if (config[prop].type === "Number") {
          this[prop] = new NumberConfig(this, config[prop].data);
        } else if (config[prop].type === "Array") {
          this[prop] = new ArrayConfig(this, config[prop].data);
        } else {
          client.funcs.log("Invalid Key type inside of your configuration. Komada will ignore this key until it is fixed.", "warn");
        }
      }
    }
    return this;
  }

  /**
   * Allows you to add a key to a guild configuration. Note: This should never be called directly as it could cause unwanted side effects.
   * @param {String} key The key to add to the configuration.
   * @param {String|Array|Number|Boolean} defaultValue The value for the key.
   * @param {String} type The type of key you want to add.
   * @returns {Config}
   */
  addKey(key, defaultValue, type) {
    if (type === "String") {
      this[key] = new StringConfig(this, defaultValue);
    } else if (type === "Boolean") {
      this[key] = new BooleanConfig(this, defaultValue);
    } else if (type === "Number") {
      this[key] = new NumberConfig(this, defaultValue);
    } else if (type === "Array") {
      this[key] = new ArrayConfig(this, defaultValue);
    } else {
      console.log(`Invalid Key Type: Type: ${type}`);
    }
    fs.outputJSONAsync(path.resolve(`${dataDir}${path.sep}${this._id}.json`), guildConfs.get(this._id));
    return this;
  }

  /**
   * Deletes a key from the respected guild configuration. This should never be called directly.
   * @param {String} key The key to delete from the configuration
   * @returns {null}
   */
  delKey(key) {
    delete this[key];
    fs.outputJSONAsync(path.resolve(`${dataDir}${path.sep}${this._id}.json`), guildConfs.get(this._id));
    return null;
  }

  /**
   * Resets a key for the respected guild configuration.
   * @param {String} key The key to reset in the configuration.
   * @returns {Config<Key>}
   */
  reset(key) {
    if (this[key].type === "String") {
      this[key] = new StringConfig(this, defaultConf[key].data);
    } else if (this[key].type === "Boolean") {
      this[key] = new BooleanConfig(this, defaultConf[key].data);
    } else if (this[key].type === "Number") {
      this[key] = new NumberConfig(this, defaultConf[key].data);
    } else if (this[key].type === "Array") {
      this[key] = new ArrayConfig(this, defaultConf[key].data);
    }
    fs.outputJSONAsync(path.resolve(`${dataDir}${path.sep}${this._id}.json`), guildConfs.get(this._id));
    return this[key];
  }

  /**
   * Checks the guild configuration for a key
   * @param {String} key The key to check the guild configuration for.
   * @returns {Boolean}
   */
  has(key) {
    if (!key) return "Please supply a key.";
    return (key in this);
  }

  /**
   * Simplifies the guild configuration for use in commands and modules.
   * @param {Guild} guild The guild to get a configuration for.
   * @returns {Object}
   * @static
   * @example
   * //Example of what this returns
   * { prefix: '--', disabledCommands: [], modRole: 'Mods', adminRole: 'Devs', lang: 'en' }
   */
  static get(guild) {
    const conf = {};
    if (guild && guildConfs.has(guild.id)) {
      const guildConf = guildConfs.get(guild.id);
      for (const key in guildConf) {
        if (guildConf[key]) conf[key] = guildConf[key].data;
        else conf[key] = defaultConf[key].data;
      }
    } else {
      for (const key in defaultConf) {
        conf[key] = defaultConf[key].data;
      }
    }
    return conf;
  }

  /**
   * Set the default value for a key in the default configuration.
   * @param {String} key The key for which you want to change.
   * @param {Array|Boolean|Number|String} defaultValue The value you want to set as the default.
   * @returns {Object} Returns the new default configuration for the key.
   * @static
   */
  static set(key, defaultValue) {
    if (!key || !defaultValue) return `You supplied ${key}, ${defaultValue}. Please supply both a key, and a default value.`;
    if (!defaultConf[key]) return `The key ${key} does not seem to be present in the default configuration.`;
    if (defaultConf[key].type === "Array") this.add(key, defaultValue);
    if (defaultConf[key].type === "Boolean") this.toggle(key);
    if (defaultConf[key].type === "Number" || defaultConf[key].type === "String") defaultConf[key].data = defaultValue;
    else return "Unsupported Configuration Type! Cannot set the value.";
    fs.outputJSONAsync(`${dataDir}${path.sep}${defaultFile}`, defaultConf);
    return defaultConf[key];
  }

  /**
   * Sets the default minimum value for a Number key
   * @param {String} key The Number key for which you want to set the minimum value for.
   * @param {Number} defaultMinValue The value you want to set as the "minimum" value.
   * @returns {Object} Returns the new default configuration for the key.
   * @static
   */
  static setMin(key, defaultMinValue) {
    if (!key || !defaultMinValue) return `You supplied ${key}, ${defaultMinValue}. Please supply both a key, and a default min value.`;
    if (!defaultConf[key].type !== "Number") return "You cannot use this method on non-Numeral configurations.";
    defaultConf[key].min = defaultMinValue;
    fs.outputJSONAsync(`${dataDir}${path.sep}${defaultFile}`, defaultConf);
    return defaultConf[key];
  }

  /**
   * Sets the default maximum value for a Number key
   * @param {String} key The Number key for which you want to set the maximum value for.
   * @param {Number} defaultMaxValue The value you want to set as the "maximum" value.
   * @returns {Object} Returns the new default configuration for the key.
   * @static
   */
  static setMax(key, defaultMaxValue) {
    if (!key || !defaultMaxValue) return `You supplied ${key}, ${defaultMaxValue}. Please supply both a key, and a default max value.`;
    if (!defaultConf[key].type !== "Number") return "You cannot use this method on non-Numeral configurations.";
    defaultConf[key].min = defaultMaxValue;
    fs.outputJSONAsync(`${dataDir}${path.sep}${defaultFile}`, defaultConf);
    return defaultConf[key];
  }

  /**
   * Adds a value to the data array for an Array key.
   * @param {String} key The Array key for which you want to add value(s) for.
   * @param {String} defaultValue The value for which you want to add to the array.
   * @returns {Object} Returns the new default configuration for the key.
   * @static
   */
  static add(key, defaultValue) {
    if (!key || !defaultValue) return `You supplied ${key}, ${defaultValue}. Please supply both a key, and a default value.`;
    if (!defaultConf[key].type !== "Array") return "You cannot use this method on non-Array configuration options.";
    if (defaultConf[key].data.includes(defaultValue)) return `The default value ${defaultValue} is already in ${defaultConf[key].data}.`;
    defaultConf[key].data.push(defaultValue);
    fs.outputJSONAsync(`${dataDir}${path.sep}${defaultFile}`, defaultConf);
    return defaultConf[key];
  }

  /**
   * Deletes a value from the data array for an Array key.
   * @param {String} key The array key for which you want to delete value(s) from.
   * @param {String} defaultValue The value for which you want to remove from the array.
   * @returns {Object} Returns the new default configuration for the key.
   * @static
   */
  static del(key, defaultValue) {
    if (!key || !defaultValue) return `You supplied ${key}, ${defaultValue}. Please supply both a key, and a default value.`;
    if (!defaultConf[key].type !== "Array") return "You cannot use this method on non-Array configuration options.";
    if (!defaultConf[key].data.includes(defaultValue)) return `The default value ${defaultValue} is not in ${defaultConf[key].data}.`;
    defaultConf[key].data.splice(defaultConf[key].indexOf(defaultValue), 1);
    fs.outputJSONAsync(`${dataDir}${path.sep}${defaultFile}`, defaultConf);
    return defaultConf[key];
  }

  /**
   * Toggles the true/false statement for a Boolean key
   * @param {String} key The boolean key for which you want to toggle the statement for.
   * @returns {Object} Returns the new default configuration for the key.
   * @static
   */
  static toggle(key) {
    if (!key) return "Please supply a key to toggle the value for.";
    if (!defaultConf[key].type !== "Boolean") return "You cannot use this method on non-Boolean configuration options.";
    if (defaultConf[key].data === true) defaultConf[key].data = false;
    else defaultConf[key].data = false;
    fs.outputJSONAsync(`${dataDir}${path.sep}${defaultFile}`, defaultConf);
    return defaultConf[key];
  }

  /**
   * Checks if the guildConfs Map has the specified guild.
   * @param {Guild} guild The guild to check the Map for.
   * @returns {Boolean}
   * @static
   */
  static has(guild) {
    if (!guild) return "Please supply a guild.";
    return (guildConfs.has(guild.id));
  }

  /**
  * Checks if the default configuration has a specified key.
  * @param {String} key The key for which to check the default configuration for.
  * @returns {Boolean}
  * @static
  */
  static hasKey(key) {
    if (!key) return "Please supply a key to check for.";
    return (key in defaultConf);
  }

  /**
   * Adds a key to the default configuration, and every guilds configuration.
   * @param {String} key The key for which to add to the default and all guild configurations.
   * @param {String|Number|Boolean|Array} defaultValue The value for which you want to set as the default value.
   * @param {String} [type] The type of key this will be. This can currently be Strings, Numbers, Arrays, or Booleans.
   * @returns {Object} Returns the entire default configuration
   * @static
   */
  static addKey(key, defaultValue, type = defaultValue.constructor.name) {
    if (!key || !defaultValue) return `You supplied ${key}, ${defaultValue}. Please provide both.`;
    if (defaultConf[key]) return "There's no reason to add this key, it already exists.";
    if (["TextChannel", "GuildChannel", "Message", "User", "GuildMember", "Guild", "Role", "VoiceChannel", "Emoji", "Invite"].includes(type)) {
      defaultValue = defaultValue.id;
    }
    if (defaultValue.constructor.name !== type && defaultValue.constructor.name !== null) {
      return "Invalid Value was provided";
    }
    defaultConf[key] = { type: defaultValue.constructor.name, data: defaultValue };
    guildConfs.forEach((config) => {
      config.addKey(key, defaultValue, type);
    });
    fs.outputJSONAsync(path.resolve(`${dataDir}${path.sep}${defaultFile}`), defaultConf);
    return defaultConf;
  }

  /**
   * Deletes a key from the default configuration, and every guilds configuration.
   * @param {String} key The key for which to add to the default and all guild configurations.
   * @returns {Object} Returns the new default configuration
   * @static
   */
  static delKey(key) {
    if (!key) return "Please supply a key to delete from the default configuration.";
    if (!defaultConf[key]) return `The key ${key} does not seem to be present in the default configuration.`;
    if (["modRole", "adminRole", "disabledCommands", "prefix", "lang"].includes(key)) {
      return `The key ${key} is core and cannot be deleted.`;
    }
    delete defaultConf[key];
    fs.outputJSONAsync(`${dataDir}${path.sep}${defaultFile}`, defaultConf);
    this.guildConfs.forEach((config) => {
      config.delKey(key);
    });
    return defaultConf;
  }

  /**
   * Inserts a guild into the guildConfs map and deletes the configuration JSON. This should never be called by anyone, this is purely for the guildCreate event.
   * @param {Client} client The Discord.js Client
   * @param {Guild} guild The Guild being inserted into the map.
   * @returns {String}
   * @static
   */
  static insert(client, guild) {
    if (!guild) return "Please specify a guild to remove.";
    guildConfs.set(guild.id, new Config(client, guild.id, defaultConf));
    fs.outputJSONAsync(`${dataDir}${path.sep}${guild.id}.json`, guildConfs.get(guild.id));
    return `Inserted ${guild.name} succesfully.`;
  }

  /**
   * Removes a guild from the guildConfs map and deletes the configuration JSON. This should never be called by anyone, this is purely for the guildDelete event.
   * @param {Guild} guild The guild being removed from the map.
   * @returns {String}
   * @static
   */
  static remove(guild) {
    if (!guild) return "Please specify a guild to remove.";
    guildConfs.delete(guild.id);
    fs.removeAsync(path.resolve(`${dataDir}${path.sep}${guild.id}.json`));
    return `Removed ${guild.name} succesfully.`;
  }

  /**
   * The motherboard of our Configuration system. There's no reason to ever call this as it's called internally upon startup.
   * @param {Client} client The Discord.js Client
   * @returns {null}
   * @static
   */
  static initialize(client) {
    defaultConf = {
      prefix: { type: "String", data: client.config.prefix },
      disabledCommands: { type: "Array", data: [] },
      modRole: { type: "String", data: "Mods" },
      adminRole: { type: "String", data: "Devs" },
      lang: { type: "String", data: "en" },
    };
    dataDir = path.resolve(`${client.clientBaseDir}${path.sep}bwd${path.sep}conf`);
    fs.ensureFileAsync(`${dataDir}${path.sep}${defaultFile}`).catch(err => client.funcs.log(err, "error"));
    fs.readJSONAsync(path.resolve(`${dataDir}${path.sep}${defaultFile}`))
    .then((conf) => {
      if (conf) defaultConf = conf;
    })
    .catch(() => fs.outputJSONAsync(`${dataDir}${path.sep}${defaultFile}`));
    client.guilds.forEach((guild) => {
      fs.readJSONAsync(path.resolve(`${dataDir}${path.sep}${guild.id}.json`))
      .then((thisConf) => {
        guildConfs.set(guild.id, new Config(client, guild.id, thisConf));
      }).catch(() => {
        guildConfs.set(guild.id, new Config(client, guild.id, defaultConf));
      });
    });
    return null;
  }
}

module.exports = Config;
module.exports.guildConfs = guildConfs;
module.exports.defaultConf = defaultConf;
