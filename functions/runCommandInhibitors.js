module.exports = (client, msg, cmd, args, selective = false) => new Promise((resolve, reject) => {
  const mps = [true];
  let i = 1;
  let usage;
  client.commandInhibitors.forEach((mProc, key) => {
    if (key === "usage") usage = i;
    if (!mProc.conf.spamProtection || !selective) {
      mps.push(mProc.run(client, msg, cmd, args));
    }
    i++;
  });
  Promise.all(mps)
      .then((value) => {
        resolve(value[usage]);
      }, (reason) => {
        reject(reason);
      });
});
