
module.exports = (client, msg, cmd, selective = false) => new Promise(async (resolve, reject) => {
  let usage;
  const inhibitors = client.commandInhibitors.array().sort((a, b) => a.conf.priority < b.conf.priority);
  inhibitors.some((inhib) => {
    usage = inhib.run(client, msg, cmd);
    if (usage) return true;
    return false;
  });
  if (usage) return reject(usage);
  if (selective) {
    try {
      usage = await client.funcs.usage.run(client, msg, cmd);
    } catch (err) {
      return reject(err);
    }
  }
  return resolve(usage);
});
