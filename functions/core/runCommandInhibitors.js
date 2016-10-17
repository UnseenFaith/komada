module.exports = (client, msg, cmd, selective = false) => {
  return new Promise ((resolve, reject) => {
    let mps = [true];
    let i = 1;
    let usage;
    client.commandInhibitors.forEach((mProc, key) => {
      if (key === "usage") usage = i;
      if (!mProc.conf.spamProtection || !selective) {
        mps.push(mProc.run(client, msg, cmd));
      }
      i++;
    });
    Promise.all(mps)
    .then(value => {
      resolve(value[usage]);
    }, reason => {
      reject(reason);
    });
  });
};
