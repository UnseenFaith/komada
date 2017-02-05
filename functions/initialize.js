module.exports = async (client) => {
  Object.keys(client.funcs).forEach(async (func) => {
    if (client.funcs[func].init) await client.funcs[func].init(client);
  });
  client.providers.forEach(async (prov) => {
    if (prov.init) await prov.init(client);
  });
  await client.configuration.initialize(client);
  client.commandInhibitors.forEach(async (inhib) => {
    if (inhib.init) await inhib.init(client);
  });
  client.messageMonitors.forEach(async (mon) => {
    if (mon.init) await mon.init(client);
  });
  client.commands.forEach(async (cmd) => {
    if (cmd.init) await cmd.init(client);
  });
};
