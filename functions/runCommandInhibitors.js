module.exports = (client, msg, cmd, args, selective = false) => new Promise((resolve, reject) => {
  let usage;
  const priority = client.commandInhibitors.array();
  const sorted = priority.sort((a, b) => a.conf.priority < b.conf.priority);
  sorted.some((inhib) => { // eslint-disable-line
    if (!inhib.conf.spamProtection && (!selective && inhib.conf.enabled)) {
      inhib.run(client, msg, cmd, args)
      .then((value) => {
        if (value) usage = value;
      })
      .catch((error) => {
        reject(error);
        return true;
      });
    }
  });
  setTimeout(() => { resolve(usage); }, 1);
});
