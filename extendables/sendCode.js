exports.conf = {
  type: "method",
  method: "sendCode",
  appliesTo: ["Message", "TextChannel", "DMChannel", "GroupDMChannel"],
};

// eslint-disable-next-line func-names
exports.extend = function (lang, content, options = {}) {
  return this.sendMessage(content, Object.assign(options, { code: lang }));
};
