exports.conf = {
  type: "method",
  method: "sendFile",
  appliesTo: ["TextChannel", "DMChannel", "GroupDMChannel"],
};

// eslint-disable-next-line func-names
exports.extend = function (attachment, name, content, options = {}) {
  return this.send({ files: [{ attachment, name }], content, options });
};
