const Config = require("../Config.js");
const Discord = require("discord.js");

/* eslint-disable no-underscore-dangle, no-throw-literal */
class Channel {
  constructor(conf, data) {
    Object.defineProperty(this, "_guild", { value: conf._guild });
    Object.defineProperty(this, "_dataDir", { value: conf._dataDir });
    Object.defineProperty(this, "_client", { value: conf._client });
    this.type = "Channel";
    if (data instanceof Discord.Channel) this._data = data.id;
    if (typeof data === "string") {
      if (/^<#\d+>$/.test(data)) data = /^<#\d+>$/.exec(data)[0];
      const dataChannel = this._client.channels.get(data);
      if (dataChannel) this._data = dataChannel.id;
      else this._data = null;
    } else { this._data = null; }
  }

  get data() {
    return this._client.channels.get(this._data);
  }

  set data(channel) {
    if (channel instanceof Discord.Channel) this._data = channel;
    if (typeof data === "string") {
      if (/^<#\d+>$/.test(channel)) channel = /^<#\d+>$/.exec(channel)[0];
      const dataChannel = this._client.channels.get(channel);
      if (dataChannel) this._data = channel;
      else this._data = null;
    } else { this._data = channel; }
    Config.save(this._dataDir, this._guild.id);
    return this;
  }
}

module.exports = Channel;
