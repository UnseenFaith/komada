exports.conf = {
  type: "get",
  method: "conf",
  appliesTo: ["Guild"],
};

// eslint-disable-next-line func-names
exports.extend = function () {
  return this.client.configuration.get(this);
};
