exports.conf = {
  type: "get",
  method: "readable",
  appliesTo: ["GroupDMChannel", "DMChannel", "TextChannel"],
};

// eslint-disable-next-line func-names
exports.extend = function () {
  if (!this.guild) return true;
  return this.permissionsFor(this.guild.member(this.client.user)).has("READ_MESSAGES");
};
