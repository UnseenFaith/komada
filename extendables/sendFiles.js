exports.conf = {
  type: "method",
  method: "sendFiles",
  appliesTo: ["TextChannel", "DMChannel", "GroupDMChannel"],
};

// eslint-disable-next-line func-names
exports.extend = function (files, content, options = {}) {
  return this.send(content, Object.assign(options, { files }));
};
