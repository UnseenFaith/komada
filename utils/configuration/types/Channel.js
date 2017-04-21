const Discord = require("discord.js");

class Channel {
  constructor(conf, data) {
    Object.defineProperty(this, "_id", { value: conf._id });
    Object.defineProperty(this, "_dataDir", { value: conf._dataDir });
    Object.defineProperty(this, "_client", { value: conf._client });
    if (data instanceof Discord.Channel) this.data = data;
    if (data instanceof String) {
      if (/^<#\d+>$/.test(data)) data = /^<#\d+>$/.exec(data)[0];
      if (this._client.channels.has(data)) data = this._client.channels.get(data);
      else data = null;
    } else this.data = data;
    this.type = "Channel";
  }
}

module.exports = Channel;
