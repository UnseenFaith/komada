const Resolver = require("./Resolver.js");
const CacheManager = require("./cacheManager.js");
const SchemaManager = require("./schemaManager.js");

/* eslint-disable no-restricted-syntax */
module.exports = class SettingGateway extends CacheManager {
  constructor(client) {
    super(client);

    /** @type {Client} */
    this.client = client;

    /** @type {string} */
    this.engine = client.config.provider.engine || "json";

    this.resolver = new Resolver(client);
    this.schemaManager = new SchemaManager(this.client);
  }

  /**
   * Initialize the configuration for all Guilds.
   * @returns {void}
   */
  async init() {
    this.provider = this.client.providers.get(this.engine);
    if (!this.provider) throw `This provider (${this.engine}) does not exist in your system.`;
    await this.schemaManager.init();
    this.sql = this.provider.conf.sql;
    if (!(await this.provider.hasTable("guilds"))) {
      const SQLCreate = this.sql ? this.buildSQLSchema(this.schema) : undefined;
      await this.provider.createTable("guilds", SQLCreate);
    }
    const data = await this.provider.getAll("guilds");
    if (this.sql) {
      this.initDeserialize();
      for (let i = 0; i < data.length; i++) this.deserializer(data[i]);
    }
    if (data[0]) for (const key of data) super.set(key.id, key);
  }

  /**
   * [SQL ONLY] Init the deserialization keys for SQL providers.
   * @returns {void}
   */
  initDeserialize() {
    this.deserializeKeys = [];
    for (const [key, value] of Object.entries(this.schema)) {
      if (value.array === true) this.deserializeKeys.push(key);
    }
  }

  /**
   * [SQL ONLY] Deserialize stringified objects.
   * @param {Object} data The GuildSettings object.
   * @return {void}
   */
  deserializer(data) {
    const deserialize = this.deserializeKeys;
    for (let i = 0; i < deserialize.length; i++) data[deserialize[i]] = JSON.parse(data[deserialize[i]]);
  }

  buildSQLSchema(schema) {
    const constants = this.provider.CONSTANTS;
    if (!constants) {
      this.client.emit("log", "This SQL Provider does not seem to have a CONSTANTS exports. Using built-in schema.", "error");
      return ["id TEXT NOT NULL UNIQUE", `prefix TEXT NOT NULL DEFAULT '${this.defaults.prefix}'`, "adminRole TEXT", "modRole TEXT", "disabledCommands TEXT DEFAULT '[]'"];
    }
    const output = ["id TEXT NOT NULL UNIQUE"];
    const selectType = value => constants[value.type] || "TEXT";
    let sanitize = this.provider.sanitize;
    if (!this.provider.sanitize) {
      this.client.emit("log", "This SQL Provider does not seem to have a sanitize exports. It might corrupt.", "error");
      sanitize = value => value;
    }
    for (const [key, value] of Object.entries(schema)) {
      output.push(`${key} ${selectType(value.type)}${value.default ? ` NOT NULL DEFAULT ${sanitize(value.default)}` : ""}`);
    }

    return output;
  }

  /**
   * Get the current DataSchema.
   * @readonly
   * @returns {Object}
   */
  get schema() {
    return this.schemaManager.schema;
  }

  /**
   * Get the default values from the current DataSchema.
   * @readonly
   * @returns {Object}
   */
  get defaults() {
    return this.schemaManager.defaults;
  }

  /**
   * Create a new Guild entry for the configuration.
   * @param {Guild|Snowflake} guild The Guild object or snowflake.
   * @returns {void}
   */
  async create(guild) {
    const target = await this.validateGuild(guild);
    await this.provider.create("guilds", target.id, this.schemaManager.defaults);
    super.set(target.id, this.schemaManager.defaults);
  }

  /**
   * Remove a Guild entry from the configuration.
   * @param {Snowflake} guild The Guild object or snowflake.
   * @returns {void}
   */
  async destroy(guild) {
    await this.provider.delete("guilds", guild);
    super.delete("guilds", guild);
  }

  /**
   * Get a Guild entry from the configuration.
   * @param {(Guild|Snowflake)} guild The Guild object or snowflake.
   * @returns {Object}
   */
  get(guild) {
    if (guild === "default") return this.schemaManager.defaults;
    return super.get(guild) || this.schemaManager.defaults;
  }

  /**
   * Sync either all Guild entries from the configuration, or a single one.
   * @param {(Guild|Snowflake)} [guild=null] The configuration for the selected Guild, if specified.
   * @returns {void}
   */
  async sync(guild = null) {
    if (!guild) {
      const data = await this.provider.getAll("guilds");
      if (this.sql) for (let i = 0; i < data.length; i++) this.deserializer(data[i]);
      for (const key of data) super.set(key.id, key);
      return;
    }
    const target = await this.validateGuild(guild);
    const data = await this.provider.get("guilds", target.id);
    if (this.sql) this.deserializer(data);
    await super.set(target.id, data);
  }

  /**
   * Reset a key's value to default from a Guild configuration.
   * @param {(Guild|Snowflake)} guild The Guild object or snowflake.
   * @param {string} key The key to reset.
   * @returns {*}
   */
  async reset(guild, key) {
    const target = await this.validateGuild(guild);
    if (!(key in this.schema)) throw `The key ${key} does not exist in the current data schema.`;
    const defaultKey = this.schema[key].default;
    await this.provider.update("guilds", target.id, { [key]: defaultKey });
    this.sync(target.id);
    return defaultKey;
  }

  /**
   * Update the configuration from a Guild configuration.
   * @param {(Guild|Snowflake)} guild The Guild object or snowflake.
   * @param {string} key The key to update.
   * @param {any} data The new value for the key.
   * @returns {any}
   */
  async update(guild, key, data) {
    if (!(key in this.schema)) throw `The key ${key} does not exist in the current data schema.`;
    const target = await this.validateGuild(guild);
    const result = await this.parse(target, this.schema[key], data);
    await this.provider.update("guilds", target.id, { [key]: result });
    await this.sync(target.id);
    return result;
  }

  async updateArray(guild, type, key, data) {
    if (!["add", "remove"].includes(type)) throw "The type parameter must be either add or remove.";
    if (!(key in this.schema)) throw `The key ${key} does not exist in the current data schema.`;
    if (!this.schema[key].array) throw `The key ${key} is not an Array.`;
    if (data === undefined) throw "You must specify the value to add or filter.";
    const target = await this.validateGuild(guild);
    const result = await this.parse(target, this.schema[key], data);
    const cache = this.get(target.id);
    if (type === "add") {
      if (cache[key].includes(result)) throw `The value ${data} for the key ${key} already exists.`;
      cache[key].push(result);
      await this.provider.update("guilds", target.id, { [key]: cache[key] });
      await this.sync(target.id);
      return result;
    }
    if (!cache[key].includes(result)) throw `The value ${data} for the key ${key} does not exist.`;
    cache[key] = cache[key].filter(v => v !== result);
    await this.provider.update("guilds", target.id, { [key]: cache[key] });
    await this.sync(target.id);
    return true;
  }

  async parse(guild, { type, min, max }, data) {
    switch (type) {
      case "User": {
        const result = await this.resolver.user(data);
        if (!result) throw "This key expects a User Object or ID.";
        return result.id;
      }
      case "Channel": {
        const result = await this.resolver.channel(data);
        if (!result) throw "This key expects a Channel Object or ID.";
        return result.id;
      }
      case "Guild": {
        const result = await this.resolver.guild(data);
        if (!result) throw "This key expects a Guild ID.";
        return result.id;
      }
      case "Role": {
        const result = await this.resolver.role(data, guild) || guild.roles.find("name", data);
        if (!result) throw "This key expects a Role Object or ID.";
        return result.id;
      }
      case "Boolean": {
        const result = await this.resolver.boolean(data);
        if (!result) throw "This key expects a Boolean.";
        return result;
      }
      case "String": {
        const result = await this.resolver.string(data);
        SettingGateway.maxOrMin(result.length, min, max).catch((e) => { throw `The string length must be ${e} characters.`; });
        return result;
      }
      case "Integer": {
        const result = await this.resolver.integer(data);
        if (!result) throw "This key expects an Integer value.";
        SettingGateway.maxOrMin(result, min, max).catch((e) => { throw `The integer value must be ${e}.`; });
        return result;
      }
      case "Float": {
        const result = await this.resolver.float(data);
        if (!result) throw "This key expects a Float value.";
        SettingGateway.maxOrMin(result, min, max).catch((e) => { throw `The float value must be ${e}.`; });
        return result;
      }
      case "url": {
        const result = await this.resolver.url(data);
        if (!result) throw "This key expects an URL (Uniform Resource Locator).";
        return result;
      }
      case "Command": {
        const command = this.client.commands.get(data.toLowerCase()) || this.client.commands.get(this.client.aliases.get(data.toLowerCase()));
        if (!command) throw "This key expects a Command.";
        return command.help.name;
      }
      // no default
    }
    return null;
  }

  /**
   * Check if the input is valid with min and/or max values.
   * @static
   * @param {any} value The value to check.
   * @param {?number} min Min value.
   * @param {?number} max Max value.
   * @returns {?boolean}
   */
  static async maxOrMin(value, min, max) {
    if (min && max) {
      if (value >= min && value <= max) return true;
      if (min === max) throw `exactly ${min}`;
      throw `between ${min} and ${max}`;
    } else if (min) {
      if (value >= min) return true;
      throw `longer than ${min}`;
    } else if (max) {
      if (value <= max) return true;
      throw `shorter than ${max}`;
    }
    return null;
  }

  /**
   * Checks if a Guild is valid.
   * @param {(Guild|Snowflake)} guild The Guild object or snowflake.
   * @returns {Guild}
   */
  async validateGuild(guild) {
    const result = await this.resolver.guild(guild);
    if (!result) throw "The parameter <Guild> expects either a Guild or a Guild Object.";
    return result;
  }
};
