module.exports = (client, msg, cmd, notSpam = false) => {
  return new Promise ((resolve, reject) => {
    let mps = [true];
    client.commandInhibitors.forEach(mProc => {
      if (!mProc.conf.spamProtection || !notSpam) {
        mps.push(mProc.run(client, msg, cmd));
      }
    });
    Promise.all(mps)
    .then(value => {
      resolve(value);
    }, reason => {
      reject(reason);
    });
  });
};
