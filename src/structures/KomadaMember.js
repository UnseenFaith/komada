const { Structures, GuildMember } = require("discord.js");

class KomadaMember extends GuildMember {

  constructor(...args) {
    super(...args);
    this.lastCommand = null;
  }

}

Structures.extend("GuildMember", () => KomadaMember);

module.exports = KomadaMember;
