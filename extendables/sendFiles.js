exports.conf = {
  type: "method",
  method: "sendFiles",
  appliesTo: ["Message", "TextChannel", "DMChannel", "GroupDMChannel"],
};

exports.extend = function (files, content, options = {}) {
  return this.send(content, Object.assign(options, { files }));
};
