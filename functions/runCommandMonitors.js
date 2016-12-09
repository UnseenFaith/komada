module.exports = (client, msg) => new Promise((resolve, reject) => {
  const mps = [true];
  client.commandMonitors.forEach((mProc) => {
    if (mProc.conf.enabled) {
      mps.push(mProc.run(client, msg));
    }
  });
  Promise.all(mps)
      .then((value) => {
        resolve(value);
      }, (reason) => {
        reject(reason);
      });
});
