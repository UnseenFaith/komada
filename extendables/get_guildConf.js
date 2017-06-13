exports.conf = {
  type: "get",
  method: "guildConf",
  appliesTo: ["Message"],
};

// eslint-disable-next-line func-names
exports.extend = function () {
  return this.client.settingGateway.get(this.guild.id);
};
