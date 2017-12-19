const { Structures, TextChannel } = require("discord.js");

class KomadaTextChannel extends TextChannel {

  constructor(...args) {
    super(...args);
    this.message = null;
  }

}

Structures.extend("TextChannel", () => KomadaTextChannel);

module.exports = KomadaTextChannel;
