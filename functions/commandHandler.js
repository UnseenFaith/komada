module.exports = (client, msg) => {
  let thisPrefix;
  if (msg.guildConf.prefix instanceof Array) {
    msg.guildConf.prefix.forEach((prefix) => {
      if (msg.content.startsWith(prefix)) thisPrefix = prefix;
      else thisPrefix = prefix[0];
    });
  } else {
    thisPrefix = msg.guildConf.prefix;
  }
  if (!msg.content.startsWith(thisPrefix) && client.config.prefixMention && !client.config.prefixMention.test(msg.content)) return false;
  let prefixLength = thisPrefix.length;
  if (client.config.prefixMention && client.config.prefixMention.test(msg.content)) prefixLength = client.config.prefixMention.exec(msg.content)[0].length + 1;
  const command = msg.content.slice(prefixLength).split(" ")[0].toLowerCase();
  let cmd;
  if (client.commands.has(command)) {
    cmd = client.commands.get(command);
  } else if (client.aliases.has(command)) {
    cmd = client.commands.get(client.aliases.get(command));
  }
  if (!cmd) return false;
  return cmd;
};
