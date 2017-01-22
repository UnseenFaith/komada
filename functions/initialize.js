module.exports = async (client) => {
  for (const func in client.funcs) {
    if (client.funcs[func].init) await client.funcs[func].init(client);
  }
  for (const prov of client.providers.values()) {
    if (prov.init) await prov.init(client);
  }
  client.configuration.initialize(client);
  for (const inhib of client.commandInhibitors.values()) {
    if (inhib.init) await inhib.init(client);
  }
  for (const mon of client.messageMonitors.values()) {
    if (mon.init) await mon.init(client);
  }
  for (const cmd of client.commands.values()) {
    if (cmd.init) await cmd.init(client);
  }
};
