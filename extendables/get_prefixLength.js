exports.conf = {
  type: "get",
  method: "prefixLength",
  appliesTo: ["Message"],
};

// eslint-disable-next-line func-names
exports.extend = function () {
  return this.prefix ? this.client.config.prefixMention === this.prefix ? this.prefix.exec(this.content)[0] + 1 : this.prefix.exec(this.content)[0].length : null;
};
