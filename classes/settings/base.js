class Base {
  constructor() {
    if (this.constructor.name === "Base") throw Error("You cannot construct a new class with the Base.");
  }

  init() {
    throw Error(`${this.constructor.name} does not have a init function.`);
  }

  fetch(guild, settings) {
    if (typeof settings !== "object" && (!(settings instanceof Array))) throw Error(`${this.constructor.name} did not provide a valid settings object.`);
    return new Proxy(settings, this._handler(this.client, guild || null)); // eslint-disable-line
  }

  _handler(client, guild) { // eslint-disable-line
    return {
      get: (setting, key) => {
        if (key === "length" || key === "size") return Object.keys(setting).length;
        if (setting[key] === undefined) return undefined; // eslint-disable-line
        switch (setting[key].type) {
          case "Array":
          case "Boolean":
          case "Number":
          case "String":
            return setting[key].data;
          case "Channel":
            return client.channels.get(setting[key].data);
          case "Role":
            if (!guild) return setting[key].data;
            return guild.roles.get(setting[key].data) || guild.roles.find("name", setting[key].data);
          default:
            return null;
        }
      },
      set: () => {
        throw "Use the set function for settings to set values that you want the settings to point to."; // eslint-disable-line
      },
    };
  }

  get _default() {
    return {
      prefix: { type: this.client.config.prefix.constructor.name, data: this.client.config.prefix },
      disabledCommands: { type: "Array", data: [] },
      modRole: { type: "Role", data: "Mods" },
      adminRole: { type: "Role", data: "Devs" },
    };
  }

  /* other defualt methods here */
}

module.exports = Base;
