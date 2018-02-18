exports.conf = {
  type: "method",
  method: "sendMessage",
  appliesTo: ["TextChannel", "DMChannel", "GroupDMChannel"],
};

// eslint-disable-next-line func-names
exports.extend = function (content, options) {
  if (!this.channel) return this.send(content, options);
  const commandMessage = this.client.commandMessages.get(this.id);
  if (commandMessage && (!options || !("files" in options))) return commandMessage.response.edit(content, options);
  return this.channel.send(content, options)
    .then((mes) => {
      if (mes.constructor.name === "Message" && (!options || !("files" in options))) this.client.commandMessages.set(this.id, { trigger: this, response: mes });
      return mes;
    });
};
