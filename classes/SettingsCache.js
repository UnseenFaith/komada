const SettingGateway = require("./settingGateway");
const SettingResolver = require("./settingResolver");

class SettingsCache {
  constructor(client) {
    Object.defineProperty(this, "client", { value: client });
    this.resolver = new SettingResolver(client);

    this.guilds = new SettingGateway();
  }

  async add(name, validateFunction, schema = {}) {
    if (!name || typeof name !== "string") throw "You must pass a name for your new gateway and it must be a string.";
    if (typeof validateFunction !== "function") throw "You must pass a validate function.";
    if (name in this) throw "There is already a Gateway with that name.";
    const hasPrototype = Object.prototype.hasOwnProperty.call(validateFunction, "prototype");
    if (!hasPrototype) throw "You did not create a valid validate function. You must use the function keyword or constructor, and may not use arrow functions.";
    if (schema.constructor.name !== "Object") throw "Schema must be a valid Schema object or left undefined for an empty object.";
    this[name] = new SettingGateway(this, name, validateFunction, schema);
    await this[name].init();
    return this[name];
  }
}

module.exports = SettingsCache;
