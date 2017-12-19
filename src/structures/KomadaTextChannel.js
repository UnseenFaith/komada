const { Structures, TextChannel } = require("discord.js");

class KomadaTextChannel extends TextChannel {

  constructor(...args) {
    super(...args);
    this.message = null;
  }

}

Structures.extend("User", () => KomadaTextChannel);

module.exports = KomadaTextChannel;
