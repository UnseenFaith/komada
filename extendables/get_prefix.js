exports.conf = {
  type: "get",
  method: "prefix",
  appliesTo: ["Message"],
};

// eslint-disable-next-line func-names
exports.extend = function () {
  return this.client.funcs.getPrefix(this.client, this) || null;
};
