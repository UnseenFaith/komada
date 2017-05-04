/* eslint-disable no-underscore-dangle */
const Base = require("./base.js");
const { sep } = require("path");
const sql = require("sql");

class SQL extends Base {
  constructor(client) {
    super();
    Object.defineProperty(this, "client", { value: client });
    Object.defineProperty(this, "_dataDir", { value: client.config.settingsDir || `${client.clientBaseDir}${sep}bwd${sep}settings` });
  }

  async init() {
    sql.open(`${this._dataDir}${sep}settings.sqlite`);
    for (const key in this._default) {
      switch (this._default[key].type) {
        case "Array":
        case "String":
        case "Role":
        case "Channel":
          await sql.run(`CREATE TABLE IF NOT EXISTS '${key.toLowerCase()}:${this._default[key].type.toLowerCase()}' (ID INT NOT NULL, GUILDID CHAR (25) NOT NULL, data CHAR (1000) NOT NULL, PRIMARY KEY (ID))`);
          break;
        case "Number":
          await sql.run(`CREATE TABLE IF NOT EXISTS '${key.toLowerCase()}:$${this._default[key].type.toLowerCase()}' (ID INT NOT NULL, GUILDID CHAR (25) NOT NULL, data FLOAT NOT NULL, PRIMARY KEY (ID))`);
          break;
        case "Boolean":
          await sql.run(`CREATE TABLE IF NOT EXISTS '${key.toLowerCase()}:${this._default[key].type.toLowerCase()}' (ID INT NOT NULL, GUILDID CHAR (25) NOT NULL, data BIT NOT NULL, PRIMARY KEY (ID))`);
          break;
        // no default
      }
    }

  }


  fetch(guild) {
    const someSettings = {};
    return super.fetch(guild, someSettings);
  }
}

module.exports = SQL;
