exports.run = async (client, msg, [type, name]) => {
  type = client.funcs.toTitleCase(type);
  if (name === "all") {
    await client.funcs[`_load${type}`]();
    switch (type) {
      case "Function":
        await Promise.all(Object.keys(client.funcs).map((key) => {
          if (client.funcs[key].init) return client.funcs[key].init(client);
          return true;
        }));
        break;

      case "Inhibitor":
        await Promise.all(client.commandInhibitors.map((piece) => {
          if (piece.init) return piece.init(client);
          return true;
        }));
        break;

      case "Finalizer":
        await Promise.all(client.commandFinalizers.map((piece) => {
          if (piece.init) return piece.init(client);
          return true;
        }));
        break;

      case "Monitor":
        await Promise.all(client.messageMonitors.map((piece) => {
          if (piece.init) return piece.init(client);
          return true;
        }));
        break;

      case "Provider":
        await Promise.all(client.providers.map((piece) => {
          if (piece.init) return piece.init(client);
          return true;
        }));
        break;

      case "Command":
        await Promise.all(client.commands.map((piece) => {
          if (piece.init) return piece.init(client);
          return true;
        }));
        break;
      // no default
    }
    return msg.sendMessage(`✅ Reloaded all ${type}s`);
  }
  const mes = await msg.sendMessage(`Attemping to reload ${type} ${name}`);
  return client.funcs[`_reload${type}`](name)
    .then(() => mes.edit(`✅ Successfully reloaded ${name}`))
    .catch(err => mes.edit(`❌ ${err}`));
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: ["r", "load"],
  permLevel: 10,
  botPerms: ["SEND_MESSAGES"],
  requiredFuncs: [],
  requiredSettings: [],
};

exports.help = {
  name: "reload",
  description: "Reloads the command file, if it's been updated or modified.",
  usage: "<function|inhibitor|finalizer|monitor|provider|event|command> <name:str>",
  usageDelim: " ",
};
