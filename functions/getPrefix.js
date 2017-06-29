module.exports = async (client, msg) => {
  if (client.config.prefixMention.test(msg.content)) return client.config.prefixMention;
  const { prefix } = msg.guildSettings;
  const { regExpEsc } = client.funcs;
  if (prefix instanceof Array) {
    for (let i = 0; i < prefix.length; i++) {
      if (!msg.content.startsWith(prefix[i])) continue;
      return new RegExp(`^${regExpEsc(prefix[i])}`);
    }
  }
  if (prefix && msg.content.startsWith(prefix)) return new RegExp(`^${regExpEsc(prefix)}`);
  return false;
};
