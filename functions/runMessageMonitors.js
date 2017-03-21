module.exports = (client, msg) => {
  client.messageMonitors.forEach((monit) => {
    if (monit.conf.enabled) {
      if (monit.ignoreBots && msg.author.bot) return;
      if (monit.ignoreSelf && client.user === msg.author) return;
      monit.run(client, msg);
    }
  });
};
