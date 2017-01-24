module.exports = (client, msg, cmd, args, selective = false) => new Promise((resolve, reject) => {
  let usage;
  const priority = client.commandInhibitors.array();
  const sorted = priority.sort((a, b) => a.conf.priority < b.conf.priority);
  sorted.forEach((inhib) => {
    if (!cmd.conf.spamProtection && !selective) {
      inhib.run(client, msg, cmd, args)
      .then((value) => {
        if (value) usage = value;
      })
      .catch((error) => {
        reject(error);
      });
    }
  });
  setTimeout(() => { resolve(usage); }, 1);
});
