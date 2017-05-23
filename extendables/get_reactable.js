exports.conf = {
  type: "get",
  method: "reactable",
  appliesTo: ["Message"],
};

exports.extend = function () {
  if (!this.guild) return true;
  return this.readable && this.permissionsFor(this.guild.member(this.client.user)).has("ADD_REACTIONS");
};
