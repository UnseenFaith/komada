exports.conf = {
  type: "get",
  method: "guildConf",
  appliesTo: ["Message"],
};

// eslint-disable-next-line func-names
exports.extend = function () {
  if (!this.guild) return this.client.settingGateway.defaults;
  return this.guild.conf;
};
