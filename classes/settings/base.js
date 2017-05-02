const { Client, Guild } = require("discord.js");

class Base {
  constructor() {
    throw Error("You cannot construct this class.");
  }

  fetch(guild, settings) {
    if (!(guild instanceof Guild)) throw Error(`${this.constructor.name} did not provide a valid Guild to fetch.`);
    if (typeof settings !== "object" && (!(settings instanceof Array))) throw Error(`${this.constructor.name} did not provide a valid settings object.`);
    return new Proxy(settings, this._handler(guild.client, guild)); // eslint-disable-line
  }

  _handler(client, guild) {
    if (!(client instanceof Client)) throw Error(`${this.constructor.name} did not provide a valid Client object.`);
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

  /* other defualt methods here */
}

module.exports = Base;
