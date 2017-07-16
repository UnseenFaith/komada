exports.conf = {
  type: "get",
  method: "cmd",
  appliesTo: ["Message"],
};

// eslint-disable-next-line func-names
exports.extend = function () {
  return this.client.commands.get(this.content.slice(this.prefixLength).split(" ")[0].toLowerCase()) || this.client.commands.get(this.aliases.get(this.content.slice(this.prefixLength).split(" ")[0].toLowerCase())) || null;
};
