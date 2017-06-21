exports.conf = {
  type: "method",
  method: "send",
  appliesTo: ["Message"],
};

// eslint-disable-next-line func-names
exports.extend = function (content, options) {
  return this.sendMessage(content, options);
};
