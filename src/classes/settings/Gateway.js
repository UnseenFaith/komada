const SQL = require("../sql");

/**
 * The gateway for this settings instance. The gateway handles all the creation and setting of non-default entries, along with saving.
 */

class Gateway {

  /**
   * Constructs our instance of Gateway
   * @param {any} settings The settings that created this gateway.
   * @param {any} validateFunction The validation function used to validate user input.
   */
  constructor(settings, validateFunction) {
    /**
     * The Settings class that this gateway is a part of.
     * @name Gateway.settings
     * @type {Settings}
     * @readonly
     */
    Object.defineProperty(this, "settings", { value: settings });

    /**
     * The provider engine that will handle saving and getting all data for this instance.
     * @type {string}
     */
    this.engine = this.client.config.provider.engine;

    if (!this.provider) throw `This provider(${this.engine}) does not exist in your system.`;

    /**
     * If the provider is SQL, this property will ensure data is serialized and deserialized.
     * @type {string}
     */
    this.sql = this.provider.conf.sql ? new SQL(this.client, this) : null;

    /**
     * The function validator for this gateway.
     * @type {function}
     */
    this.validate = validateFunction;
  }

  /**
   * Initializes the gateway, creating tables, ensuring the schema exists, and caching values.
   * @param {Schema} schema The Schema object, validated from settings.
   * @returns {void}
   */
  async init(schema) {
    if (!(await this.provider.hasTable(this.type))) await this.provider.createTable(this.type, this.sql ? this.sql.buildSQLSchema(schema) : undefined);
    const data = await this.provider.getAll(this.type);
    if (this.sql) {
      this.sql.initDeserialize();
      for (let i = 0; i < data.length; i++) this.sql.deserializer(data[i]);
    }
    for (const key of data) this.cache.set(this.type, key.id, key); // eslint-disable-line
  }

  /**
   * Creates a new entry in the cache.
   * @param {Object|string} input An object containing a id property, like discord.js objects, or a string.
   */
  async create(input) {
    const target = await this.validate(input).then(output => (output.id || output));
    await this.provider.create(this.type, target, this.schema.defaults);
    this.cache.set(this.type, target, this.schema.defaults);
  }

  /**
   * Removes an entry from the cache.
   * @param {Object|string} input An object containing a id property, like discord.js objects, or a string.
   */
  async destroy(input) {
    const target = await this.validate(input).then(output => (output.id || output));
    await this.provider.delete(this.type, target);
    this.cache.delete(this.type, target);
  }

  /**
   * Gets an entry from the cache
   * @param {string} input The key you are you looking for.
   * @returns {Schema}
   */
  get(input) {
    return input !== "default" ? this.cache.get(this.type, input) || this.schema.defaults : this.schema.defaults;
  }

  /**
   * Sync either all entries from the provider, or a single one.
   * @param {Object|string} [input=null] An object containing a id property, like discord.js objects, or a string.
   * @returns {void}
   */
  async sync(input = null) {
    if (!input) {
      const data = await this.provider.getAll(this.type);
      if (this.sql) for (let i = 0; i < data.length; i++) this.sql.deserializer(data[i]);
      for (const key of data) this.cache.set(this.type, key.id, key); // eslint-disable-line
      return;
    }
    const target = await this.validate(input).then(output => (output.id || output));
    const data = await this.provider.get(this.type, target);
    if (this.sql) this.sql.deserializer(data);
    await this.cache.set(this.type, target, data);
  }

  /**
   * Reset a key's value to default from a entry.
   * @param {Object|string} input An object containing a id property, like Discord.js objects, or a string.
   * @param {string} key The key to reset.
   * @returns {any}
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
   * @param {Object|string} input An object or string that can be parsed by this instance's resolver.
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

  /**
   * Creates the settings if it did not exist previously.
   * @param {Object|string} target An object or string that can be parsed by this instance's resolver.
   * @returns {true}
   */
  async ensureCreate(target) {
    if (typeof target !== "string") throw `Expected input type string, got ${typeof target}`;
    let exists = this.cache.has(this.type, target);
    if (exists instanceof Promise) exists = await exists;
    if (exists === false) return this.create(target);
    return true;
  }

  /**
   * Update an array from the a Guild's configuration.
   * @param {Object|string} input An object containing a id property, like discord.js objects, or a string.
   * @param {string} type Either 'add' or 'remove'.
   * @param {string} key The key from the Schema.
   * @param {any} data The value to be added or removed.
   * @param {Object|string} [guild=null] The guild for this setting, useful for when the settings aren't aimed for guilds
   * @returns {boolean}
   */
  async updateArray(input, type, key, data, guild = null) {
    if (!["add", "remove"].includes(type)) throw "The type parameter must be either add or remove.";
    if (!(key in this.schema)) throw `The key ${key} does not exist in the current data schema.`;
    if (!this.schema[key].array) throw `The key ${key} is not an Array.`;
    if (data === undefined) throw "You must specify the value to add or filter.";
    const target = await this.validate(input).then(output => (output.id || output));
    guild = await this.resolver.guild(guild || target);
    let result = await this.resolver[this.schema[key].type.toLowerCase()](data, guild, this.schema[key]);
    if (result.id) result = result.id;
    let cache = this.cache.get(this.type, target);
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

  /**
   * The client this SettingGateway was created with.
   * @type {KomadaClient}
   * @readonly
   */
  get client() {
    return this.settings.client;
  }

  /**
   * The resolver instance this SettingGateway uses to parse the data.
   * @type {Resolver}
   * @readonly
   */
  get resolver() {
    return this.settings.resolver;
  }

  /**
   * The provider this SettingGateway instance uses for the persistent data operations.
   * @type {Provider}
   * @readonly
   */
  get provider() {
    return this.client.providers.get(this.engine);
  }

  /**
   * The schema this gateway instance is handling.
   * @type {Schema}
   * @readonly
   */
  get schema() {
    return this.settings.schema;
  }

  /**
   * The cache created with this instance
   * @type {Cache}
   * @readonly
   */

  get cache() {
    return this.settings.cache;
  }

  /**
   * The type of settings (or name).
   * @type {string}
   * @readonly
   */
  get type() {
    return this.settings.type;
  }

}

module.exports = Gateway;
