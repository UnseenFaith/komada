module.exports = (client) => {
  for (const func in client.funcs) {
    if (client.funcs[func].init) client.funcs[func].init(client);
  }
  client.providers.forEach((prov) => {
    if (prov.init) prov.init(client);
  });
  client.configuration.initialize(client);
  client.commandInhibitors.forEach((inhib) => {
    if (inhib.init) inhib.init(client);
  });
  client.messageMonitors.forEach((mon) => {
    if (mon.init) mon.init(client);
  });
  client.commands.forEach((cmd) => {
    if (cmd.init) cmd.init(client);
  });
};
