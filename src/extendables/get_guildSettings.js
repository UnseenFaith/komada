exports.conf = {
  type: "get",
  method: "guildSettings",
  appliesTo: ["Message"],
};

// eslint-disable-next-line func-names
exports.extend = function () {
  return this.guild ? this.guild.settings : this.client.settings.guilds.schema.defaults;
};
