module.exports = (client, msg, cmd, args, selective = false) => new Promise((resolve, reject) => {
  let usage;
  const priority = client.commandInhibitors.array();
  const sorted = priority.sort((a, b) => a.conf.priority < b.conf.priority);
  sorted.some((inhib) => { // eslint-disable-line
    if (!selective && inhib.conf.enabled) {
      inhib.run(client, msg, cmd, args)
      .then((params) => {
        if (params) usage = params;
      })
      .catch((err) => {
        if (err) {
          reject(err);
          return true;
        }
      });
    }
  });
  return setTimeout(() => { resolve(usage); }, 1);
});
