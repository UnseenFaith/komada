const { resolve } = require("path");
const fs = require("fs-nextra");
const CacheManager = require("./cacheManager");

const validTypes = ["User", "Channel", "Guild", "Role", "Boolean", "String", "Integer", "Float", "url", "Command"];

class SchemaManager extends CacheManager {
  constructor(client) {
    super(client);
    this.schema = {};
    this.defaults = {};
  }

  /**
   * Initialize the SchemaManager.
   * @returns {void}
   */
  async initSchema() {
    const baseDir = resolve(this.client.clientBaseDir, "bwd");
    await fs.ensureDir(baseDir);
    this.filePath = resolve(baseDir, `${this.type}Schema.json`);
    const schema = await fs.readJSON(this.filePath)
      .catch(() => fs.outputJSON(this.filePath, this.defaultDataSchema).then(() => this.defaultDataSchema));
    return this.validateSchema(schema);
  }

  /**
   * Validate the Schema manager.
   * @param {Object} schema The Schema object that will be used for the configuration system.
   * @returns {void}
   */
  validateSchema(schema) {
    for (const [key, value] of Object.entries(schema)) { // eslint-disable-line no-restricted-syntax
      if (value instanceof Object && "type" in value && "default" in value) {
        if (value.array && !(value.default instanceof Array)) {
          this.client.emit("log", `The default value for ${key} must be an array.`, "error");
          continue;
        }
        this.schema[key] = value;
        this.defaults[key] = value.default;
      } else {
        this.client.emit("log", `The type value for ${key} is not supported. It must be an object with type and default properties.`, "error");
      }
    }
  }

  /**
   * Add a new key to the schema.
   * @param {string} key The key to add.
   * @param {Object} options Options for the key.
   * @param {string} options.type The type for the key.
   * @param {string} options.default The default value for the key.
   * @param {boolean} options.array Whether the key should be stored as Array or not.
   * @param {number} options.min The min value for the key (String.length for String, value for number).
   * @param {number} options.max The max value for the key (String.length for String, value for number).
   * @param {boolean} [force=false] Whether this change should modify all configurations or not.
   * @returns {void}
   */
  add(key, options, force = false) {
    if (key in this.schema) throw `The key ${key} already exists in the current schema.`;
    if (!options.type) throw "The option type is required.";
    if (!validTypes.includes(options.type)) throw `The type ${options.type} is not supported.`;
    if ("min" in options && isNaN(options.min)) throw "The option min must be a number.";
    if ("max" in options && isNaN(options.max)) throw "The option max must be a number.";
    if (options.array) {
      if (options.array.constructor.name !== "Boolean") throw "The option array must be a boolean.";
      if (!options.default) options.default = [];
      else if (!(options.default instanceof Array)) throw "The option default must be an array if the array option is set to true.";
    } else {
      if (!options.default) options.default = null;
      options.array = false;
    }
    if (this.sql) options.sql = this.sql.buildSingleSQLSchema(options);
    this.schema[key] = options;
    this.defaults[key] = options.default;
    if (force) this.force("add", key);
    return fs.outputJSON(this.filePath, this.schema);
  }

  /**
   * Remove a key from the schema.
   * @param {string} key The key to remove.
   * @param {boolean} [force=false] Whether this change should modify all configurations or not.
   * @returns {void}
   */
  remove(key, force = false) {
    delete this.schema[key];
    if (force) this.force("delete", key);
    return fs.outputJSON(this.filePath, this.schema);
  }

  /**
   * Modify all configurations.
   * @param {string} action Whether reset, add, or delete.
   * @param {string} key The key to update.
   * @returns {void}
   */
  async force(action, key) {
    if (this.sql) {
      await this.sql.updateColumns(this.schema, this.defaults, key);
    }
    const data = this.getAll(this.type);
    let value;
    if (action === "add") value = this.defaults[key];
    await Promise.all(data.map(async (obj) => {
      const object = obj;
      if (action === "delete") delete object[key];
      else object[key] = value;
      if (obj.id) await this.provider.replace(this.type, obj.id, object);
      return true;
    }));
    return this.sync();
  }

/**
  * Return a blank object if no default is set.
  * @readonly
  */
  get defaultDataSchema() {
    return {};
  }
}

module.exports = SchemaManager;
