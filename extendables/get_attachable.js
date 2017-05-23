exports.conf = {
  type: "get",
  method: "attachable",
  appliesTo: ["GroupDMChannel", "DMChannel", "TextChannel"],
};

exports.extend = function () {
  if (!this.guild) return true;
  return this.readable && this.postable && this.permissionsFor(this.guild.member(this.client.user)).has("ATTACH_FILES");
};
