const { Structures, User } = require("discord.js");

class KomadaUser extends User {

  constructor(...args) {
    super(...args);
    this.lastCommand = null;
  }

}

Structures.extend("User", () => KomadaUser);

module.exports = KomadaUser;
