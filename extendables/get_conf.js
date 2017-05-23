exports.conf = {
  type: "get",
  method: "conf",
  appliesTo: ["Guild"],
};

exports.extend = function () {
  return this.client.configuration.get(this);
};
