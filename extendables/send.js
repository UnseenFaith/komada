exports.conf = {
  type: "method",
  method: "send",
  appliesTo: ["Message"],
};

exports.extend = function (content = "", options = {}) {
  return this.sendMessage(content, options);
};
