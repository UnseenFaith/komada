exports.conf = {
  type: "method",
  method: "sendEmbed",
  appliesTo: ["Message", "TextChannel", "DMChannel", "GroupDMChannel"],
};

exports.extend = function (embed, content, options) {
  if (!options && typeof content === "object") {
    options = content;
    content = "";
  } else if (!options) {
    options = {};
  }
  return this.sendMessage(content, Object.assign(options, { embed }));
};
