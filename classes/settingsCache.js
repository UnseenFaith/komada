const SettingGateway = require("./settingGateway");
const SettingResolver = require("./settingResolver");

class SettingsCache {

  constructor(client) {
    Object.defineProperty(this, "client", { value: client });
    this.resolver = new SettingResolver(client);

    this.guilds = new SettingGateway(this, "guilds", this.validate.bind(null, this.resolver), this.defaultDataSchema);
  }

  async add(name, validateFunction, schema = {}) {
    if (!name || typeof name !== "string") throw "You must pass a name for your new gateway and it must be a string.";
    if (name in this) throw "There is already a Gateway with that name.";
    if (typeof validateFunction !== "function") throw "You must pass a validate function.";
    validateFunction = validateFunction.bind(null, this.resolver);
    if (schema.constructor.name !== "Object") throw "Schema must be a valid object or left undefined for an empty object.";
    this[name] = new SettingGateway(this, name, validateFunction, schema);
    await this[name].init();
    return this[name];
  }

  async validate(resolver, guild) { // eslint-disable-line
    const result = await resolver.guild(guild);
    if (!result) throw "The parameter <Guild> expects either a Guild ID or a Guild Object.";
    return result;
  }

  /**
   * Get the default DataSchema from Komada.
   * @readonly
   * @returns {Object}
   */
  get defaultDataSchema() {
    return {
      prefix: {
        type: "String",
        default: this.client.config.prefix,
        array: this.client.config.prefix.constructor.name === "Array",
        sql: `TEXT NOT NULL DEFAULT '${this.client.config.prefix.constructor.name === "Array" ? JSON.stringify(this.client.config.prefix) : this.client.config.prefix}'`,
      },
      modRole: {
        type: "Role",
        default: null,
        array: false,
        sql: "TEXT",
      },
      adminRole: {
        type: "Role",
        default: null,
        array: false,
        sql: "TEXT",
      },
      disabledCommands: {
        type: "Command",
        default: [],
        array: true,
        sql: "TEXT DEFAULT '[]'",
      },
    };
  }

}

module.exports = SettingsCache;
