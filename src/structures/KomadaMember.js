const { Structures, GuildMember } = require("discord.js");

class KomadaMember extends GuildMember {

  constructor(...args) {
    super(...args);
    this.test123 = true;
  }

}

Structures.extend("GuildMember", () => KomadaMember); // eslint-disable-line

module.exports = KomadaMember;
