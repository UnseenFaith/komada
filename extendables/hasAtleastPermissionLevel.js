exports.conf = {
  type: "method",
  method: "hasAtleastPermissionLevel",
  appliesTo: ["Message"],
};

exports.extend = function (min) {
  return !!this.client.funcs.checkPerms(this.client, this, min);
};
