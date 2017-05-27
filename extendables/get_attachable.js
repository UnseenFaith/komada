exports.conf = {
  type: "get",
  method: "attachable",
  appliesTo: ["GroupDMChannel", "DMChannel", "TextChannel"],
};

// eslint-disable-next-line func-names
exports.extend = function () {
  if (!this.guild) return true;
  return this.readable && this.postable && this.permissionsFor(this.guild.member(this.client.user)).has("ATTACH_FILES");
};
