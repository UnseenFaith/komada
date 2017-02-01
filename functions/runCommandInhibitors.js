
module.exports = (client, msg, cmd, selective = false) => new Promise(async (resolve, reject) => {
  let usage;
  let count = 0;
  const inhibitors = client.commandInhibitors.array().sort((a, b) => a.conf.priority < b.conf.priority);
  inhibitors.some((inhib) => {
    usage = inhib.run(client, msg, cmd);
    count++;
    if (usage) return true;
  });
  if (usage) return reject(usage);
  try {
    usage = await client.funcs.usage.run(client, msg, cmd);
  } catch (err) {
    return reject(err);
  }
  resolve(usage);
});
