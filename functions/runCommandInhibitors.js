module.exports = (client, msg, cmd) => new Promise((resolve, reject) => {
  let usage;
  const priority = client.commandInhibitors.array();
  const sorted = priority.sort((a, b) => a.conf.priority > b.conf.priority);
  sorted.forEach((inhib) => {
    inhib.run(client, msg, cmd)
      .then((value) => {
        if (value) usage = value;
      })
      .catch((error) => {
        reject(error);
      });
  });
  resolve(usage);
});
