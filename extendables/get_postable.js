exports.conf = {
  type: "get",
  method: "postable",
  appliesTo: ["GroupDMChannel", "DMChannel", "TextChannel"],
};

// eslint-disable-next-line func-names
exports.extend = function () {
  if (!this.guild) return true;
  return this.readable && this.permissionsFor(this.guild.member(this.client.user)).has("SEND_MESSAGES");
};
