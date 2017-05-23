exports.conf = {
  type: "method",
  method: "sendFile",
  appliesTo: ["Message", "TextChannel", "DMChannel", "GroupDMChannel"],
};

exports.extend = function (attachment, name, content, options = {}) {
  return this.send({ files: [{ attachment, name }], content, options });
};
