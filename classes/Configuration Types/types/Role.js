const Config = require("../Config.js");
const Discord = require("discord.js");

class Role {
  constructor(conf, data) {
    Object.defineProperty(this, "_guild", { value: conf._guild });
    Object.defineProperty(this, "_dataDir", { value: conf._dataDir });
    Object.defineProperty(this, "_client", { value: conf._client });
    this.type = "Role";
    if (data instanceof Discord.Role) this._data = data.id;
    if (typeof data === "string") {
      const dataRole = this._guild.roles.get(data);
      if (dataRole) this._data = dataRole.id;
      else this._data = this._guild.roles.find(role => role.name === data).id || null;
    } else { this._data = null; }
  }

  get data() {
    return this._guild.roles.get(this._data);
  }

  set data(value) {
    if (value instanceof Discord.Role) {
      this._data = value.id;
    } else if (typeof value === "string") {
      const valueRole = this._guild.roles.get(value);
      if (valueRole) this._data = valueRole.id;
      else this._data = this._guild.roles.find(role => role.name === value).id || null;
    } else { this._data = null; }
    Config.save(this._dataDir, this._guild.id);
    return this;
  }
}

module.exports = Role;
