/* eslint-disable no-underscore-dangle */

const Cache = require("./Cache");
const Gateway = require("./Gateway");
const Schema = require("./Schema");
const Resolver = require("../settingResolver");
const { resolve } = require("path");
const fs = require("fs-nextra");

class Settings {
  /**
   * Creates a new settings instance.
   * @param {KomadaClient} client The Komada clien
   * @param {string} name The name of these new settings
   * @param {function} validate The validate function for gateway
   * @param {Schema|object} schema The schema object
   */
  constructor(client, name, validate, schema) {
    /**
     * The komada client.
     * @type {KomadaClient}
     */
    Object.defineProperty(this, "client", { value: client });

    /**
     * The name or type of settings
     * @type {string} 
     */
    this.type = name;

    /**
     * The gateway for this settings instance.
     * @type {Gateway}
     */
    this.gateway = new Gateway(this, validate);

    /**
     * The cache used to store data for this instance.
     * @type {Cache}
     */
    this.cache = new Cache(this, this.type); // will be replaced later with CacheProviders

    /**
     * The schema that we will use for this instance.
     * @name Settings#schema
     * @type {Schema}
     */
    Object.defineProperty(this, "_schema", { value: schema });
    this.schema = null;

    /**
     * The settings resolver used for this instance.
     * @type {SettingResolver}
     */
    this.resolver = new Resolver(client);

    /**
     * The base directory where this instance will save to.
     * @type {string}
     */
    this.baseDir = resolve(this.client.clientBaseDir, "bwd");

    /**
     * The path to the schema for this instance.
     * @type {string}
     */
    this.schemaPath = resolve(this.baseDir, `${this.type}_Schema.json`);
  }

  /**
   * Initializes all of our different components.
   */
  async init() {
    await fs.ensureDir(this.baseDir);
    const schema = await fs.readJSON(this.schemaPath)
      .catch(() => fs.outputJSONAtomic(this.schemaPath, this._schema).then(() => this._schema));
    await this.validateSchema(schema);
    await this.gateway.init(this.schema);
  }

  // BEGIN SCHEMA EXPOSURE //

  /**
   * Validates our schema. Ensures that the object was created correctly and will not break.
   * @param {Object|Schema} schema The schema we are validating.
   */
  validateSchema(schema) {
    if (!(schema instanceof Schema)) schema = new Schema(schema);
    for (const [key, value] of Object.entries(schema)) { // eslint-disable-line
      if (value instanceof Object && "type" in value && "default" in value) {
        if (value.type === "object") {
          schema[key] = new Schema(value);
          if (schema[key].some(v => v.type === "object")) this.validateSchema(schema[key]);
        } else {
          if (value.array && !(value.default instanceof Array)) {
            this.client.emit("log", `The default value for ${key} must be an array.`, "error");
            delete schema[key];
            continue;
          }
        }
      } else {
        delete schema[key];
        this.client.emit("log", `The type value for ${key} is not supported. It must be an object with type and default properties.`, "error");
      }
    }
    if (!this.schema) this.schema = schema;
  }

  /**
   * @param {string} name The name of the key you want to add.
   * @param {Schema.Options} options Schema options.
   * @param {boolean} [force=true] Whether or not we should force update all settings.
   * @returns {Promise<void>}
   */
  async add(name, options, force = true) {
    this.schema.add(name, options);
    if (force) await this.force("add", name);
    return fs.outputJSONAtomic(this.schemaPath, this.schema);
  }

  /**
   * Remove a key from the schema.
   * @param {string}  key The key to remove.
   * @param {boolean} [force=false] Whether this change should modify all configurations or not.
   * @returns {Promise<void>}
   * @example
   * // Remove a key called 'modlog'.
   * await client.settings.guilds.remove("modlog");
   */
  async remove(key, force = true) {
    if (!(key in this.schema)) throw `The key ${key} does not exist in the schema.`;
    delete this.schema[key];
    if (force) await this.force("delete", key);
    return fs.outputJSONAtomic(this.schemaPath, this.schema);
  }

  /**
   * Modify all configurations. Do NOT use this directly.
   * @param {string} action Whether reset, add, or delete.
   * @param {string} key The key to update.
   * @returns {Promise<void>}
   * @private
   */
  async force(action, key) {
    if (this.gateway.sql) await this.gateway.sql.updateColumns(this.schema, this.schema.defaults, key);
    const data = this.cache.getAll(this.type);
    let value;
    if (action === "add") value = this.schema.defaults[key];
    await Promise.all(data.map(async (obj) => {
      const object = obj;
      if (action === "delete") delete object[key]; else object[key] = value;
      if (obj.id) await this.gateway.provider.replace(this.type, obj.id, object);
      return true;
    }));
    return this.gateway.sync();
  }

  // BEGIN GATEWAY EXPOSURE //

  /**
   * Creates a new entry in the cache.
   * @param {Object|string} input An object containing a id property, like discord.js objects, or a string.
   */
  create(...args) {
    return this.gateway.create(...args);
  }

  /**
   * Removes an entry from the cache.
   * @param {Object|string} input An object containing a id property, like discord.js objects, or a string.
   */
  destroy(...args) {
    return this.gateway.destroy(...args);
  }

  /**
   * Gets an entry from the cache
   * @param {string} input The key you are you looking for.
   */
  get(...args) {
    return this.gateway.get(...args);
  }

  /**
   * Reset a key's value to default from a entry.
   * @param {Object|string} input An object containing a id property, like Discord.js objects, or a string.
   * @param {string} key The key to reset.
   * @returns {any}
   */
  reset(...args) {
    return this.gateway.reset(...args);
  }

  /**
   * Updates an entry.
   * @param {Object|string} input An object or string that can be parsed by this instance's resolver.
   * @param {Object} object An object with pairs of key/value to update.
   * @param {Object|string} [guild=null] A Guild resolvable, useful for when the instance of SG doesn't aim for Guild settings.
   * @returns {Object}
   */
  update(...args) {
    return this.gateway.update(...args);
  }

  /**
   * Update an array from the a Guild's configuration.
   * @param {Object|string} input An object containing a id property, like discord.js objects, or a string.
   * @param {string} type Either 'add' or 'remove'.
   * @param {string} key The key from the Schema.
   * @param {any} data The value to be added or removed.
   * @returns {boolean}
   */
  updateArray(...args) {
    return this.gateway.updateArray(...args);
  }

}

module.exports = Settings;
