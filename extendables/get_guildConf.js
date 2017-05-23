exports.conf = {
  type: "get",
  method: "guildConf",
  appliesTo: ["Message"],
};

exports.extend = function () {
  return this.client.configuration.get(this.guild);
};
