module.exports = (client, msg, cmd, args, selective = false) => new Promise((resolve, reject) => {
  let usage;
  let error;
  const priority = client.commandInhibitors.array();
  const sorted = priority.sort((a, b) => a.conf.priority < b.conf.priority);
  sorted.some((inhib) => { // eslint-disable-line
    if (!msg.cmdInhibited) {
      if (!selective && inhib.conf.enabled) {
        inhib.run(client, msg, cmd, args)
        .then((value) => {
          if (value) usage = value;
        })
        .catch((err) => {
          if (err) {
            error = err;
            msg.cmdInhibited = true;
          }
        });
      }
    } else {
      return true;
    }
  });
  if (msg.cmdInhibited) return setTimeout(() => { reject(error); }, 1);
  return setTimeout(() => { resolve(usage); }, 1);
});
