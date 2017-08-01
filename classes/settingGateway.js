const SchemaManager = require("./schemaManager");
const SQL = require("./sql");

/* eslint-disable no-restricted-syntax, class-methods-use-this */
module.exports = class SettingGateway extends SchemaManager {

  constructor(store, type, validateFunction, schema) {
    super(store.client);

    /** @type {SettingCache} */
    Object.defineProperty(this, "store", { value: store });

    /** @type {string} */
    this.type = type;

    /** @type {string} */
    this.engine = this.client.config.provider.engine || "json";

    if (!this.provider) throw `This provider (${this.engine}) does not exist in your system.`;

    this.sql = this.provider.conf.sql ? new SQL(this.client, this, this.provider) : false;

    this.validate = validateFunction;

    this.defaultDataSchema = schema;
  }

  /**
   * Initialize the configuration for this gateway.
   * @returns {void}
   */
  async init() {
    await this.initSchema();
    if (!(await this.provider.hasTable(this.type))) {
      const SQLCreate = this.sql ? this.sql.buildSQLSchema(this.schema) : undefined;
      await this.provider.createTable(this.type, SQLCreate);
    }
    const data = await this.provider.getAll(this.type);
    if (this.sql) {
      this.sql.initDeserialize();
      for (let i = 0; i < data.length; i++) this.sql.deserializer(data[i]);
    }
    if (data[0]) for (const key of data) super.set(key.id, key);
  }

  /**
   * Create a new entry in the configuration.
   * @param {Object|string} input An object containing a id property, like discord.js objects, or a string.
   * @returns {void}
   */
  async create(input) {
    const target = await this.validate(input).then(output => (output.id || output));
    await this.provider.create(this.type, target, this.defaults);
    super.set(target, this.defaults);
  }

  /**
   * Remove an entry from the configuration.
   * @param {string} input A key to delete from the cache.
   * @returns {void}
   */
  async destroy(input) {
    await this.provider.delete(this.type, input);
    super.delete(this.type, input);
  }

  /**
   * Get an entry from the cache.
   * @param {string} input A key to get the value for.
   * @returns {Object}
   */
  get(input) {
    if (input === "default") return this.defaults;
    return super.get(input) || this.defaults;
  }

  /**
   * Get a Resolved Guild entry from the configuration.
   * @param {(Guild|Snowflake)} guild The Guild object or snowflake.
   * @returns {Object}
   */
  async getResolved(guild) {
    guild = await this.validate(guild);
    let settings = this.get(guild.id);
    if (settings instanceof Promise) settings = await settings;
    const resolved = await Promise.all(Object.entries(settings).map(([key, data]) => {
      if (this.schema[key] && this.schema[key].array) return { [key]: Promise.all(data.map(entry => this.resolver[this.schema[key].type.toLowerCase()](entry, guild, this.schema[key]))) };
      return { [key]: this.schema[key] && data ? this.resolver[this.schema[key].type.toLowerCase()](data, guild, this.schema[key]) : data };
    }));
    return Object.assign({}, ...resolved);
  }

  /**
   * Sync either all entries from the configuration, or a single one.
   * @param {Object|string} [input=null] An object containing a id property, like discord.js objects, or a string.
   * @returns {void}
   */
  async sync(input = null) {
    if (!input) {
      const data = await this.provider.getAll(this.type);
      if (this.sql) for (let i = 0; i < data.length; i++) this.sql.deserializer(data[i]);
      for (const key of data) super.set(key.id, key);
      return;
    }
    const target = await this.validate(input).then(output => (output.id || output));
    const data = await this.provider.get(this.type, target);
    if (this.sql) this.sql.deserializer(data);
    await super.set(target, data);
  }

  /**
   * Reset a key's value to default from a entry.
   * @param {Object|string} input An object containing a id property, like discord.js objects, or a string.
   * @param {string} key The key to reset.
   * @returns {*}
   */
  async reset(input, key) {
    const target = await this.validate(input).then(output => (output.id || output));
    if (!(key in this.schema)) throw `The key ${key} does not exist in the current data schema.`;
    const defaultKey = this.schema[key].default;
    await this.provider.update(this.type, target, { [key]: defaultKey });
    this.sync(target);
    return defaultKey;
  }

  /**
   * Updates an entry.
   * @param {Object|string} input An object containing a id property, like discord.js objects, or a string.
   * @param {Object} object An object with pairs of key/value to update.
   * @param {Object|string} [guild=null] A Guild resolvable, useful for when the instance of SG doesn't aim for Guild settings.
   * @returns {Object}
   */
  async update(input, object, guild = null) {
    const target = await this.validate(input).then(output => output.id || output);
    guild = await this.resolver.guild(guild || target);

    const resolved = await Promise.all(Object.entries(object).map(async ([key, value]) => {
      if (!(key in this.schema)) throw `The key ${key} does not exist in the current data schema.`;
      return this.resolver[this.schema[key].type.toLowerCase()](value, guild, this.schema[key])
        .then(res => ({ [key]: res.id || res }));
    }));

    const result = Object.assign({}, ...resolved);

    await this.ensureCreate(target);
    await this.provider.update(this.type, target, result);
    await this.sync(target);
    return result;
  }

  async ensureCreate(target) {
    if (typeof target !== "string") throw `Expected input type string, got ${typeof target}`;
    let cache = this.get(target);
    if (cache instanceof Promise) cache = await cache;
    if (!("id" in cache)) return this.create(target);
    return true;
  }

  /**
   * Update an array from the a Guild's configuration.
   * @param {Object|string} input An object containing a id property, like discord.js objects, or a string.
   * @param {string} type Either 'add' or 'remove'.
   * @param {string} key The key from the Schema.
   * @param {any} data The value to be added or removed.
   * @returns {boolean}
   */
  async updateArray(input, type, key, data) {
    if (!["add", "remove"].includes(type)) throw "The type parameter must be either add or remove.";
    if (!(key in this.schema)) throw `The key ${key} does not exist in the current data schema.`;
    if (!this.schema[key].array) throw `The key ${key} is not an Array.`;
    if (data === undefined) throw "You must specify the value to add or filter.";
    const target = await this.validate(input).then(output => (output.id || output));
    let result = await this.resolver[this.schema[key].type.toLowerCase()](data, this.client.guilds.get(target), this.schema[key]);
    if (result.id) result = result.id;
    let cache = this.get(target);
    if (cache instanceof Promise) cache = await cache;
    if (type === "add") {
      if (cache[key].includes(result)) throw `The value ${data} for the key ${key} already exists.`;
      cache[key].push(result);
      await this.provider.update(this.type, target, { [key]: cache[key] });
      await this.sync(target);
      return result;
    }
    if (!cache[key].includes(result)) throw `The value ${data} for the key ${key} does not exist.`;
    cache[key] = cache[key].filter(v => v !== result);

    await this.ensureCreate(target);
    await this.provider.update(this.type, target, { [key]: cache[key] });
    await this.sync(target);
    return true;
  }

  get client() {
    return this.store.client;
  }

  get resolver() {
    return this.store.resolver;
  }

  get provider() {
    return this.client.providers.get(this.engine);
  }

};
