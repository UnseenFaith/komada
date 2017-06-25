const { sep, resolve } = require("path");
const fs = require("fs-nextra");

const validTypes = ["User", "Channel", "Guild", "Role", "Boolean", "String", "Integer", "Float", "url"];

class SchemaManager {

  constructor(client) {
    this.client = client;
    this.schema = {};
    this.defaults = {};
  }

  /**
   * Initialize the SchemaManager.
   * @returns {void}
   */
  async init() {
    const baseDir = resolve(`${this.client.clientBaseDir}${sep}bwd`);
    await fs.ensureDir(baseDir);
    this.filePath = `${baseDir + sep}schema.json`;
    const schema = await fs.readJSON(this.filePath)
      .catch(() => fs.outputJSON(this.filePath, this.defaultDataSchema).then(() => this.defaultDataSchema));
    return this.validate(schema);
  }

  /**
   * Validate the Schema manager.
   * @param {Object} schema The Schema object that will be used for the configuration system.
   * @memberof SchemaManager
   */
  validate(schema) {
    if (!("prefix" in schema)) {
      this.client.emit("log", "The key 'prefix' is obligatory", "error");
      schema.prefix = {
        type: "String",
        default: this.client.config.prefix,
      };
    }
    for (const [key, value] of Object.entries(schema)) { // eslint-disable-line no-restricted-syntax
      if (value instanceof Object && !(value instanceof Array) && "type" in value && "default" in value) {
        this.schema[key] = value;
        this.defaults[key] = value.default;
      } else {
        this.client.emit("log", `The value for ${key} is not supported. It must be an object with type and default properties.`, "error");
      }
    }
  }

  add(key, options, force = false) {
    if (key in this.schema) throw `The key ${key} already exists in the current schema.`;
    if (!options.type) throw "The option type is required.";
    if (!validTypes.includes(options.type)) throw `The type ${options.type} is not supported.`;
    if (!options.default) options.default = null;
    if ("min" in options && isNaN(options.min)) throw "The option min must be a number.";
    if ("max" in options && isNaN(options.max)) throw "The option max must be a number.";
    this.schema[key] = options;
    this.defaults[key] = options.default;
    if (force) this.force("add", key);
    return fs.outputJSON(this.filePath, this.schema);
  }

  remove(key, force = false) {
    if (key === "prefix") throw "You can't remove the prefix.";
    delete this.schema[key];
    if (force) this.force("delete", key);
    return fs.outputJSON(this.filePath, this.schema);
  }

  async force(action, key) {
    const data = this.client.settingGateway.getAll();
    let value;
    if (action === "reset" || action === "add") value = this.defaults[key];
    await Promise.all(data.map(async (obj) => {
      const object = obj;
      if (action === "delete") delete object[key];
      else object[key] = value;
      if (obj.id) await this.client.settingGateway.provider.replace("guilds", obj.id, object);
      return true;
    }));
    return this.client.settingGateway.sync();
  }

  /**
   * Get the default DataSchema from Komada.
   * @readonly
   * @memberof SchemaManager
   * @returns {Object}
   */
  get defaultDataSchema() {
    return {
      prefix: {
        type: "String",
        default: this.client.config.prefix,
      },
      modRole: {
        type: "Role",
        default: null,
      },
      adminRole: {
        type: "Role",
        default: null,
      },
    };
  }
}

module.exports = SchemaManager;
