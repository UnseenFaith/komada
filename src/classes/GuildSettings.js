const SettingGateway = require("./settingGateway");

module.exports = class GuildSettings extends SettingGateway {

  constructor(client) {
    super(client, "guilds");
  }

  async validate(guild) {
    const result = await this.resolver.guild(guild);
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

};
