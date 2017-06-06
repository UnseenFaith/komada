/* eslint-disable no-restricted-syntax, no-underscore-dangle, no-unused-vars, no-throw-literal, guard-for-in, no-prototype-builtins */
const fs = require("fs-nextra");
const path = require("path");
const Types = require("./types");
const Discord = require("discord.js");

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
   * @param {Guild} guild The guild for which the configuration is being made.
   * @param {Config} [config] The local config to add to the configuration.
   */
  constructor(client, guild, config = {}) {
    /**
     * The client that created this configuration
     * @type {Client}
     * @readonly
     */
    Object.defineProperty(this, "_client", { value: client });
    /**
     * The guild to create the configuration for.
     * @type {Guild}
     * @readonly
     */
    Object.defineProperty(this, "_guild", { value: guild });
    /**
     * The location where we will be storing this data.
     * @type {string}
     * @readonly
     */
    Object.defineProperty(this, "_dataDir", { value: dataDir });
    if (typeof config === "object") {
      for (const prop in config) {
        switch (config[prop].type) {
          case "String":
            this[prop] = new Types.String(this, config[prop].data);
            break;
          case "Boolean":
            this[prop] = new Types.Boolean(this, config[prop].data);
            break;
          case "Number":
            this[prop] = new Types.Number(this, config[prop].data);
            break;
          case "Array":
            this[prop] = new Types.Array(this, config[prop].data);
            break;
          case "Channel":
            this[prop] = new Types.Channel(this, config[prop].data);
            break;
          case "Role":
            this[prop] = new Types.Role(this, config[prop].data);
            break;
          default:
            client.emit("warn", `${config[prop].type} in ${guild.id}.json is an invalid Configuration Type. Komada will ignore it until it is fixed.`);
        }
      }
    }
  }

  /**
   * Allows you to add a key to a guild configuration. Note: This should never be called directly as it could cause unwanted side effects.
   * @param {string} key The key to add to the configuration.
   * @param {string|array|number|boolean|channel|role} defaultValue The value for the key.
   * @param {string} type The type of key you want to add.
   * @returns {Config}
   */
  addKey(key, defaultValue, type) {
    switch (type) {
      case "String":
        this[key] = new Types.String(this, defaultValue);
        break;
      case "Boolean":
        this[key] = new Types.Boolean(this, defaultValue);
        break;
      case "Number":
        this[key] = new Types.Number(this, defaultValue);
        break;
      case "Array":
        this[key] = new Types.Array(this, defaultValue);
        break;
      case "Channel":
        this[key] = new Types.Channel(this, defaultValue);
        break;
      case "Role":
        this[key] = new Types.Role(this, defaultValue);
        break;
      default:
        throw "Invalid type provided.";
    }
    Config.save(this._dataDir, this._guild.id);
    return this;
  }

  /**
   * Deletes a key from the respected guild configuration. This should never be called directly.
   * @param {string} key The key to delete from the configuration
   * @returns {null}
   */
  delKey(key) {
    delete this[key];
    Config.save(this._dataDir, this._guild.id);
    return null;
  }

  /**
   * Resets a key for the respected guild configuration.
   * @param {string} key The key to reset in the configuration.
   * @returns {Config<Key>}
   */
  reset(key) {
    if (key === undefined || this[key] === undefined) throw "The key provided was undefined or does not exist";
    switch (this[key].type) {
      case "String":
        this[key] = new Types.String(this, defaultConf[key].data);
        break;
      case "Boolean":
        this[key] = new Types.Boolean(this, defaultConf[key].data);
        break;
      case "Number":
        this[key] = new Types.Number(this, defaultConf[key].data);
        break;
      case "Array":
        this[key] = new Types.Array(this, defaultConf[key].data);
        break;
      case "Channel":
        this[key] = new Types.Channel(this, defaultConf[key].data);
        break;
      case "Role":
        this[key] = new Types.Role(this, defaultConf[key].data);
        break;
      default:
        throw "Invalid type provided.";
    }
    Config.save(this._dataDir, this._guild.id);
    return this[key];
  }

  /**
   * Checks the guild configuration for a key
   * @param {string} key The key to check the guild configuration for.
   * @returns {boolean}
   */
  has(key) {
    if (key === undefined) throw "Undefined key provided";
    return key in this;
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
   * @param {string} key The key for which you want to change.
   * @param {Array|boolean|number|string} defaultValue The value you want to set as the default.
   * @param {boolean} force Whether or not Komada should force update all configurations with this new value.
   * @returns {Object} Returns the new default configuration for the key.
   * @static
   */
  static set(key, defaultValue, force = false) {
    if (key === undefined || defaultValue === undefined) throw "You supplied undefined values for a key or a defualt value. Please supply both";
    if (!defaultConf.hasOwnProperty(key)) throw "That key does not exist in the default configuration.";
    switch (defaultConf[key].type) {
      case "Array":
        this.add(key, defaultValue, force);
        break;
      case "Boolean":
        this.toggle(key, force);
        break;
      case "Number":
      case "String":
        defaultConf[key].data = defaultValue;
        if (force) {
          guildConfs.forEach((config) => {
            config[key].data = defaultValue;
          });
        }
        break;
      case "Channel":
      case "Role":
        if (defaultValue instanceof Discord.Role || defaultValue instanceof Discord.Channel) defaultValue = defaultValue.id;
        defaultConf[key].data = defaultValue;
        if (force) {
          guildConfs.forEach((config) => {
            config[key].data = defaultValue;
          });
        }
        break;
      default:
        throw "Unsupported Configuration type. Cannot set the value.";
    }
    fs.outputJSON(`${dataDir}${path.sep}${defaultFile}`, defaultConf);
    return defaultConf[key];
  }

  /**
   * Sets the default minimum value for a Number key
   * @param {string} key The Number key for which you want to set the minimum value for.
   * @param {number} defaultMinValue The value you want to set as the "minimum" value.
   * @param {boolean} force Whether or not Komada should enforce this new minimum value in all configurations.
   * @returns {Object} Returns the new default configuration for the key.
   * @static
   */
  static setMin(key, defaultMinValue, force = false) {
    if (key === undefined || defaultMinValue === undefined) throw "You supplied an undefined variable for the function, please provide a key and minimum value.";
    if (defaultConf[key].type !== "Number") throw "You cannot use this method on non-Numeral configurations.";
    defaultConf[key].min = defaultMinValue;
    if (force) {
      guildConfs.forEach((config) => {
        config[key].setMin(defaultMinValue);
      });
    }
    fs.outputJSON(`${dataDir}${path.sep}${defaultFile}`, defaultConf);
    return defaultConf[key];
  }

  /**
   * Sets the default maximum value for a Number key
   * @param {string} key The Number key for which you want to set the maximum value for.
   * @param {number} defaultMaxValue The value you want to set as the "maximum" value.
   * @param {boolean} force Whether or not Komada should enforce this new maximum value in all configurations.
   * @returns {Object} Returns the new default configuration for the key.
   * @static
   */
  static setMax(key, defaultMaxValue, force = false) {
    if (key === undefined || defaultMaxValue === undefined) throw `You supplied ${key}, ${defaultMaxValue}. Please supply both a key, and a default max value.`;
    if (defaultConf[key].type !== "Number") throw "You cannot use this method on non-Numeral configurations.";
    defaultConf[key].max = defaultMaxValue;
    if (force) {
      guildConfs.forEach((config) => {
        config[key].setMax(defaultMaxValue);
      });
    }
    fs.outputJSON(`${dataDir}${path.sep}${defaultFile}`, defaultConf);
    return defaultConf[key];
  }

  /**
   * Adds a value to the data array for an Array key.
   * @param {string} key The Array key for which you want to add value(s) for.
   * @param {string} defaultValue The value for which you want to add to the array.
   * @param {boolean} force Whether or not Komada should force add this value in all configurations.
   * @returns {Object} Returns the new default configuration for the key.
   * @static
   */
  static add(key, defaultValue, force = false) {
    if (key === undefined || defaultValue === undefined) throw "You supplied an undefined variable to the function. Please provide both a key and a default value.";
    if (defaultConf[key].type !== "Array") throw "You cannot use this method on non-Array configuration options.";
    if (defaultConf[key].data.includes(defaultValue)) throw `The default value ${defaultValue} is already in ${defaultConf[key].data}.`;
    defaultConf[key].data.push(defaultValue);
    if (force) {
      guildConfs.forEach((config) => {
        config[key].add(defaultValue);
      });
    }
    fs.outputJSON(`${dataDir}${path.sep}${defaultFile}`, defaultConf);
    return defaultConf[key];
  }

  /**
   * Deletes a value from the data array for an Array key.
   * @param {string} key The array key for which you want to delete value(s) from.
   * @param {string} defaultValue The value for which you want to remove from the array.
   * @param {boolean} force Whether or not Komada should force delete this value from all configurations.
   * @returns {Object} Returns the new default configuration for the key.
   * @static
   */
  static del(key, defaultValue, force = false) {
    if (key === undefined || defaultValue === undefined) throw "You supplied an undefined variable to the function. Please provide both a key and a default value.";
    if (defaultConf[key].type !== "Array") throw "You cannot use this method on non-Array configuration options.";
    if (!defaultConf[key].data.includes(defaultValue)) throw `The default value ${defaultValue} is not in ${defaultConf[key].data}.`;
    defaultConf[key].data.splice(defaultConf[key].indexOf(defaultValue), 1);
    if (force) {
      guildConfs.forEach((config) => {
        config[key].del(defaultValue);
      });
    }
    fs.outputJSON(`${dataDir}${path.sep}${defaultFile}`, defaultConf);
    return defaultConf[key];
  }

  /**
   * Toggles the true/false statement for a Boolean key
   * @param {string} key The boolean key for which you want to toggle the statement for.
   * @returns {Object} Returns the new default configuration for the key.
   * @static
   */
  static toggle(key) {
    if (key === undefined) throw "Please supply a key to toggle the value for.";
    if (defaultConf[key].type !== "Boolean") throw "You cannot use this method on non-Boolean configuration options.";
    if (defaultConf[key].data === true) defaultConf[key].data = false;
    else defaultConf[key].data = false;
    guildConfs.forEach((config) => {
      config[key].toggle();
    });
    fs.outputJSON(`${dataDir}${path.sep}${defaultFile}`, defaultConf);
    return defaultConf[key];
  }

  /**
   * Checks if the guildConfs Map has the specified guild.
   * @param {Guild} guild The guild to check the Map for.
   * @returns {boolean}
   * @static
   */
  static has(guild) {
    if (!guild) throw "Please supply a guild.";
    return guildConfs.has(guild.id);
  }

  /**
  * Checks if the default configuration has a specified key.
  * @param {string} key The key for which to check the default configuration for.
  * @returns {boolean}
  * @static
  */
  static hasKey(key) {
    if (!key) throw "Please supply a key to check for.";
    return key in defaultConf;
  }

  /**
   * Adds a key to the default configuration, and every guilds configuration.
   * @param {string} key The key for which to add to the default and all guild configurations.
   * @param {string|number|boolean|Array} defaultValue The value for which you want to set as the default value.
   * @param {string} [type] The type of key this will be. This can currently be Strings, Numbers, Arrays, or Booleans.
   * @returns {Object} Returns the entire default configuration
   * @static
   */
  static addKey(key, defaultValue, type = defaultValue.constructor.name) {
    if (key === undefined || defaultValue === undefined) throw "You supplied an undefined parameter to the function. Please provide both a key and default value";
    if (defaultConf[key]) throw "There's no reason to add this key, it already exists.";
    defaultConf[key] = { type, data: defaultValue };
    guildConfs.forEach((config) => {
      config.addKey(key, defaultValue, type);
    });
    fs.outputJSON(path.resolve(`${dataDir}${path.sep}${defaultFile}`), defaultConf);
    return defaultConf;
  }

  /**
   * Deletes a key from the default configuration, and every guilds configuration.
   * @param {string} key The key for which to add to the default and all guild configurations.
   * @returns {Object} Returns the new default configuration
   * @static
   */
  static delKey(key) {
    if (key === undefined) throw "Please supply a key to delete from the default configuration.";
    if (!defaultConf[key]) throw `The key ${key} does not seem to be present in the default configuration.`;
    if (["modRole", "adminRole", "disabledCommands", "prefix", "lang"].includes(key)) {
      return `The key ${key} is core and cannot be deleted.`;
    }
    delete defaultConf[key];
    fs.outputJSON(`${dataDir}${path.sep}${defaultFile}`, defaultConf);
    guildConfs.forEach((config) => {
      config.delKey(key);
    });
    return defaultConf;
  }

  /**
   * Inserts a guild into the guildConfs map and deletes the configuration JSON. This should never be called by anyone, this is purely for the guildCreate event.
   * @param {Guild} guild The Guild being inserted into the map.
   * @returns {string}
   * @static
   */
  static insert(guild) {
    if (!guild) return "Please specify a guild to remove.";
    guildConfs.set(guild.id, new Config(guild.client, guild, defaultConf));
    fs.outputJSON(`${dataDir}${path.sep}${guild.id}.json`, guildConfs.get(guild.id));
    return `Inserted ${guild.name} succesfully.`;
  }

  /**
   * Removes a guild from the guildConfs map and deletes the configuration JSON. This should never be called by anyone, this is purely for the guildDelete event.
   * @param {Guild} guild The guild being removed from the map.
   * @returns {string}
   * @static
   */
  static remove(guild) {
    if (!guild) return "Please specify a guild to remove.";
    guildConfs.delete(guild.id);
    fs.remove(path.resolve(`${dataDir}${path.sep}${guild.id}.json`));
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
      prefix: { type: client.config.prefix.constructor.name, data: client.config.prefix },
      disabledCommands: { type: "Array", data: [] },
      modRole: { type: "String", data: "Mods" },
      adminRole: { type: "String", data: "Devs" },
      lang: { type: "String", data: "en" },
    };
    dataDir = path.resolve(`${client.clientBaseDir}${path.sep}bwd${path.sep}conf`);
    fs.ensureFile(`${dataDir}${path.sep}${defaultFile}`).catch(err => client.emit("log", err, "error"));
    fs.readJSON(path.resolve(`${dataDir}${path.sep}${defaultFile}`))
  .then((conf) => {
    if (conf) defaultConf = conf;
  })
  .catch(() => fs.outputJSON(`${dataDir}${path.sep}${defaultFile}`, defaultConf));
    client.guilds.forEach((guild) => {
      fs.readJSON(path.resolve(`${dataDir}${path.sep}${guild.id}.json`))
  .then((thisConf) => {
    guildConfs.set(guild.id, new Config(client, guild, thisConf));
  }).catch(() => {
    guildConfs.set(guild.id, new Config(client, guild, defaultConf));
  });
    });
    return null;
  }

  static save(dir, id) {
    const config = guildConfs.get(id);
    for (const prop in config) {
      config[prop].data = config[prop]._data;
      delete config[prop]._data;
    }
    fs.outputJSONAsync(path.resolve(`${dir}${path.sep}${id}.json`), guildConfs.get(id));
  }
}

module.exports = Config;
module.exports.guildConfs = guildConfs;
module.exports.defaultConf = defaultConf;
