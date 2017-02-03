module.exports = (client, msg, usage = false) => {
  const prefix = this.getPrefix(client, msg);
  if (!prefix) return;
  const prefixLength = this.getLength(client, msg, prefix);
  if (usage) return prefixLength;
  return msg.content.slice(prefixLength).split(" ")[0].toLowerCase();
};

exports.getLength = (client, msg, prefix) => {
  if (client.config.prefixMention === prefix) {
    return prefix.exec(msg.content)[0].length + 1;
  }
  return prefix.exec(msg.content)[0].length;
};

exports.getPrefix = (client, msg) => {
  if (client.config.prefixMention.test(msg.content)) {
    return client.config.prefixMention;
  }
  const prefix = msg.guildConf.prefix;
  if (prefix instanceof Array) {
    prefix.forEach((prefix) => {
      if (msg.content.startsWith(prefix)) prefix = RegExp(`^${prefix}`);
      prefix = false;
    });
    return prefix;
  }
  if (msg.content.startsWith(prefix)) return new RegExp(`^${prefix}`); // eslint-disable-line
  return false;
};
