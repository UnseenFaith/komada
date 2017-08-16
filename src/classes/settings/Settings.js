const Cache = require("./Cache");
const Gateway = require("./Gateway");
const Schema = require("./Schema");
const Resolver = require("../settingResolver");

class Settings {

  constructor(client, name, validate, schema) {
    /**
     * @type {string} The name or type of settings
     */
    this.type = name;

    /**
     * @type {Gateway} The gateway for this settings instance.
     */
    this.gateway = new Gateway(this, validate);

    /**
     * @type {Cache} The cache used to store data for this instance.
     */
    this.cache = new Cache(client, type); // will be replaced later with CacheProviders

    /**
     * @name Settings.schema
     * @type {Schema} The schema that we will use for this instance.
     */
    Object.defineProperty(this, "_schema", { value: schema });
    this.schema = null;

    /**
     * @type {SettingResolver} The settings resolver used for this instance.
     */
    this.resolver = new Resolver(client);

    /**
     * @type {string} The base directory where this instance will save to.
     */
    this.baseDir = resolve(this.client.clientBaseDir, "bwd");

    /**
     * @type {string} The path to the schema for this instance.
     */
    this.schemaPath = resolve(this.baseDir, `${this.type}_Schema.json`);
  }

  /**
   * Initializes all of our different components.
   */
  async init() {
    await fs.ensureDir(this.baseDir);
    const schema = await fs.readJSON(this.schemaPath)
      .catch(() => fs.outputJSONAtomic(this.filePath, this._schema).then(() => this._schema));
    await this.validateSchema(schema);
    await this.gateway.init(this.schema);
  }

  // BEGIN SCHEMA EXPOSURE //

  /**
   * Validates our schema. Ensures that the object was created correctly and will not break.
   * @param {object|Schema} schema
   */
  validateSchema(schema) {
    if (!(schema instanceof Schema)) schema = new Schema(schema);
    for (const [key, value] of Object.entries(schema)) {
      if (value instanceof Object && "type" in value && "default" in value) {
        if (value.array && !(value.default instanceof Array)) {
          this.client.emit("log", `The default value for ${key} must be an array.`, 'error');
          delete this.schema[key];
          continue;
        }
      } else {
        delete this.schema[key];
        this.client.emit("log", `The type value for ${key} is not supported. It must be an object with type and default properties.`, "error");
      }
    }
    this.schema = schema;
  }

  /**
   * @borrows Schema#add
   * @param {boolean} [force=true] Whether or not we should force update all settings.
   * @returns {Promise<void>}
   */
  async add(name, options, force = true) {
    this.schema.add(name, options);
    if (force) await this.force("add", key);
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
    if (!key in this.schema) throw `The key ${key} does not exist in the schema.`;
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
    if (this.sql) await this.gateway.sql.updateColumns(this.schema, this.schema.defaults, key);
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

  create(...args) {
    return this.gateway.create(...args);
  }

  destroy(...args) {
    return this.gateway.destroy(...args);
  }

  get(...args) {
    return this.gateway.get(...args);
  }

  reset(...args) {
    return this.gateway.reset(...args);
  }

  update(...args) {
    return this.gateway.update(...args);
  }

  updateArray(...args) {
    return this.gateway.update(...args);
  }

}

module.exports = Settings;
